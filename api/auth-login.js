// API handler for /api/auth/login
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Data file paths
const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const TOKENS_FILE = path.join(DATA_DIR, 'tokens.json');

// Hash password
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Generate a random token
function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Get users from the database
function getUsers() {
  if (!fs.existsSync(USERS_FILE)) {
    // Create directory if it doesn't exist
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    
    // Create default users
    const defaultUsers = [
      {
        id: '57ecae66-fe5e-4c89-9296-5a31240a6a31',
        email: 'admin@example.com',
        password: hashPassword('Password123!'),
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        isActive: true
      },
      {
        id: 'e8fd159b-57c4-4d36-9bd7-a59ca13057bb',
        email: 'test@example.com',
        password: hashPassword('Password123!'),
        firstName: 'Test',
        lastName: 'User',
        role: 'user',
        isActive: true
      }
    ];
    
    fs.writeFileSync(USERS_FILE, JSON.stringify(defaultUsers, null, 2));
    return defaultUsers;
  }
  
  return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
}

// Get tokens from the database
function getTokens() {
  if (!fs.existsSync(TOKENS_FILE)) {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    
    fs.writeFileSync(TOKENS_FILE, JSON.stringify([], null, 2));
    return [];
  }
  
  return JSON.parse(fs.readFileSync(TOKENS_FILE, 'utf8'));
}

// Save a token
function saveToken(token, userId) {
  const tokens = getTokens();
  tokens.push({
    token,
    userId,
    createdAt: new Date().toISOString()
  });
  fs.writeFileSync(TOKENS_FILE, JSON.stringify(tokens, null, 2));
}

// Find user by email
function findUserByEmail(email) {
  const users = getUsers();
  return users.find(user => user.email === email);
}

// API handler
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      status: 'error',
      message: 'Method not allowed'
    });
  }
  
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Email and password are required'
      });
    }
    
    // Find user
    const user = findUserByEmail(email);
    
    // Check credentials
    if (!user || user.password !== hashPassword(password)) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid login credentials'
      });
    }
    
    // Generate and save token
    const token = generateToken();
    saveToken(token, user.id);
    
    // Return user data (without password)
    const userData = { ...user };
    delete userData.password;
    
    return res.status(200).json({
      status: 'success',
      data: {
        success: true,
        data: {
          ...userData,
          token
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Server error during login'
    });
  }
} 
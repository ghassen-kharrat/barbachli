// API handler for /api/auth/check
const fs = require('fs');
const path = require('path');

// Data file paths
const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const TOKENS_FILE = path.join(DATA_DIR, 'tokens.json');

// Get users from the database
function getUsers() {
  if (!fs.existsSync(USERS_FILE)) {
    return [];
  }
  
  return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
}

// Get tokens from the database
function getTokens() {
  if (!fs.existsSync(TOKENS_FILE)) {
    return [];
  }
  
  return JSON.parse(fs.readFileSync(TOKENS_FILE, 'utf8'));
}

// Find user by token
function findUserByToken(token) {
  const tokens = getTokens();
  const tokenRecord = tokens.find(t => t.token === token);
  if (!tokenRecord) return null;
  
  const users = getUsers();
  return users.find(user => user.id === tokenRecord.userId);
}

// API handler
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({
      status: 'error',
      message: 'Method not allowed'
    });
  }
  
  try {
    // Get authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'No token provided'
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Find user by token
    const user = findUserByToken(token);
    
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid token'
      });
    }
    
    // Return user data (without password)
    const userData = { ...user };
    delete userData.password;
    
    return res.status(200).json({
      status: 'success',
      data: {
        authenticated: true,
        user: userData
      }
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Server error during authentication check'
    });
  }
} 
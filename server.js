// Simple authentication server with file-based storage
const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const cors = require('cors');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Create data directory if it doesn't exist
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Define database files
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const TOKENS_FILE = path.join(DATA_DIR, 'tokens.json');

// Initialize database
function initDatabase() {
  // Create users file if it doesn't exist
  if (!fs.existsSync(USERS_FILE)) {
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
    console.log('Created default users file');
  }

  // Create tokens file if it doesn't exist
  if (!fs.existsSync(TOKENS_FILE)) {
    fs.writeFileSync(TOKENS_FILE, JSON.stringify([], null, 2));
    console.log('Created tokens file');
  }
}

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

// Find user by token
function findUserByToken(token) {
  const tokens = getTokens();
  const tokenRecord = tokens.find(t => t.token === token);
  if (!tokenRecord) return null;
  
  const users = getUsers();
  return users.find(user => user.id === tokenRecord.userId);
}

// Add a new user
function addUser(userData) {
  const users = getUsers();
  const newUser = {
    id: crypto.randomUUID(),
    ...userData,
    isActive: true
  };
  
  users.push(newUser);
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  return newUser;
}

// Middleware
app.use(express.json());

// Configure CORS - very important for cross-domain requests
app.use(cors({
  origin: ['https://barbachli.vercel.app', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
}));

// Request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Error handler middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error'
  });
});

// Main API endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: "API fonctionne correctement",
    version: "1.0.0",
    database: "File-based",
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'success',
    message: 'Server is running'
  });
});

// Login route
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Email and password are required'
      });
    }
    
    const user = findUserByEmail(email);
    
    if (!user || user.password !== hashPassword(password)) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }
    
    // Generate and save token
    const token = generateToken();
    saveToken(token, user.id);
    
    // Return user data (without password)
    const userData = { ...user };
    delete userData.password;
    
    return res.json({
      success: true,
      data: {
        ...userData,
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Server error during login'
    });
  }
});

// Auth check route
app.get('/api/auth/check', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'No token provided'
      });
    }
    
    const token = authHeader.split(' ')[1];
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
    
    return res.json({
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
});

// Register route
app.post('/api/auth/register', (req, res) => {
  try {
    const { firstName, lastName, email, password, confirmPassword } = req.body;
    
    // Validate input
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        status: 'error',
        message: 'All fields are required'
      });
    }
    
    if (password !== confirmPassword) {
      return res.status(400).json({
        status: 'error',
        message: 'Passwords do not match'
      });
    }
    
    // Check if user already exists
    const existingUser = findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'User with this email already exists'
      });
    }
    
    // Create new user
    const newUser = addUser({
      email,
      password: hashPassword(password),
      firstName,
      lastName,
      role: 'user'
    });
    
    // Generate and save token
    const token = generateToken();
    saveToken(token, newUser.id);
    
    // Return user data (without password)
    const userData = { ...newUser };
    delete userData.password;
    
    return res.status(201).json({
      status: 'success',
      data: {
        ...userData,
        token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Server error during registration'
    });
  }
});

// Profile route
app.get('/api/auth/profile', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'No token provided'
      });
    }
    
    const token = authHeader.split(' ')[1];
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
    
    return res.json({
      status: 'success',
      data: userData
    });
  } catch (error) {
    console.error('Profile error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Server error while fetching profile'
    });
  }
});

// Mock carousel data for backup
app.get('/api/carousel', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 1,
        title: "Nouvelle Collection",
        subtitle: "Découvrez nos dernières nouveautés",
        imageUrl: "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?ixlib=rb-4.0.3",
        linkUrl: "/products"
      },
      {
        id: 2,
        title: "Promotions d'été",
        subtitle: "Jusqu'à 50% de réduction",
        imageUrl: "https://images.unsplash.com/photo-1556742031-c6961e8560b0?ixlib=rb-4.0.3",
        linkUrl: "/products?discount=true"
      }
    ]
  });
});

// Mock banner data for backup
app.get('/api/banner', (req, res) => {
  res.json({
    success: true,
    data: {
      id: 1,
      title: "Offre Spéciale",
      subtitle: "Livraison gratuite pour toute commande supérieure à 50€",
      backgroundColor: "#FFC107",
      textColor: "#000000",
      isActive: true
    }
  });
});

// Catch-all for undefined routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Endpoint not found'
  });
});

// Initialize database
initDatabase();

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`http://localhost:${PORT}/api/health`);
  console.log('\nTest credentials:');
  console.log('- Admin: admin@example.com / Password123!');
  console.log('- User: test@example.com / Password123!');
}); 
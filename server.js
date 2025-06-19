// Simple authentication server with file-based storage - Updated for Render deployment
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
const CART_FILE = path.join(DATA_DIR, 'cart.json');

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
        isActive: true,
        created_at: new Date().toISOString()
      },
      {
        id: 'e8fd159b-57c4-4d36-9bd7-a59ca13057bb',
        email: 'test@example.com',
        password: hashPassword('Password123!'),
        firstName: 'Test',
        lastName: 'User',
        role: 'user',
        isActive: true,
        created_at: new Date().toISOString()
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
  
  // Create empty cart file if it doesn't exist
  if (!fs.existsSync(CART_FILE)) {
    fs.writeFileSync(CART_FILE, JSON.stringify({}, null, 2));
    console.log('Created cart file');
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
    isActive: true,
    created_at: new Date().toISOString()
  };
  
  users.push(newUser);
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  return newUser;
}

// Get user cart
function getUserCart(userId) {
  if (!fs.existsSync(CART_FILE)) {
    return { items: [], total: 0 };
  }
  
  const carts = JSON.parse(fs.readFileSync(CART_FILE, 'utf8'));
  return carts[userId] || { items: [], total: 0 };
}

// Save user cart
function saveUserCart(userId, cart) {
  let carts = {};
  if (fs.existsSync(CART_FILE)) {
    carts = JSON.parse(fs.readFileSync(CART_FILE, 'utf8'));
  }
  
  carts[userId] = cart;
  fs.writeFileSync(CART_FILE, JSON.stringify(carts, null, 2));
}

// Middleware
app.use(express.json());

// Configure CORS - very important for cross-domain requests
app.use(cors({
  origin: ['https://barbachli.vercel.app', 'https://barbachli-fqliwa57g-ghassen-kharrats-projects.vercel.app', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
}));

// Request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Auth middleware to extract user from token
function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }
    
    const token = authHeader.split(' ')[1];
    const user = findUserByToken(token);
    
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    req.user = null;
    next();
  }
}

// Use auth middleware for all routes
app.use(authMiddleware);

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
    
    // Log user role
    console.log(`User logged in - Email: ${email}, Role: ${userData.role}, ID: ${userData.id}`);
    
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
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Not authenticated'
      });
    }
    
    // Return user data (without password)
    const userData = { ...req.user };
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
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Not authenticated'
      });
    }
    
    // Return user data (without password)
    const userData = { ...req.user };
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

// Mock products data - new products
app.get('/api/products', (req, res) => {
  try {
    // Sample mock data
    const products = [
      {
        id: 1,
        name: 'Smartphone XYZ',
        description: 'Latest smartphone with amazing features',
        price: 899.99,
        discountPrice: 799.99,
        hasDiscount: true,
        images: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'],
        category: 'electronics',
        stock: 25,
        createdAt: '2023-05-15T08:30:00Z',
        rating: 4.8
      },
      {
        id: 2,
        name: 'Laptop Pro',
        description: 'Powerful laptop for professionals',
        price: 1499.99,
        discountPrice: null,
        hasDiscount: false,
        images: ['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'],
        category: 'electronics',
        stock: 15,
        createdAt: '2023-05-10T10:15:00Z',
        rating: 4.5
      },
      {
        id: 3,
        name: 'Wireless Headphones',
        description: 'Premium sound quality with noise cancellation',
        price: 299.99,
        discountPrice: 249.99,
        hasDiscount: true,
        images: ['https://images.unsplash.com/photo-1546435770-a3e429dcb388?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'],
        category: 'electronics',
        stock: 30,
        createdAt: '2023-05-20T14:45:00Z',
        rating: 4.7
      },
      {
        id: 4,
        name: 'Smart Watch',
        description: 'Track your fitness and stay connected',
        price: 199.99,
        discountPrice: 179.99,
        hasDiscount: true,
        images: ['https://images.unsplash.com/photo-1546868871-7041f2a55e12?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'],
        category: 'electronics',
        stock: 20,
        createdAt: '2023-05-18T09:30:00Z',
        rating: 4.6
      },
      {
        id: 5,
        name: 'Tablet Mini',
        description: 'Compact tablet for entertainment and productivity',
        price: 399.99,
        discountPrice: 349.99,
        hasDiscount: true,
        images: ['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'],
        category: 'electronics',
        stock: 18,
        createdAt: '2023-05-16T11:20:00Z',
        rating: 4.4
      },
      {
        id: 6,
        name: 'Bluetooth Speaker',
        description: 'Portable speaker with rich bass',
        price: 149.99,
        discountPrice: 129.99,
        hasDiscount: true,
        images: ['https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'],
        category: 'electronics',
        stock: 22,
        createdAt: '2023-05-12T16:40:00Z',
        rating: 4.3
      }
    ];
    
    // Get query parameters
    const limit = parseInt(req.query.limit) || products.length;
    const hasDiscount = req.query.has_discount === 'true';
    const sortBy = req.query.sort_by || 'createdAt';
    const sortDirection = req.query.sort_direction || 'desc';
    
    // Filter products
    let filteredProducts = [...products];
    if (hasDiscount) {
      filteredProducts = filteredProducts.filter(p => p.hasDiscount);
    }
    
    // Sort products
    filteredProducts.sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    // Limit the number of products
    filteredProducts = filteredProducts.slice(0, limit);
    
    res.json({
      status: 'success',
      data: filteredProducts,
      pagination: {
        total: products.length,
        count: filteredProducts.length,
        page: 1,
        pages: 1
      }
    });
  } catch (error) {
    console.error('Products error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching products'
    });
  }
});

// Get/update cart
app.get('/api/cart', (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Not authenticated'
      });
    }
    
    const cart = getUserCart(req.user.id);
    
    return res.json({
      status: 'success',
      data: cart
    });
  } catch (error) {
    console.error('Cart error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Server error while fetching cart'
    });
  }
});

// Add to cart
app.post('/api/cart', (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Not authenticated'
      });
    }
    
    const { productId, quantity } = req.body;
    if (!productId || !quantity || quantity < 1) {
      return res.status(400).json({
        status: 'error',
        message: 'Product ID and quantity are required'
      });
    }
    
    let cart = getUserCart(req.user.id);
    
    // Check if product is already in cart
    const existingItem = cart.items.find(item => item.productId === productId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      // Add new item
      cart.items.push({
        productId,
        quantity,
        addedAt: new Date().toISOString()
      });
    }
    
    // Update cart total (simplified)
    cart.total = cart.items.reduce((total, item) => total + item.quantity * 10, 0);
    
    // Save cart
    saveUserCart(req.user.id, cart);
    
    return res.json({
      status: 'success',
      data: cart
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Server error while updating cart'
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

// Mock categories data
app.get('/api/categories', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 1,
        name: "Electronics",
        slug: "electronics",
        description: "Electronic devices and gadgets",
        parent_id: null,
        children: [
          {
            id: 2,
            name: "Smartphones",
            slug: "smartphones",
            description: "Mobile phones and accessories",
            parent_id: 1
          },
          {
            id: 3,
            name: "Laptops",
            slug: "laptops",
            description: "Notebook computers",
            parent_id: 1
          }
        ]
      },
      {
        id: 4,
        name: "Clothing",
        slug: "clothing",
        description: "Apparel and fashion items",
        parent_id: null,
        children: [
          {
            id: 5,
            name: "Men's Clothing",
            slug: "mens-clothing",
            description: "Clothing for men",
            parent_id: 4
          },
          {
            id: 6,
            name: "Women's Clothing",
            slug: "womens-clothing",
            description: "Clothing for women",
            parent_id: 4
          }
        ]
      }
    ]
  });
});

// Catch-all for undefined routes
app.use('/api/*', (req, res) => {
  console.log(`404 for: ${req.originalUrl}`);
  console.log(`Method: ${req.method}`);
  console.log(`Headers: ${JSON.stringify(req.headers)}`);
  console.log(`Query: ${JSON.stringify(req.query)}`);
  console.log(`Body: ${JSON.stringify(req.body)}`);
  
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
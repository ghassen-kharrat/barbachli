const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
dotenv.config();

// Create Express application
const app = express();

// Get port from command line arguments or environment variables
const args = process.argv.slice(2);
let customPort;
args.forEach(arg => {
  if (arg.startsWith('--port=')) {
    customPort = parseInt(arg.split('=')[1]);
  }
});
const PORT = customPort || process.env.PORT || 5001;

// Middlewares
app.use(cors({
  origin: '*', // Allow all origins temporarily for debugging
  credentials: true
}));
// Increase payload size limit to 50MB for large image uploads
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Create Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'https://iptgkvofawoqvykmkcrk.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlwdGdrdm9mYXdvcXZ5a21rY3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4NjkxMTMsImV4cCI6MjA2NDQ0NTExM30.oUsFpKGgeddXRU5lbaeaufBZ2wV7rnl1a0h2YEfC9b8';
const supabase = createClient(supabaseUrl, supabaseKey);

console.log(`Supabase client initialized with URL: ${supabaseUrl}`);

// Test Supabase connection
(async () => {
  try {
    const { data, error } = await supabase.from('products').select('count');
    if (error) {
      console.error('❌ Supabase connection error:', error);
    } else {
      console.log('✅ Supabase connection successful!');
    }
  } catch (err) {
    console.error('Error testing Supabase connection:', err);
  }
})();

// Auth middleware to extract user from token
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      req.user = null;
      return next();
    }
    
    // Get user details from our users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, role, is_active')
      .eq('email', user.email)
      .single();
    
    if (userError || !userData) {
      req.user = null;
      return next();
    }
    
    req.user = {
      id: userData.id,
      email: userData.email,
      firstName: userData.first_name,
      lastName: userData.last_name,
      role: userData.role,
      isActive: userData.is_active
    };
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    req.user = null;
    next();
  }
};

// Use auth middleware for all routes
app.use(authMiddleware);

// API status endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'API fonctionne correctement',
    version: '1.0.0',
    database: 'Supabase',
    timestamp: new Date()
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'success',
    message: 'Server is running',
    database: 'Supabase',
    timestamp: new Date().toISOString()
  });
});

// PRODUCTS ENDPOINTS

// Get all products
app.get('/api/products', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category, 
      minPrice, 
      maxPrice, 
      search, 
      sortBy = 'created_at',
      sortDirection = 'desc',
      hasDiscount
    } = req.query;
    
    // Build query
    let query = supabase.from('products')
      .select('*, product_images(image_url)', { count: 'exact' });
    
    // Apply filters
    if (category) {
      query = query.or(`category.eq.${category},category.ilike.${category}`);
    }
    
    if (minPrice) {
      query = query.gte('price', minPrice);
    }
    
    if (maxPrice) {
      query = query.lte('price', maxPrice);
    }
    
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,category.ilike.%${search}%`);
    }
    
    if (hasDiscount === 'true') {
      query = query.not('discount_price', 'is', null);
    }
    
    // Calculate pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, Math.min(50, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;
    
    // Apply pagination and sorting
    query = query
      .order(sortBy, { ascending: sortDirection === 'asc' })
      .range(offset, offset + limitNum - 1);
    
    // Execute query
    const { data, error, count } = await query;
    
    if (error) {
      throw error;
    }
    
    // Format response
    const formattedProducts = data.map(product => ({
      ...product,
      images: product.product_images?.map(img => img.image_url) || []
    }));
    
    const totalPages = Math.ceil(count / limitNum);
    
    return res.json({
      status: 'success',
      data: formattedProducts,
      pagination: {
        total: count,
        count: formattedProducts.length,
        page: pageNum,
        pages: totalPages
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des produits'
    });
  }
});

// Get single product by ID
app.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get product with images
    const { data: product, error } = await supabase
      .from('products')
      .select(`
        *,
        product_images(image_url)
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      throw error;
    }
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé'
      });
    }
    
    // Format response
    const formattedProduct = {
      ...product,
      images: product.product_images?.map(img => img.image_url) || []
    };
    
    return res.json({
      success: true,
      data: formattedProduct
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du produit'
    });
  }
});

// CATEGORIES ENDPOINTS

// Get all categories
app.get('/api/categories', async (req, res) => {
  try {
    const { hierarchical } = req.query;
    
    // Get all categories
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .order('display_order', { ascending: true });
    
    if (error) {
      throw error;
    }
    
    // Format for frontend
    let formattedCategories = categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      parent_id: cat.parent_id,
      icon: cat.icon,
      displayOrder: cat.display_order,
      isActive: cat.is_active,
      createdAt: cat.created_at
    }));
    
    // Build hierarchical structure if requested
    if (hierarchical === 'true') {
      const rootCategories = formattedCategories.filter(c => !c.parent_id);
      
      formattedCategories = rootCategories.map(root => {
        const children = formattedCategories.filter(c => c.parent_id === root.id);
        return {
          ...root,
          children
        };
      });
    }
    
    return res.json({
      success: true,
      data: formattedCategories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la récupération des catégories'
    });
  }
});

// AUTHENTICATION ENDPOINTS

// Login user
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Use Supabase auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      return res.status(401).json({
        status: 'error',
        message: error.message || 'Email ou mot de passe incorrect'
      });
    }
    
    // Get user details from our users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, first_name, last_name, role, is_active')
      .eq('email', email)
      .single();
    
    if (userError || !userData) {
      return res.status(401).json({
        status: 'error',
        message: 'Utilisateur non trouvé'
      });
    }
    
    if (!userData.is_active) {
      return res.status(401).json({
        status: 'error',
        message: 'Votre compte a été désactivé'
      });
    }
    
    // Log user role
    console.log(`User logged in - Email: ${email}, Role: ${userData.role}, ID: ${userData.id}`);
    
    return res.json({
      success: true,
      data: {
        id: userData.id,
        firstName: userData.first_name,
        lastName: userData.last_name,
        email: email,
        role: userData.role,
        token: data.session.access_token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la connexion'
    });
  }
});

// Register new user
app.post('/api/auth/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, confirmPassword, phone, address, city, zipCode } = req.body;
    
    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({
        status: 'error',
        message: 'Les mots de passe ne correspondent pas'
      });
    }
    
    // Register user with Supabase auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName
        }
      }
    });
    
    if (authError) {
      return res.status(400).json({
        status: 'error',
        message: authError.message
      });
    }
    
    // Create user record in our database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert([
        {
          email,
          first_name: firstName,
          last_name: lastName,
          role: 'user',
          is_active: true,
          phone: phone || null,
          address: address || null,
          city: city || null,
          zip_code: zipCode || null
        }
      ])
      .select('id, first_name, last_name, email, role')
      .single();
    
    if (userError) {
      console.error('Error creating user record:', userError);
      return res.status(500).json({
        status: 'error',
        message: 'Erreur lors de la création de l\'utilisateur'
      });
    }
    
    return res.status(201).json({
      success: true,
      data: {
        id: userData.id,
        firstName: userData.first_name,
        lastName: userData.last_name,
        email: userData.email,
        role: userData.role,
        token: authData.session?.access_token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Erreur lors de l\'inscription'
    });
  }
});

// Auth check endpoint
app.get('/api/auth/check', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Not authenticated'
      });
    }
    
    return res.json({
      status: 'success',
      data: {
        authenticated: true,
        user: req.user
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

// Profile endpoint
app.get('/api/auth/profile', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Not authenticated'
      });
    }
    
    return res.json({
      status: 'success',
      data: req.user
    });
  } catch (error) {
    console.error('Profile error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Server error while fetching profile'
    });
  }
});

// CART ENDPOINTS

// Get user cart
app.get('/api/cart', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Not authenticated'
      });
    }
    
    // Get cart from database
    const { data: cartData, error: cartError } = await supabase
      .from('cart_items')
      .select(`
        id,
        product_id,
        quantity,
        created_at,
        products:product_id (
          id,
          name,
          price,
          discount_price,
          product_images (image_url)
        )
      `)
      .eq('user_id', req.user.id);
    
    if (cartError) {
      throw cartError;
    }
    
    // Format cart items
    const items = cartData.map(item => ({
      id: item.id,
      productId: item.product_id,
      quantity: item.quantity,
      product: {
        id: item.products.id,
        name: item.products.name,
        price: item.products.price,
        discountPrice: item.products.discount_price,
        image: item.products.product_images?.[0]?.image_url || null
      },
      addedAt: item.created_at
    }));
    
    // Calculate total
    const total = items.reduce((sum, item) => {
      const price = item.product.discountPrice || item.product.price;
      return sum + (price * item.quantity);
    }, 0);
    
    return res.json({
      status: 'success',
      data: {
        items,
        total
      }
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
app.post('/api/cart', async (req, res) => {
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
    
    // Check if product exists
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id')
      .eq('id', productId)
      .single();
    
    if (productError || !product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found'
      });
    }
    
    // Check if item is already in cart
    const { data: existingItem, error: existingError } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('user_id', req.user.id)
      .eq('product_id', productId)
      .single();
    
    let result;
    
    if (existingItem) {
      // Update existing item
      const newQuantity = existingItem.quantity + quantity;
      
      result = await supabase
        .from('cart_items')
        .update({ quantity: newQuantity })
        .eq('id', existingItem.id);
    } else {
      // Add new item
      result = await supabase
        .from('cart_items')
        .insert({
          user_id: req.user.id,
          product_id: productId,
          quantity: quantity
        });
    }
    
    if (result.error) {
      throw result.error;
    }
    
    // Return updated cart
    return await getCart(req, res);
  } catch (error) {
    console.error('Add to cart error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Server error while updating cart'
    });
  }
});

// Helper function to get cart
async function getCart(req, res) {
  // Reuse the GET /api/cart logic
  return await app._router.handle(req, res);
}

// Mock carousel data for backup
app.get('/api/carousel', async (req, res) => {
  try {
    // Try to get carousel from database
    const { data: carouselData, error } = await supabase
      .from('carousel')
      .select('*')
      .order('display_order', { ascending: true });
    
    if (error || !carouselData || carouselData.length === 0) {
      // Fall back to mock data
      return res.json({
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
    }
    
    return res.json({
      success: true,
      data: carouselData
    });
  } catch (error) {
    console.error('Carousel error:', error);
    
    // Fall back to mock data on error
    return res.json({
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
  }
});

// Mock banner data for backup
app.get('/api/banner', async (req, res) => {
  try {
    // Try to get banner from database
    const { data: bannerData, error } = await supabase
      .from('banners')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error || !bannerData) {
      // Fall back to mock data
      return res.json({
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
    }
    
    return res.json({
      success: true,
      data: bannerData
    });
  } catch (error) {
    console.error('Banner error:', error);
    
    // Fall back to mock data on error
    return res.json({
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
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`
🚀 Server running on port ${PORT}
✨ Mode: ${process.env.NODE_ENV || 'development'} (Supabase)
🔗 API URL: http://localhost:${PORT}/api
⌛ Time: ${new Date().toLocaleString()}
  `);
}); 
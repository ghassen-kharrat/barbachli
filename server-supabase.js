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
const PORT = process.env.PORT || 5002;

// Middlewares
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://barbachli.vercel.app', 'https://barbachli-ecommerce.vercel.app'] 
    : 'http://localhost:3000',
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
      items: formattedProducts,
      total: count,
      page: pageNum,
      limit: limitNum,
      totalPages
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
    // Get all categories
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .order('display_order', { ascending: true });
    
    if (error) {
      throw error;
    }
    
    // Format for frontend
    const formattedCategories = categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      parentId: cat.parent_id,
      icon: cat.icon,
      displayOrder: cat.display_order,
      isActive: cat.is_active,
      createdAt: cat.created_at
    }));
    
    return res.json({
      success: true,
      data: formattedCategories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return res.status(500).json({
      success: false,
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
        success: false,
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
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    if (!userData.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Votre compte a été désactivé'
      });
    }
    
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
      success: false,
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
        success: false,
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
        success: false,
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
        success: false,
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
      success: false,
      message: 'Erreur lors de l\'inscription'
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
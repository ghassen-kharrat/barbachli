const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Load environment variables
dotenv.config();

// Create Express application
const app = express();
const PORT = process.env.PORT || 5001;

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

// PostgreSQL Connection
const pool = new Pool(
  process.env.DATABASE_URL 
    ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
    : {
  user: 'postgres',
  password: 'root',
  host: 'localhost',
  port: 5432,
  database: 'ecommerce'
      }
);

// Admin orders handler function
const handleAdminOrders = async (req, res) => {
  try {
    console.log('Admin orders handler called');
    console.log('User:', req.user);
    
    // Validate numerical parameters
    let page = 1;
    if (req.query.page) {
      const parsedPage = parseInt(String(req.query.page));
      if (!isNaN(parsedPage) && parsedPage > 0) {
        page = parsedPage;
      }
    }
    
    let limit = 10;
    if (req.query.limit) {
      const parsedLimit = parseInt(String(req.query.limit));
      if (!isNaN(parsedLimit) && parsedLimit > 0) {
        limit = parsedLimit;
      }
    }
    
    const status = req.query.status;
    const search = req.query.search;
    const offset = (page - 1) * limit;
    
    console.log('Validated query parameters:', { page, limit, status, search, offset });
    
    // Build the query conditions for filtering
    const conditions = [];
    const params = [limit, offset];  // Start with limit and offset parameters
    let paramIndex = 3;  // Next parameter index
    
    if (status && status !== 'all') {
      conditions.push(`o.status = $${paramIndex++}`);
      params.push(status);
    }
    
    if (search) {
      conditions.push(`(o.reference ILIKE $${paramIndex} OR u.first_name ILIKE $${paramIndex} OR u.last_name ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }
    
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    
    // Simplified query to get all orders with filtering
    const ordersQuery = `
      SELECT 
        o.id, o.reference, o.status, o.total_price as "totalPrice",
        o.shipping_address as "shippingAddress", o.shipping_city as "shippingCity",
        o.shipping_zip_code as "shippingZipCode", o.phone_number as "phoneNumber",
        o.created_at as "createdAt", o.updated_at as "updatedAt",
        o.user_id as "userId"
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ${whereClause}
      ORDER BY o.created_at DESC
      LIMIT $1 OFFSET $2
    `;
    
    console.log('Orders query:', ordersQuery);
    console.log('Query parameters:', params);
    
    const { rows: orders } = await pool.query(ordersQuery, params);
    
    // Get total count of orders with the same filters (excluding pagination)
    const countQuery = `
      SELECT COUNT(*) 
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ${whereClause}
    `;
    
    const { rows: countResult } = await pool.query(countQuery, params.slice(2));
    const total = parseInt(countResult[0].count);
    const totalPages = Math.ceil(total / limit);
    
    // Get user information separately
    const userIds = orders.map(o => o.userId).filter(id => id !== null);
    let users = [];
    
    if (userIds.length > 0) {
      const { rows: usersData } = await pool.query(`
        SELECT id, first_name as "firstName", last_name as "lastName", email
        FROM users
        WHERE id = ANY($1)
      `, [userIds]);
      
      users = usersData;
    }
    
    // Format orders to include customer info
    const formattedOrders = orders.map(order => {
      const { userId, ...orderData } = order;
      const user = users.find(u => u.id === userId);
      
      return {
        ...orderData,
        totalPrice: Number(orderData.totalPrice || 0),  // Ensure totalPrice is a number
        customer: user || {
          id: userId,
          firstName: "Client",
          lastName: "Inconnu",
          email: "client@example.com"
        }
      };
    });
    
    const response = {
      success: true,
      data: formattedOrders,
      page,
      limit,
      total,
      totalPages
    };
    
    console.log('Response prepared:', { 
      success: true, 
      count: formattedOrders.length,
      page,
      totalPages 
    });
    
    return res.json(response);
  } catch (dbError) {
    console.error('Database error in admin orders endpoint:', dbError);
    
    // Return a meaningful error for troubleshooting
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des commandes depuis la base de données',
      error: dbError.message
    });
  }
};

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection error:', err.message);
    console.error('The application requires a PostgreSQL database connection to function.');
    process.exit(1);
  } else {
    console.log('✅ Database connected successfully at:', res.rows[0].now);
  }
});

// Initialize database with schema and seed data
const initializeDatabase = async () => {
  try {
    console.log('🔄 Initializing database...');
    
    // Test PostgreSQL connection
    await pool.query('SELECT 1');
    console.log('✅ PostgreSQL connection successful');
    
    // Create tables if not exist
    const schemaSQL = fs.readFileSync(path.join(__dirname, 'database', 'schema.sql'), 'utf8');
    await pool.query(schemaSQL);
    console.log('✅ Database schema initialized');
    
    // Check if we already have users (to avoid duplicate seeds)
    const { rows: users } = await pool.query('SELECT * FROM users LIMIT 1');
    
    if (users.length === 0) {
      console.log('🔄 No users found, loading seed data...');
      
      // Read seed data
      const seedSQL = fs.readFileSync(path.join(__dirname, 'database', 'seed.sql'), 'utf8');
      await pool.query(seedSQL);
      console.log('✅ Seed data loaded successfully');
    } else {
      console.log('ℹ️ Database already has data, skipping seed');
    }
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    console.error('The application requires a PostgreSQL database connection to function.');
    process.exit(1); // Exit the application if database connection fails
  }
};

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Non autorisé'
    });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token invalide'
    });
  }
};

// Role-based authorization middleware
const authorize = (roles = []) => {
  if (typeof roles === 'string') {
    roles = [roles];
  }
  
  return (req, res, next) => {
    if (!req.user || (roles.length && !roles.includes(req.user.role))) {
      return res.status(403).json({
        success: false,
        message: "Accès refusé: vous n'avez pas les permissions nécessaires"
      });
    }
    next();
  };
};

// API status endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'API fonctionne correctement',
    version: '1.0.0',
    database: 'PostgreSQL',
    timestamp: new Date()
  });
});

// PRODUCTS ENDPOINTS
app.get('/api/products', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category, 
      minPrice, 
      maxPrice, 
      search, 
      sortBy = 'createdAt',
      sortDirection = 'desc',
      hasDiscount
    } = req.query;
    
    // Build the query conditions
    let conditions = [];
    const params = [];
    let paramIndex = 1;
    
    if (category) {
      conditions.push(`(p.category = $${paramIndex} OR c.slug = $${paramIndex} OR c.name = $${paramIndex})`);
      params.push(category);
      paramIndex++;
    }
    
    if (minPrice) {
      conditions.push(`COALESCE(p.discount_price, p.price) >= $${paramIndex++}`);
      params.push(Number(minPrice));
    }
    
    if (maxPrice) {
      conditions.push(`COALESCE(p.discount_price, p.price) <= $${paramIndex++}`);
      params.push(Number(maxPrice));
    }
    
    if (search) {
      conditions.push(`(p.name ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex} OR p.category ILIKE $${paramIndex} OR c.name ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }
    
    // Filter for products with discount
    if (hasDiscount === 'true') {
      conditions.push(`p.discount_price IS NOT NULL AND p.discount_price > 0`);
    }
    
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    
    // Validate sort fields
    const validSortFields = ['name', 'price', 'created_at', 'rating', 'discount_price'];
    const actualSortField = sortBy === 'createdAt' ? 'created_at' : 
                           sortBy === 'discountPrice' ? 'discount_price' :
                           (validSortFields.includes(sortBy) ? sortBy : 'created_at');
    const actualSortDirection = sortDirection.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    
    // Special case for price sorting (considering discount)
    const sortClause = actualSortField === 'price' 
      ? `ORDER BY COALESCE(p.discount_price, p.price) ${actualSortDirection}`
      : actualSortField === 'discount_price'
        ? `ORDER BY p.discount_price ${actualSortDirection} NULLS LAST`
        : `ORDER BY p.${actualSortField} ${actualSortDirection}`;
    
    // Count total for pagination
    const countQuery = `
      SELECT COUNT(*) FROM products p
      LEFT JOIN categories c ON LOWER(p.category) = LOWER(c.name)
      ${whereClause}
    `;
    
    const { rows: countResult } = await pool.query(countQuery, params);
    const total = parseInt(countResult[0].count);

    // Calculate pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, Math.min(50, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;
    const totalPages = Math.ceil(total / limitNum);
    
    // Get products with images
    const query = `
      SELECT 
        p.id, p.name, p.description, p.price, p.discount_price AS "discountPrice", p.stock,
        COALESCE(c.name, p.category) AS "category", 
        c.name AS "categoryName", 
        c.slug AS "categorySlug", 
        c.id AS "categoryId", 
        p.rating, p.reviews, 
        p.created_at AS "createdAt", p.updated_at AS "updatedAt",
        ARRAY_AGG(pi.image_url) FILTER (WHERE pi.image_url IS NOT NULL) AS images
      FROM products p
      LEFT JOIN categories c ON LOWER(p.category) = LOWER(c.name)
      LEFT JOIN product_images pi ON p.id = pi.product_id
      ${whereClause}
      GROUP BY p.id, c.id, c.name, c.slug
      ${sortClause}
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;
    
    params.push(limitNum);
    params.push(offset);
    
    const { rows: products } = await pool.query(query, params);
    
    // Replace null image arrays with empty arrays
    const processedProducts = products.map(product => ({
      ...product,
      images: product.images || []
    }));
    
    return res.json({
      items: processedProducts,
      total,
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

app.get('/api/products/:id', async (req, res) => {
  try {
    // Validate product ID
    if (!req.params.id || req.params.id === 'undefined' || req.params.id === 'null') {
      return res.status(400).json({
        success: false,
        message: 'ID de produit manquant ou invalide'
      });
    }
    
    const productId = parseInt(String(req.params.id));
    if (isNaN(productId) || productId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'ID de produit invalide'
      });
    }

    // Get product with images using PostgreSQL
    const { rows } = await pool.query(`
      SELECT 
        p.id, p.name, p.description, p.price, p.discount_price AS "discountPrice", p.stock,
        COALESCE(c.name, p.category) AS "category", c.id AS "categoryId", c.name AS "categoryName", c.slug AS "categorySlug",
        p.rating, p.reviews, 
        p.created_at AS "createdAt", p.updated_at AS "updatedAt",
        ARRAY_AGG(DISTINCT COALESCE(pi.image_url, '')) FILTER (WHERE pi.image_url IS NOT NULL) AS images
      FROM products p
      LEFT JOIN categories c ON LOWER(p.category) = LOWER(c.name)
      LEFT JOIN product_images pi ON p.id = pi.product_id
      WHERE p.id = $1
      GROUP BY p.id, c.id, c.name, c.slug
    `, [productId]);
    
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé'
      });
    }
    
    return res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du produit'
    });
  }
});

// Create new product (admin only)
app.post('/api/products', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    const { name, description, price, discountPrice, stock, category, categoryId, images } = req.body;
    
    // Validate required fields
    if (!name || !description || !price || stock === undefined || !category) {
      return res.status(400).json({
        success: false,
        message: 'Tous les champs obligatoires doivent être renseignés'
      });
    }
    
    let newProductId;
    
    const client = await pool.connect();
    
    try {
      // Start transaction
      await client.query('BEGIN');
      
      // Insert product - remove category_id from the insertion
      const { rows } = await client.query(`
        INSERT INTO products 
        (name, description, price, discount_price, stock, category, rating, reviews)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id`,
        [name, description, price, discountPrice || null, stock, category, 0, 0]
      );
      
      newProductId = rows[0].id;
      
      // Insert product images if provided
      if (images && Array.isArray(images) && images.length > 0) {
        const imageValues = [];
        const imageParams = [];
        let paramIndex = 1;
        
        for (const imageUrl of images) {
          imageValues.push(`($${paramIndex++}, $${paramIndex++})`);
          imageParams.push(newProductId, imageUrl);
        }
        
        await client.query(`
          INSERT INTO product_images (product_id, image_url)
          VALUES ${imageValues.join(', ')}`,
          imageParams
        );
      }
      
      // Commit transaction
      await client.query('COMMIT');
      
      // Get the full product details
      const { rows: productRows } = await client.query(`
        SELECT 
          p.id, p.name, p.description, p.price, p.discount_price AS "discountPrice", p.stock,
          p.category, c.id AS "categoryId", p.rating, p.reviews, 
          p.created_at AS "createdAt", p.updated_at AS "updatedAt",
          c.name AS "categoryName", c.slug AS "categorySlug",
          ARRAY_AGG(COALESCE(pi.image_url, '')) FILTER (WHERE pi.image_url IS NOT NULL) AS images
        FROM products p
        LEFT JOIN product_images pi ON p.id = pi.product_id
        LEFT JOIN categories c ON LOWER(p.category) = LOWER(c.name)
        WHERE p.id = $1
        GROUP BY p.id, c.name, c.slug, c.id`,
        [newProductId]
      );
      
      return res.status(201).json({
        success: true,
        data: productRows[0]
      });
    } catch (error) {
      // Rollback transaction on error
      await client.query('ROLLBACK');
      throw error;
    } finally {
      // Release client back to pool
      client.release();
    }
  } catch (error) {
    console.error('Error creating product:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du produit'
    });
  }
});

// Update product (admin only)
app.put('/api/products/:id', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    // Validate product ID
    if (!req.params.id || req.params.id === 'undefined' || req.params.id === 'null') {
      return res.status(400).json({
        success: false,
        message: 'ID de produit manquant ou invalide'
      });
    }
    
    const productId = parseInt(String(req.params.id));
    if (isNaN(productId) || productId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'ID de produit invalide'
      });
    }
    const { name, description, price, discountPrice, stock, category, categoryId, images } = req.body;
    
    // Build update query dynamically based on provided fields
    const updateFields = [];
    const updateParams = [];
    let paramIndex = 1;
    
    if (name !== undefined) {
      updateFields.push(`name = $${paramIndex++}`);
      updateParams.push(name);
    }
    
    if (description !== undefined) {
      updateFields.push(`description = $${paramIndex++}`);
      updateParams.push(description);
    }
    
    if (price !== undefined) {
      updateFields.push(`price = $${paramIndex++}`);
      updateParams.push(price);
    }
    
    if (discountPrice !== undefined) {
      updateFields.push(`discount_price = $${paramIndex++}`);
      updateParams.push(discountPrice === null ? null : discountPrice);
    }
    
    if (stock !== undefined) {
      updateFields.push(`stock = $${paramIndex++}`);
      updateParams.push(stock);
    }
    
    if (category !== undefined) {
      updateFields.push(`category = $${paramIndex++}`);
      updateParams.push(category);
    }
    
    // Remove category_id update
    
    // Always update the updated_at timestamp
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    
    // Add product ID as the last parameter
    updateParams.push(productId);
    
    // Update product
    if (updateFields.length > 0) {
      await pool.query(`
        UPDATE products 
        SET ${updateFields.join(', ')}
        WHERE id = $${paramIndex}`,
        updateParams
      );
    }
    
    // Update images if provided
    if (images && Array.isArray(images)) {
      // Delete existing images
      await pool.query('DELETE FROM product_images WHERE product_id = $1', [productId]);
      
      // Insert new images
      if (images.length > 0) {
        const imageValues = [];
        const imageParams = [];
        let imageParamIndex = 1;
        
        for (const imageUrl of images) {
          imageValues.push(`($${imageParamIndex++}, $${imageParamIndex++})`);
          imageParams.push(productId, imageUrl);
        }
        
        await pool.query(`
          INSERT INTO product_images (product_id, image_url)
          VALUES ${imageValues.join(', ')}`,
          imageParams
        );
      }
    }
    
    // Get the updated product
    const { rows: productRows } = await pool.query(`
      SELECT 
        p.id, p.name, p.description, p.price, p.discount_price AS "discountPrice", p.stock,
        p.category, c.id AS "categoryId", p.rating, p.reviews, 
        p.created_at AS "createdAt", p.updated_at AS "updatedAt",
        c.name AS "categoryName", c.slug AS "categorySlug",
        ARRAY_AGG(COALESCE(pi.image_url, '')) FILTER (WHERE pi.image_url IS NOT NULL) AS images
      FROM products p
      LEFT JOIN product_images pi ON p.id = pi.product_id
      LEFT JOIN categories c ON LOWER(p.category) = LOWER(c.name)
      WHERE p.id = $1
      GROUP BY p.id, c.name, c.slug, c.id`,
      [productId]
    );
    
    return res.json({
      success: true,
      data: productRows[0]
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du produit'
    });
  }
});

// Delete product (admin only)
app.delete('/api/products/:id', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    // Validate product ID
    if (!req.params.id || req.params.id === 'undefined' || req.params.id === 'null') {
      return res.status(400).json({
        success: false,
        message: 'ID de produit manquant ou invalide'
      });
    }
    
    const productId = parseInt(String(req.params.id));
    if (isNaN(productId) || productId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'ID de produit invalide'
      });
    }
    
    // Delete product images first (foreign key constraint)
    await pool.query('DELETE FROM product_images WHERE product_id = $1', [productId]);
    
    // Delete product
    await pool.query('DELETE FROM products WHERE id = $1', [productId]);
    
    return res.json({
      success: true,
      message: 'Produit supprimé avec succès'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du produit'
    });
  }
});

// AUTHENTICATION ENDPOINTS
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    let user;
    // Always use PostgreSQL
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (rows.length > 0) {
      user = rows[0];
    }
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }
    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Votre compte a été désactivé'
      });
    }
    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }
    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id,
        email: user.email,
        role: user.role
      }, 
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    return res.json({
      success: true,
      data: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        role: user.role,
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur Lors de la connexion'
    });
  }
});

// Register new user endpoint
app.post('/api/auth/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, confirmPassword, username, phone, address, city, zipCode } = req.body;
    
    // Check if email already exists
    let userExists = false;
    
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    userExists = rows.length > 0;
    
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Cet email est déjà utilisé'
      });
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Les mots de passe ne correspondent pas'
      });
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create the new user
    let newUser;
    
    const result = await pool.query(`
      INSERT INTO users (first_name, last_name, email, password, role, phone, address, city, zip_code, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id, first_name, last_name, email, role
    `, [firstName, lastName, email, hashedPassword, 'user', phone || null, address || null, city || null, zipCode || null, true]);
    
    newUser = result.rows[0];
    
    // Generate JWT token
    const token = jwt.sign(
      {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    return res.status(201).json({
      success: true,
      data: {
        id: newUser.id,
        firstName: newUser.first_name || firstName,
        lastName: newUser.last_name || lastName,
        email: newUser.email,
        role: newUser.role,
        token
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

// Check authentication status
app.get('/api/auth/check', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    let userData;
    
    // Only use PostgreSQL
    const { rows } = await pool.query(
      'SELECT id, email, first_name, last_name, role FROM users WHERE id = $1',
      [userId]
    );
    userData = rows[0];
    
    if (!userData) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    return res.json({
      success: true,
      data: userData
    });
  } catch (error) {
    console.error('Error checking auth:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification de l\'authentification'
    });
  }
});

// Profile endpoint - Get user profile
app.get('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    let userData;
    
    // Only use PostgreSQL
    const { rows } = await pool.query(
      'SELECT id, email, first_name, last_name, role, phone, address, city, zip_code FROM users WHERE id = $1',
      [userId]
    );
    userData = rows[0];
    
    if (!userData) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    return res.json({
      success: true,
      data: userData
    });
  } catch (error) {
    console.error('Error getting profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du profil'
    });
  }
});

// Update user profile
app.put('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { firstName, lastName, email, phone, address, city, zipCode } = req.body;
    
    // Check if user exists using PostgreSQL
    const { rows } = await pool.query('SELECT id FROM users WHERE id = $1', [userId]);
    const userExists = rows.length > 0;
    
    if (!userExists) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    // Update user profile in database
    await pool.query(
      `UPDATE users 
       SET first_name = $1, last_name = $2, 
           phone = $3, address = $4, city = $5, zip_code = $6
       WHERE id = $7`,
      [firstName, lastName, phone, address, city, zipCode, userId]
    );
    
    // Get updated user data
    const { rows: updatedUser } = await pool.query(
      'SELECT id, email, first_name, last_name, role, phone, address, city, zip_code FROM users WHERE id = $1',
      [userId]
    );
    
    return res.json({
      success: true,
      data: updatedUser[0]
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du profil'
    });
  }
});

// ORDER ENDPOINTS
app.post('/api/orders', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { shippingAddress, shippingCity, shippingZipCode, phoneNumber, notes } = req.body;
    
    if (!shippingAddress || !shippingCity || !shippingZipCode || !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Toutes les informations de livraison sont requises'
      });
    }
    
    // Start transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Get user's cart and items
      const { rows: carts } = await client.query(
        'SELECT id FROM carts WHERE user_id = $1',
        [userId]
      );
      
      if (carts.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Panier non trouvé'
        });
      }
      
      const cartId = carts[0].id;
      
      // Get cart items
      const { rows: cartItems } = await client.query(
        `SELECT ci.product_id, ci.quantity, p.price, p.discount_price
         FROM cart_items ci
         JOIN products p ON ci.product_id = p.id
         WHERE ci.cart_id = $1`,
        [cartId]
      );
      
      if (cartItems.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Le panier est vide'
        });
      }
      
      // Calculate total price
      let totalPrice = 0;
      for (const item of cartItems) {
        const price = item.discount_price || item.price;
        totalPrice += price * item.quantity;
      }
      
      // Create order reference (e.g., ORD-12345678)
      const reference = `ORD-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      
      // Create order
      const { rows: orders } = await client.query(
        `INSERT INTO orders 
         (user_id, reference, status, shipping_address, shipping_city, 
          shipping_zip_code, phone_number, notes, total_price)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [userId, reference, 'pending', shippingAddress, shippingCity, 
         shippingZipCode, phoneNumber, notes || null, totalPrice]
      );
      
      const orderId = orders[0].id;
      
      // Create order items
      for (const item of cartItems) {
        await client.query(
          `INSERT INTO order_items 
           (order_id, product_id, quantity, price)
           VALUES ($1, $2, $3, $4)`,
          [orderId, item.product_id, item.quantity, item.discount_price || item.price]
        );
        
        // Update product stock
        await client.query(
          `UPDATE products 
           SET stock = stock - $1 
           WHERE id = $2`,
          [item.quantity, item.product_id]
        );
      }
      
      // Clear cart items
      await client.query('DELETE FROM cart_items WHERE cart_id = $1', [cartId]);
      
      // Commit transaction
      await client.query('COMMIT');
      
      // Get the complete order with items
      const { rows: orderDetails } = await client.query(
        `SELECT 
          o.id, o.user_id AS "userId", o.reference, o.status, 
          o.shipping_address AS "shippingAddress", o.shipping_city AS "shippingCity", 
          o.shipping_zip_code AS "shippingZipCode", o.phone_number AS "phoneNumber", 
          o.notes, o.total_price::numeric AS "totalPrice", 
          o.created_at AS "createdAt", o.updated_at AS "updatedAt"
         FROM orders o 
         WHERE o.id = $1`,
        [orderId]
      );
      
      // Get order items
      const { rows: orderItems } = await client.query(
        `SELECT 
          oi.id, oi.product_id AS "productId", oi.quantity, oi.price,
          p.name AS "productName", 
          (SELECT array_agg(pi.image_url) FROM product_images pi WHERE pi.product_id = p.id) AS "productImages"
         FROM order_items oi
         JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = $1`,
        [orderId]
      );
      
      // Format order items
      const formattedItems = orderItems.map(item => ({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        product: {
          id: item.productId,
          name: item.productName,
          images: item.productImages || []
        }
      }));
      
      // Return updated cart
      return res.json({
        success: true,
        data: {
          ...orderDetails[0],
          totalPrice: Number(orderDetails[0].totalPrice),
          items: formattedItems
        }
      });
    } catch (error) {
      // Rollback transaction on error
      await client.query('ROLLBACK');
      throw error;
    } finally {
      // Release client back to pool
      client.release();
    }
  } catch (error) {
    console.error('Error creating order:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la commande'
    });
  }
});

// Get user orders
app.get('/api/orders', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    // Get total count
    const { rows: countResult } = await pool.query(
      'SELECT COUNT(*) FROM orders WHERE user_id = $1',
      [userId]
    );
    const total = parseInt(countResult[0].count);
    const totalPages = Math.ceil(total / limit);
    
    // Get orders
    const { rows: orders } = await pool.query(
      `SELECT 
        id, user_id AS "userId", reference, status,
        shipping_address AS "shippingAddress", shipping_city AS "shippingCity",
        shipping_zip_code AS "shippingZipCode", phone_number AS "phoneNumber",
        notes, total_price::numeric AS "totalPrice", created_at AS "createdAt", updated_at AS "updatedAt"
      FROM orders 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    
    return res.json({
      success: true,
      data: orders,
      page,
      limit,
      total,
      totalPages
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des commandes'
    });
  }
});

// Get order details
app.get('/api/orders/:id', authenticateToken, async (req, res) => {
  try {
    // Special case for admin endpoint
    if (req.params.id === 'admin') {
      // Forward request to admin endpoint
      console.log('Detected admin orders request, forwarding to admin endpoint');
      
      // Only allow admin to access
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: "Accès refusé: vous n'avez pas les permissions nécessaires"
        });
      }
      
      // Call admin orders handler directly
      return await handleAdminOrders(req, res);
    }
    
    // Validate orderId before using it
    if (!req.params.id || req.params.id === 'undefined' || req.params.id === 'null') {
      console.error('Invalid order ID provided to GET /api/orders/:id:', req.params.id);
      return res.status(400).json({
        success: false,
        message: 'ID de commande manquant ou invalide'
      });
    }
    
    let orderId;
    try {
      orderId = parseInt(String(req.params.id));
      if (isNaN(orderId) || orderId <= 0) {
        console.error('Failed to parse order ID:', req.params.id, 'Parsed value:', orderId);
        return res.status(400).json({
          success: false,
          message: 'ID de commande invalide'
        });
      }
    } catch (parseError) {
      console.error('Error parsing order ID:', req.params.id, 'Error:', parseError);
      return res.status(400).json({
        success: false,
        message: 'ID de commande invalide (erreur de parsing)'
      });
    }
    
    console.log(`Fetching order details for ID: ${orderId} (parsed from ${req.params.id})`)
    
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';
    
    console.log('Fetching order details for order ID:', orderId);
    
    try {
      // First, get basic order details
      const { rows: orders } = await pool.query(
        `SELECT 
          o.id, o.user_id AS "userId", o.reference, o.status,
          o.shipping_address AS "shippingAddress", o.shipping_city AS "shippingCity",
          o.shipping_zip_code AS "shippingZipCode", o.phone_number AS "phoneNumber",
          o.notes, o.total_price::numeric AS "totalPrice", 
          o.created_at AS "createdAt", o.updated_at AS "updatedAt"
        FROM orders o
        WHERE o.id = $1`,
        [orderId]
      );
      
      if (orders.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Commande non trouvée'
        });
      }
      
      const order = orders[0];
      
      // Check authorization - only admin or order owner can view
      if (!isAdmin && order.userId !== userId) {
        return res.status(403).json({
          success: false,
          message: "Vous n'êtes pas autorisé à accéder à cette commande"
        });
      }
      
      // Get order items
      const { rows: items } = await pool.query(
        `SELECT 
          oi.id, oi.product_id AS "productId", oi.quantity, oi.price,
          p.name AS "productName",
          (SELECT array_agg(pi.image_url) FROM product_images pi WHERE pi.product_id = p.id) AS "productImages"
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = $1`,
        [orderId]
      );
      
      // Format order items
      const formattedItems = items.map(item => ({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        product: {
          id: item.productId,
          name: item.productName,
          images: item.productImages || []
        }
      }));
      
      // Get customer info for admin
      let customer = null;
      if (isAdmin && order.userId) {
        try {
          const { rows: users } = await pool.query(
            `SELECT 
              id, first_name AS "firstName", last_name AS "lastName", email
            FROM users 
            WHERE id = $1`,
            [order.userId]
          );
          
          if (users.length > 0) {
            customer = users[0];
          }
        } catch (userError) {
          console.error('Error fetching user data:', userError);
          // Continue with null customer
          customer = {
            id: order.userId,
            firstName: "Client",
            lastName: "Inconnu",
            email: "client@example.com"
          };
        }
      }
      
      return res.json({
        success: true,
        data: {
          ...order,
          totalPrice: Number(order.totalPrice),
          items: formattedItems,
          customer
        }
      });
    } catch (dbError) {
      console.error('Database error in order details:', dbError);
      return res.status(500).json({
        success: false,
        message: 'Erreur de base de données lors de la récupération des détails de la commande',
        error: dbError.message
      });
    }
  } catch (error) {
    console.error('Error fetching order details:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des détails de la commande',
      error: error.message
    });
  }
});

// CART ENDPOINTS
app.get('/api/cart', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Only use PostgreSQL
    // Get the user's cart or create a new one
    let cartId;
    const { rows: carts } = await pool.query('SELECT id FROM carts WHERE user_id = $1', [userId]);
    
    if (carts.length === 0) {
      // Create a new cart
      const { rows: newCarts } = await pool.query(
        'INSERT INTO carts (user_id) VALUES ($1) RETURNING id',
        [userId]
      );
      cartId = newCarts[0].id;
    } else {
      cartId = carts[0].id;
    }
    
    // Get cart items with product details
    const { rows: cartItems } = await pool.query(`
      SELECT 
        ci.id, ci.product_id AS "productId", ci.quantity,
        p.name, p.price, p.discount_price AS "discountPrice",
        (SELECT array_agg(pi.image_url) FROM product_images pi WHERE pi.product_id = p.id) AS images
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.cart_id = $1
    `, [cartId]);
    
    // Format cart items
    const formattedItems = cartItems.map(item => ({
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      product: {
        id: item.productId,
        name: item.name,
        price: item.price,
        discountPrice: item.discountPrice,
        images: item.images || []
      }
    }));
    
    // Calculate totals
    const totalItems = formattedItems.reduce((total, item) => total + item.quantity, 0);
    const totalPrice = formattedItems.reduce((total, item) => {
      const price = item.product.discountPrice || item.product.price;
      return total + (price * item.quantity);
    }, 0);
    
    return res.json({
      success: true,
      data: {
        id: cartId,
        userId,
        items: formattedItems,
        totalItems,
        totalPrice
      }
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du panier'
    });
  }
});

// Add item to cart
app.post('/api/cart/items', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity } = req.body;
    
    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides pour l\'ajout au panier'
      });
    }
    
    // Check if product exists
    const { rows: products } = await pool.query('SELECT id FROM products WHERE id = $1', [productId]);
    
    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé'
      });
    }
    
    // Get the user's cart or create a new one
    let cartId;
    const { rows: carts } = await pool.query('SELECT id FROM carts WHERE user_id = $1', [userId]);
    
    if (carts.length === 0) {
      // Create a new cart
      const { rows: newCarts } = await pool.query(
        'INSERT INTO carts (user_id) VALUES ($1) RETURNING id',
        [userId]
      );
      cartId = newCarts[0].id;
    } else {
      cartId = carts[0].id;
    }
    
    // Check if item already exists in cart
    const { rows: existingItems } = await pool.query(
      'SELECT id, quantity FROM cart_items WHERE cart_id = $1 AND product_id = $2',
      [cartId, productId]
    );
    
    if (existingItems.length > 0) {
      // Update quantity of existing item
      await pool.query(
        'UPDATE cart_items SET quantity = quantity + $1, created_at = CURRENT_TIMESTAMP WHERE id = $2',
        [quantity, existingItems[0].id]
      );
    } else {
      // Add new item to cart
      await pool.query(
        'INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ($1, $2, $3)',
        [cartId, productId, quantity]
      );
    }
    
    // Update cart updated_at timestamp
    await pool.query('UPDATE carts SET updated_at = CURRENT_TIMESTAMP WHERE id = $1', [cartId]);
    
    // Return updated cart
    return res.redirect(303, '/api/cart');
  } catch (error) {
    console.error('Error adding item to cart:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'ajout au panier'
    });
  }
});

// Update cart item quantity
app.put('/api/cart/items/:itemId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Validate item ID
    if (!req.params.itemId || req.params.itemId === 'undefined' || req.params.itemId === 'null') {
      return res.status(400).json({
        success: false,
        message: 'ID d\'élément manquant ou invalide'
      });
    }
    
    const itemId = parseInt(String(req.params.itemId));
    if (isNaN(itemId) || itemId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'ID d\'élément invalide'
      });
    }
    
    // Validate quantity
    const quantity = parseInt(String(req.body.quantity));
    if (isNaN(quantity) || quantity < 0) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides pour la mise à jour du panier'
      });
    }
    
    // Check if item exists and belongs to user's cart
    const { rows: items } = await pool.query(`
      SELECT ci.id
      FROM cart_items ci
      JOIN carts c ON ci.cart_id = c.id
      WHERE ci.id = $1 AND c.user_id = $2
    `, [itemId, userId]);
    
    if (items.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Élément de panier non trouvé'
      });
    }
    
    if (quantity === 0) {
      // Remove item from cart
      await pool.query('DELETE FROM cart_items WHERE id = $1', [itemId]);
    } else {
      // Update quantity
      await pool.query('UPDATE cart_items SET quantity = $1 WHERE id = $2', [quantity, itemId]);
    }
    
    // Return updated cart
    return res.redirect(303, '/api/cart');
  } catch (error) {
    console.error('Error updating cart item:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du panier'
    });
  }
});

// Remove item from cart
app.delete('/api/cart/items/:itemId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Validate item ID
    if (!req.params.itemId || req.params.itemId === 'undefined' || req.params.itemId === 'null') {
      return res.status(400).json({
        success: false,
        message: 'ID d\'élément manquant ou invalide'
      });
    }
    
    const itemId = parseInt(String(req.params.itemId));
    if (isNaN(itemId) || itemId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'ID d\'élément invalide'
      });
    }
    
    // Check if item exists and belongs to user's cart
    const { rows: items } = await pool.query(`
      SELECT ci.id
      FROM cart_items ci
      JOIN carts c ON ci.cart_id = c.id
      WHERE ci.id = $1 AND c.user_id = $2
    `, [itemId, userId]);
    
    if (items.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Élément de panier non trouvé'
      });
    }
    
    // Remove item from cart
    await pool.query('DELETE FROM cart_items WHERE id = $1', [itemId]);
    
    // Return updated cart
    return res.redirect(303, '/api/cart');
  } catch (error) {
    console.error('Error removing cart item:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de l\'élément du panier'
    });
  }
});

// Clear cart
app.delete('/api/cart', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get the user's cart
    const { rows: carts } = await pool.query('SELECT id FROM carts WHERE user_id = $1', [userId]);
    
    if (carts.length > 0) {
      // Clear cart items
      await pool.query('DELETE FROM cart_items WHERE cart_id = $1', [carts[0].id]);
    }
    
    return res.json({
      success: true,
      data: null,
      message: 'Panier vidé avec succès'
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du panier'
    });
  }
});

// Cancel order
app.put('/api/orders/:id/cancel', authenticateToken, async (req, res) => {
  try {
    // Validate order ID
    if (!req.params.id || req.params.id === 'undefined' || req.params.id === 'null') {
      return res.status(400).json({
        success: false,
        message: 'ID de commande manquant ou invalide'
      });
    }
    
    const orderId = parseInt(String(req.params.id));
    if (isNaN(orderId) || orderId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'ID de commande invalide'
      });
    }
    
    console.log(`Processing cancel request for order ID: ${orderId}`);
    
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';
    
    // Check if order exists and belongs to user (or user is admin)
    const { rows: orders } = await pool.query(
      `SELECT id, user_id AS "userId", status
       FROM orders
       WHERE id = $1 ${isAdmin ? '' : 'AND user_id = $2'}`,
      isAdmin ? [orderId] : [orderId, userId]
    );
    
    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Commande non trouvée'
      });
    }
    
    const order = orders[0];
    
    // Check if order can be cancelled (only pending or processing orders)
    if (order.status !== 'pending' && order.status !== 'processing') {
      return res.status(400).json({
        success: false,
        message: 'La commande ne peut pas être annulée dans son état actuel'
      });
    }
    
    // Update order status to cancelled
    await pool.query(
      `UPDATE orders 
       SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [orderId]
    );
    
    // Return updated order
    return res.redirect(303, `/api/orders/${orderId}`);
  } catch (error) {
    console.error('Error cancelling order:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'annulation de la commande'
    });
  }
});

// Update order status (admin only)
app.put('/api/orders/:id/status', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    // Validate order ID
    if (!req.params.id || req.params.id === 'undefined' || req.params.id === 'null') {
      console.error('Invalid order ID provided to PUT /api/orders/:id/status:', req.params.id);
      return res.status(400).json({
        success: false,
        message: 'ID de commande manquant ou invalide'
      });
    }
    
    let orderId;
    try {
      orderId = parseInt(String(req.params.id));
      if (isNaN(orderId) || orderId <= 0) {
        console.error('Failed to parse order ID:', req.params.id, 'Parsed value:', orderId);
        return res.status(400).json({
          success: false,
          message: 'ID de commande invalide'
        });
      }
    } catch (parseError) {
      console.error('Error parsing order ID:', req.params.id, 'Error:', parseError);
      return res.status(400).json({
        success: false,
        message: 'ID de commande invalide (erreur de parsing)'
      });
    }
    
    console.log(`Updating status for order ID: ${orderId}`);
    
    const { status } = req.body;
    
    // Validate status
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Statut de commande invalide'
      });
    }
    
    // Check if order exists
    const { rows: orders } = await pool.query(
      'SELECT id FROM orders WHERE id = $1',
      [orderId]
    );
    
    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Commande non trouvée'
      });
    }
    
    // Update order status
    await pool.query(
      `UPDATE orders 
       SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [status, orderId]
    );
    
    // Return updated order
    return res.redirect(303, `/api/orders/${orderId}`);
  } catch (error) {
    console.error('Error updating order status:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du statut de la commande'
    });
  }
});

// Admin user management endpoints
// Get all users with pagination and filters
app.get('/api/admin/users', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const isActive = req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined;
    const search = req.query.search || '';
    
    console.log(`Getting admin users: page=${page}, limit=${limit}, isActive=${isActive}, search=${search}`);
    
    // Build the query conditionally
    let query = 'SELECT id, first_name, last_name, email, role, is_active, created_at FROM users WHERE 1=1';
    let countQuery = 'SELECT COUNT(*) FROM users WHERE 1=1';
    const queryParams = [];
    
    // Add isActive filter if provided
    if (isActive !== undefined) {
      query += ' AND is_active = $' + (queryParams.length + 1);
      countQuery += ' AND is_active = $' + (queryParams.length + 1);
      queryParams.push(isActive);
    }
    
    // Add search filter if provided
    if (search) {
      const searchParam = `%${search}%`;
      query += ' AND (first_name ILIKE $' + (queryParams.length + 1) + 
               ' OR last_name ILIKE $' + (queryParams.length + 1) + 
               ' OR email ILIKE $' + (queryParams.length + 1) + ')';
      countQuery += ' AND (first_name ILIKE $' + (queryParams.length + 1) + 
                   ' OR last_name ILIKE $' + (queryParams.length + 1) + 
                   ' OR email ILIKE $' + (queryParams.length + 1) + ')';
      queryParams.push(searchParam);
    }
    
    // Add pagination
    query += ' ORDER BY created_at DESC LIMIT $' + (queryParams.length + 1) + ' OFFSET $' + (queryParams.length + 2);
    const paginationParams = [...queryParams, limit, offset];
    
    // Execute both queries
    const { rows: users } = await pool.query(query, paginationParams);
    const { rows: countResult } = await pool.query(countQuery, queryParams);
    
    const total = parseInt(countResult[0].count);
    const totalPages = Math.ceil(total / limit);
    
    // Format the data to match frontend expectations
    const formattedUsers = users.map(user => ({
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      role: user.role,
      isActive: user.is_active,
      createdAt: user.created_at
    }));
    
    return res.json({
      success: true,
      data: formattedUsers,
      page,
      limit,
      total,
      totalPages
    });
  } catch (error) {
    console.error('Error fetching admin users:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des utilisateurs',
      error: error.message
    });
  }
});

// Get user details by ID (Admin access)
app.get('/api/admin/users/:id', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    const userId = req.params.id;
    
    const { rows } = await pool.query(
      'SELECT id, first_name, last_name, email, role, is_active, phone, address, city, zip_code, created_at FROM users WHERE id = $1',
      [userId]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    const user = rows[0];
    
    // Format user data
    const formattedUser = {
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      role: user.role,
      isActive: user.is_active,
      phone: user.phone,
      address: user.address,
      city: user.city,
      zipCode: user.zip_code,
      createdAt: user.created_at
    };
    
    return res.json({
      success: true,
      data: formattedUser
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des détails de l\'utilisateur',
      error: error.message
    });
  }
});

// Update user status (activate/deactivate)
app.put('/api/admin/users/:id/status', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    const userId = req.params.id;
    const { isActive } = req.body;
    
    // Validate request data
    if (isActive === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Le statut de l\'utilisateur est requis'
      });
    }
    
    // Check if user exists
    const { rows: userCheck } = await pool.query('SELECT id FROM users WHERE id = $1', [userId]);
    
    if (userCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    // Update user status
    await pool.query(
      'UPDATE users SET is_active = $1 WHERE id = $2',
      [isActive, userId]
    );
    
    // Fetch the updated user
    const { rows } = await pool.query(
      'SELECT id, first_name, last_name, email, role, is_active, created_at FROM users WHERE id = $1',
      [userId]
    );
    
    const user = rows[0];
    
    // Format user data
    const formattedUser = {
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      role: user.role,
      isActive: user.is_active,
      createdAt: user.created_at
    };
    
    return res.json({
      success: true,
      data: formattedUser,
      message: isActive ? 'Utilisateur activé avec succès' : 'Utilisateur désactivé avec succès'
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du statut de l\'utilisateur',
      error: error.message
    });
  }
});

// Delete user
app.delete('/api/admin/users/:id', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Check if user exists
    const { rows: userCheck } = await pool.query('SELECT id, role FROM users WHERE id = $1', [userId]);
    
    if (userCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    // Prevent deletion of admin users
    if (userCheck[0].role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Les administrateurs ne peuvent pas être supprimés'
      });
    }
    
    // Delete the user (or you could implement soft delete by setting is_active to false)
    await pool.query('DELETE FROM users WHERE id = $1', [userId]);
    
    return res.json({
      success: true,
      message: 'Utilisateur supprimé avec succès'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de l\'utilisateur',
      error: error.message
    });
  }
});

// Create new user (Admin)
app.post('/api/admin/users', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    const { firstName, lastName, email, password, role, phone, address, city, zipCode, isActive } = req.body;
    
    // Validate required fields
    if (!firstName || !lastName || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Tous les champs obligatoires doivent être remplis'
      });
    }
    
    // Check if email already exists
    const { rows: existingUser } = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    
    if (existingUser.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cet email est déjà utilisé'
      });
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create the new user
    const result = await pool.query(`
      INSERT INTO users (first_name, last_name, email, password, role, phone, address, city, zip_code, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id, first_name, last_name, email, role, is_active, created_at
    `, [firstName, lastName, email, hashedPassword, role, phone || null, address || null, city || null, zipCode || null, isActive !== undefined ? isActive : true]);
    
    const newUser = result.rows[0];
    
    // Format user data
    const formattedUser = {
      id: newUser.id,
      firstName: newUser.first_name,
      lastName: newUser.last_name,
      email: newUser.email,
      role: newUser.role,
      isActive: newUser.is_active,
      createdAt: newUser.created_at
    };
    
    return res.status(201).json({
      success: true,
      data: formattedUser,
      message: 'Utilisateur créé avec succès'
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de l\'utilisateur',
      error: error.message
    });
  }
});

// Admin dashboard statistics endpoint
app.get('/api/admin/stats', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    console.log('Admin stats endpoint called');
    
    // Get total orders count
    const { rows: orderCountResult } = await pool.query('SELECT COUNT(*) FROM orders');
    const totalOrders = parseInt(orderCountResult[0].count);
    
    // Get total products count
    const { rows: productCountResult } = await pool.query('SELECT COUNT(*) FROM products');
    const totalProducts = parseInt(productCountResult[0].count);
    
    // Get total users count
    const { rows: userCountResult } = await pool.query('SELECT COUNT(*) FROM users');
    const totalUsers = parseInt(userCountResult[0].count);
    
    // Get total revenue
    const { rows: revenueResult } = await pool.query('SELECT SUM(total_price) as revenue FROM orders WHERE status != $1', ['cancelled']);
    const revenue = parseFloat(revenueResult[0].revenue || 0);
    
    // Get latest orders
    const { rows: latestOrders } = await pool.query(`
      SELECT 
        o.id, o.reference, o.status, o.total_price as "totalPrice",
        o.created_at as "createdAt",
        u.first_name as "customerFirstName", u.last_name as "customerLastName"
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
      LIMIT 5
    `);
    
    return res.json({
      success: true,
      data: {
        totalOrders,
        totalProducts,
        totalUsers,
        revenue,
        latestOrders
      }
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      error: error.message
    });
  }
});

// Order trends data endpoint (for charts)
app.get('/api/admin/orders/trends', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    const { period = 'week' } = req.query;
    console.log(`Admin orders trends endpoint called with period: ${period}`);
    
    let query = '';
    let startDate = new Date();
    
    // Define the time period for the query
    if (period === 'day') {
      // Last 24 hours in hourly intervals
      startDate.setHours(startDate.getHours() - 24);
      query = `
        SELECT 
          date_trunc('hour', created_at) as time_interval,
          COUNT(*) as order_count
        FROM orders
        WHERE created_at >= $1
        GROUP BY time_interval
        ORDER BY time_interval ASC
      `;
    } else if (period === 'week') {
      // Last 7 days
      startDate.setDate(startDate.getDate() - 7);
      query = `
        SELECT 
          date_trunc('day', created_at) as time_interval,
          COUNT(*) as order_count
        FROM orders
        WHERE created_at >= $1
        GROUP BY time_interval
        ORDER BY time_interval ASC
      `;
    } else if (period === 'month') {
      // Last 30 days
      startDate.setDate(startDate.getDate() - 30);
      query = `
        SELECT 
          date_trunc('day', created_at) as time_interval,
          COUNT(*) as order_count
        FROM orders
        WHERE created_at >= $1
        GROUP BY time_interval
        ORDER BY time_interval ASC
      `;
    } else if (period === 'year') {
      // Last 12 months
      startDate.setMonth(startDate.getMonth() - 12);
      query = `
        SELECT 
          date_trunc('month', created_at) as time_interval,
          COUNT(*) as order_count
        FROM orders
        WHERE created_at >= $1
        GROUP BY time_interval
        ORDER BY time_interval ASC
      `;
    }
    
    const { rows: trendData } = await pool.query(query, [startDate]);
    
    // Format the data for chart display
    const formattedData = trendData.map(item => ({
      date: item.time_interval,
      value: parseInt(item.order_count)
    }));
    
    return res.json({
      success: true,
      data: formattedData
    });
  } catch (error) {
    console.error('Error fetching order trends:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des tendances de commandes',
      error: error.message
    });
  }
});

// Sales trends data endpoint (for charts)
app.get('/api/admin/sales/trends', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    const { period = 'week' } = req.query;
    console.log(`Admin sales trends endpoint called with period: ${period}`);
    
    let query = '';
    let startDate = new Date();
    
    // Define the time period for the query
    if (period === 'day') {
      // Last 24 hours in hourly intervals
      startDate.setHours(startDate.getHours() - 24);
      query = `
        SELECT 
          date_trunc('hour', created_at) as time_interval,
          SUM(total_price) as sales_amount
        FROM orders
        WHERE created_at >= $1 AND status != 'cancelled'
        GROUP BY time_interval
        ORDER BY time_interval ASC
      `;
    } else if (period === 'week') {
      // Last 7 days
      startDate.setDate(startDate.getDate() - 7);
      query = `
        SELECT 
          date_trunc('day', created_at) as time_interval,
          SUM(total_price) as sales_amount
        FROM orders
        WHERE created_at >= $1 AND status != 'cancelled'
        GROUP BY time_interval
        ORDER BY time_interval ASC
      `;
    } else if (period === 'month') {
      // Last 30 days
      startDate.setDate(startDate.getDate() - 30);
      query = `
        SELECT 
          date_trunc('day', created_at) as time_interval,
          SUM(total_price) as sales_amount
        FROM orders
        WHERE created_at >= $1 AND status != 'cancelled'
        GROUP BY time_interval
        ORDER BY time_interval ASC
      `;
    } else if (period === 'year') {
      // Last 12 months
      startDate.setMonth(startDate.getMonth() - 12);
      query = `
        SELECT 
          date_trunc('month', created_at) as time_interval,
          SUM(total_price) as sales_amount
        FROM orders
        WHERE created_at >= $1 AND status != 'cancelled'
        GROUP BY time_interval
        ORDER BY time_interval ASC
      `;
    }
    
    const { rows: trendData } = await pool.query(query, [startDate]);
    
    // Format the data for chart display
    const formattedData = trendData.map(item => ({
      date: item.time_interval,
      value: parseFloat(item.sales_amount)
    }));
    
    return res.json({
      success: true,
      data: formattedData
    });
  } catch (error) {
    console.error('Error fetching sales trends:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des tendances de ventes',
      error: error.message
    });
  }
});

// Get product categories
app.get('/api/categories', async (req, res) => {
  try {
    console.log('Fetching categories...');
    
    // Get all categories
    const { rows: allCategories } = await pool.query(`
      SELECT 
        id, 
        name, 
        slug, 
        description,
        parent_id AS "parentId",
        icon,
        display_order AS "displayOrder",
        is_active AS "isActive", 
        created_at AS "createdAt"
      FROM 
        categories
      ORDER BY 
        display_order ASC, name ASC
    `);
    
    // Check if we need to return flat or hierarchical structure
    const { hierarchical = 'true' } = req.query;
    const wantHierarchical = hierarchical.toLowerCase() === 'true';
    
    if (!wantHierarchical) {
      // Return flat structure
      console.log(`Found ${allCategories.length} categories (flat structure)`);
      return res.json({
        success: true,
        data: allCategories
      });
    }
    
    // Build hierarchical structure
    const mainCategories = [];
    const subcategoriesMap = {};
    
    // First, group all subcategories by their parent_id
    allCategories.forEach(category => {
      if (!category.parentId) {
        // This is a main category
        mainCategories.push({
          ...category,
          subcategories: []
        });
      } else {
        // This is a subcategory
        if (!subcategoriesMap[category.parentId]) {
          subcategoriesMap[category.parentId] = [];
        }
        subcategoriesMap[category.parentId].push(category);
      }
    });
    
    // Then, assign subcategories to their parent categories
    mainCategories.forEach(mainCategory => {
      if (subcategoriesMap[mainCategory.id]) {
        mainCategory.subcategories = subcategoriesMap[mainCategory.id];
      }
    });
    
    console.log(`Found ${mainCategories.length} main categories with subcategories`);
    
    return res.json({
      success: true,
      data: mainCategories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des catégories'
    });
  }
});

// CREATE CATEGORY (admin only)
app.post('/api/categories', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    const { name, slug, description, parentId, icon, displayOrder, isActive } = req.body;
    
    // Validate required fields
    if (!name || !slug) {
      return res.status(400).json({
        success: false,
        message: 'Le nom et le slug sont obligatoires'
      });
    }
    
    // Check if slug already exists
    const { rows: existingSlug } = await pool.query('SELECT id FROM categories WHERE slug = $1', [slug]);
    if (existingSlug.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Ce slug existe déjà, veuillez en choisir un autre'
      });
    }
    
    // Check if parent exists if parentId is provided
    if (parentId) {
      const { rows: parentCheck } = await pool.query('SELECT id FROM categories WHERE id = $1', [parentId]);
      if (parentCheck.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'La catégorie parente spécifiée n\'existe pas'
        });
      }
    }
    
    // Insert new category
    const { rows } = await pool.query(
      `INSERT INTO categories 
        (name, slug, description, parent_id, icon, display_order, is_active) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [name, slug, description || null, parentId || null, icon || null, displayOrder || 0, isActive !== false]
    );
    
    return res.status(201).json({
      success: true,
      data: {
        id: rows[0].id,
        name: rows[0].name,
        slug: rows[0].slug,
        description: rows[0].description,
        parentId: rows[0].parent_id,
        icon: rows[0].icon,
        displayOrder: rows[0].display_order,
        isActive: rows[0].is_active,
        createdAt: rows[0].created_at
      },
      message: 'Catégorie créée avec succès'
    });
  } catch (error) {
    console.error('Error creating category:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la catégorie'
    });
  }
});

// GET CATEGORY BY ID
app.get('/api/categories/:id', async (req, res) => {
  try {
    const categoryId = parseInt(req.params.id);
    
    if (isNaN(categoryId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de catégorie invalide'
      });
    }
    
    const { rows } = await pool.query(
      `SELECT 
        id, name, slug, description, 
        parent_id AS "parentId", 
        icon,
        display_order AS "displayOrder",
        is_active AS "isActive",
        created_at AS "createdAt"
       FROM categories
       WHERE id = $1`,
      [categoryId]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Catégorie non trouvée'
      });
    }
    
    // Get subcategories if any
    const { rows: subcategories } = await pool.query(
      `SELECT 
        id, name, slug, description, 
        parent_id AS "parentId", 
        icon,
        display_order AS "displayOrder",
        is_active AS "isActive",
        created_at AS "createdAt"
       FROM categories
       WHERE parent_id = $1
       ORDER BY display_order ASC, name ASC`,
      [categoryId]
    );
    
    const categoryWithSubcategories = {
      ...rows[0],
      subcategories: subcategories
    };
    
    return res.json({
      success: true,
      data: categoryWithSubcategories
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la catégorie'
    });
  }
});

// UPDATE CATEGORY (admin only)
app.put('/api/categories/:id', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    const categoryId = parseInt(req.params.id);
    
    if (isNaN(categoryId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de catégorie invalide'
      });
    }
    
    const { name, slug, description, parentId, icon, displayOrder, isActive } = req.body;
    
    // Validate required fields
    if (!name || !slug) {
      return res.status(400).json({
        success: false,
        message: 'Le nom et le slug sont obligatoires'
      });
    }
    
    // Check if category exists
    const { rows: categoryCheck } = await pool.query('SELECT id FROM categories WHERE id = $1', [categoryId]);
    if (categoryCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Catégorie non trouvée'
      });
    }
    
    // Check if slug is already used by another category
    const { rows: slugCheck } = await pool.query('SELECT id FROM categories WHERE slug = $1 AND id != $2', [slug, categoryId]);
    if (slugCheck.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Ce slug existe déjà, veuillez en choisir un autre'
      });
    }
    
    // Check if parent exists if parentId is provided
    if (parentId) {
      // Check for circular reference (a category cannot be its own parent)
      if (parentId == categoryId) {
        return res.status(400).json({
          success: false,
          message: 'Une catégorie ne peut pas être sa propre catégorie parente'
        });
      }
      
      const { rows: parentCheck } = await pool.query('SELECT id FROM categories WHERE id = $1', [parentId]);
      if (parentCheck.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'La catégorie parente spécifiée n\'existe pas'
        });
      }
    }
    
    // Update category
    const { rows } = await pool.query(
      `UPDATE categories 
       SET name = $1, slug = $2, description = $3, 
           parent_id = $4, icon = $5, 
           display_order = $6, is_active = $7
       WHERE id = $8
       RETURNING *`,
      [name, slug, description || null, parentId || null, icon || null, 
       displayOrder || 0, isActive !== false, categoryId]
    );
    
    return res.json({
      success: true,
      data: {
        id: rows[0].id,
        name: rows[0].name,
        slug: rows[0].slug,
        description: rows[0].description,
        parentId: rows[0].parent_id,
        icon: rows[0].icon,
        displayOrder: rows[0].display_order,
        isActive: rows[0].is_active,
        createdAt: rows[0].created_at
      },
      message: 'Catégorie mise à jour avec succès'
    });
  } catch (error) {
    console.error('Error updating category:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la catégorie'
    });
  }
});

// DELETE CATEGORY (admin only)
app.delete('/api/categories/:id', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    const categoryId = parseInt(req.params.id);
    
    if (isNaN(categoryId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de catégorie invalide'
      });
    }
    
    // Check if category exists
    const { rows: categoryCheck } = await pool.query('SELECT id FROM categories WHERE id = $1', [categoryId]);
    if (categoryCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Catégorie non trouvée'
      });
    }
    
    // Check if any products use this category
    const { rows: productsCount } = await pool.query(
      'SELECT COUNT(*) FROM products WHERE category_id = $1 OR category = (SELECT name FROM categories WHERE id = $1)',
      [categoryId]
    );
    
    const count = parseInt(productsCount[0].count);
    if (count > 0) {
      return res.status(400).json({
        success: false,
        message: `Impossible de supprimer cette catégorie car elle est utilisée par ${count} produit(s)`
      });
    }
    
    // Delete category
    await pool.query('DELETE FROM categories WHERE id = $1', [categoryId]);
    
    return res.json({
      success: true,
      message: 'Catégorie supprimée avec succès'
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la catégorie'
    });
  }
});

// This endpoint was a duplicate of the one above and has been removed to fix conflicts

// REVIEWS ENDPOINTS

// Get reviews for a product
app.get('/api/products/:productId/reviews', async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    // Validate product ID
    if (!productId || isNaN(parseInt(productId))) {
      return res.status(400).json({
        success: false,
        message: 'ID de produit invalide'
      });
    }
    
    console.log(`Fetching reviews for product ID: ${productId}`); // Debug log
    
    // Calculate pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, Math.min(50, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;
    
    // Get reviews count first - only approved reviews
    const countResult = await pool.query(
      'SELECT COUNT(*) FROM reviews WHERE product_id = $1 AND is_approved = true',
      [productId]
    );
    const total = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(total / limitNum);
    
    // Fetch reviews with user information
    const reviewsResult = await pool.query(
      `SELECT r.*, u.first_name, u.last_name 
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.product_id = $1 AND r.is_approved = true
       ORDER BY r.created_at DESC
       LIMIT $2 OFFSET $3`,
      [productId, limitNum, offset]
    );
    
    console.log(`Found ${reviewsResult.rows.length} reviews for product ${productId}`);
    
    // Calculate rating stats
    const statsResult = await pool.query(
      `SELECT 
         COALESCE(AVG(rating), 0) as average_rating,
         SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as rating_1,
         SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as rating_2,
         SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as rating_3,
         SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as rating_4,
         SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as rating_5
       FROM reviews
       WHERE product_id = $1 AND is_approved = true`,
      [productId]
    );
    
    const stats = statsResult.rows[0];
    
    // Map database fields to camelCase
    const reviews = reviewsResult.rows.map(review => ({
      id: review.id,
      productId: review.product_id,
      userId: review.user_id,
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      isVerified: review.is_verified,
      createdAt: review.created_at,
      updatedAt: review.updated_at,
      firstName: review.first_name,
      lastName: review.last_name
    }));
    
    // Create rating distribution array
    const distribution = [
      { rating: 5, count: stats.rating_5 ? stats.rating_5.toString() : '0' },
      { rating: 4, count: stats.rating_4 ? stats.rating_4.toString() : '0' },
      { rating: 3, count: stats.rating_3 ? stats.rating_3.toString() : '0' },
      { rating: 2, count: stats.rating_2 ? stats.rating_2.toString() : '0' },
      { rating: 1, count: stats.rating_1 ? stats.rating_1.toString() : '0' }
    ];
    
    console.log('Response data:', {
      success: true,
      data: reviews,
      page: pageNum,
      limit: limitNum,
      total,
      totalPages,
      stats: {
        averageRating: parseFloat(stats.average_rating),
        distribution
      }
    });
    
    return res.json({
      success: true,
      data: reviews,
      page: pageNum,
      limit: limitNum,
      total,
      totalPages,
      stats: {
        averageRating: parseFloat(stats.average_rating).toFixed(2),
        distribution
      }
    });
  } catch (error) {
    console.error('Error fetching product reviews:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des avis',
      error: error.message
    });
  }
});

// Create a new review
app.post('/api/products/:productId/reviews', authenticateToken, async (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, title, comment } = req.body;
    const userId = req.user.id;
    
    // Validate required fields
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'La note doit être comprise entre 1 et 5'
      });
    }
    
    // Check if product exists
    const { rows: productCheck } = await pool.query(
      'SELECT id FROM products WHERE id = $1',
      [productId]
    );
    
    if (productCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé'
      });
    }
    
    // Check if user has already reviewed this product
    const { rows: existingReview } = await pool.query(
      'SELECT id FROM reviews WHERE product_id = $1 AND user_id = $2',
      [productId, userId]
    );
    
    if (existingReview.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Vous avez déjà publié un avis pour ce produit'
      });
    }
    
    // Check if user has purchased the product (optional, for verified reviews)
    const { rows: orderCheck } = await pool.query(`
      SELECT 1 FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      WHERE o.user_id = $1 AND oi.product_id = $2 AND o.status = 'completed'
      LIMIT 1
    `, [userId, productId]);
    
    const isVerified = orderCheck.length > 0;
    
    // Start transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Insert review
      const { rows } = await client.query(`
        INSERT INTO reviews 
          (product_id, user_id, rating, title, comment, is_verified)
        VALUES 
          ($1, $2, $3, $4, $5, $6)
        RETURNING 
          id, product_id AS "productId", rating, title, comment, 
          is_verified AS "isVerified", created_at AS "createdAt"
      `, [productId, userId, rating, title, comment, isVerified]);
      
      // Update product rating and review count
      await client.query(`
        UPDATE products
        SET 
          rating = (
            SELECT AVG(rating)::numeric(3,2) 
            FROM reviews 
            WHERE product_id = $1 AND is_approved = true
          ),
          reviews = (
            SELECT COUNT(*) 
            FROM reviews 
            WHERE product_id = $1 AND is_approved = true
          )
        WHERE id = $1
      `, [productId]);
      
      await client.query('COMMIT');
      
      return res.status(201).json({
        success: true,
        message: 'Avis ajouté avec succès',
        data: rows[0]
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating review:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de l\'avis'
    });
  }
});

// Update a review
app.put('/api/reviews/:reviewId', authenticateToken, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, title, comment } = req.body;
    const userId = req.user.id;
    
    // Validate required fields
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'La note doit être comprise entre 1 et 5'
      });
    }
    
    // Check if review exists and belongs to the user
    const { rows: reviewCheck } = await pool.query(
      'SELECT id, product_id FROM reviews WHERE id = $1 AND user_id = $2',
      [reviewId, userId]
    );
    
    if (reviewCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Avis non trouvé ou vous n\'êtes pas autorisé à le modifier'
      });
    }
    
    const productId = reviewCheck[0].product_id;
    
    // Start transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Update review
      const { rows } = await client.query(`
        UPDATE reviews
        SET 
          rating = $1,
          title = $2,
          comment = $3,
          updated_at = NOW()
        WHERE id = $4
        RETURNING 
          id, product_id AS "productId", rating, title, comment, 
          is_verified AS "isVerified", updated_at AS "updatedAt"
      `, [rating, title, comment, reviewId]);
      
      // Update product rating
      await client.query(`
        UPDATE products
        SET 
          rating = (
            SELECT AVG(rating)::numeric(3,2) 
            FROM reviews 
            WHERE product_id = $1 AND is_approved = true
          )
        WHERE id = $1
      `, [productId]);
      
      await client.query('COMMIT');
      
      return res.json({
        success: true,
        message: 'Avis mis à jour avec succès',
        data: rows[0]
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error updating review:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de l\'avis'
    });
  }
});

// Delete a review
app.delete('/api/reviews/:reviewId', authenticateToken, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';
    
    // Check if review exists
    const { rows: reviewCheck } = await pool.query(
      'SELECT id, product_id, user_id FROM reviews WHERE id = $1',
      [reviewId]
    );
    
    if (reviewCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Avis non trouvé'
      });
    }
    
    // Check if user is authorized (owner or admin)
    if (reviewCheck[0].user_id !== userId && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'êtes pas autorisé à supprimer cet avis'
      });
    }
    
    const productId = reviewCheck[0].product_id;
    
    // Start transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Delete review
      await client.query('DELETE FROM reviews WHERE id = $1', [reviewId]);
      
      // Update product rating and review count
      await client.query(`
        UPDATE products
        SET 
          rating = (
            SELECT AVG(rating)::numeric(3,2) 
            FROM reviews 
            WHERE product_id = $1 AND is_approved = true
          ),
          reviews = (
            SELECT COUNT(*) 
            FROM reviews 
            WHERE product_id = $1 AND is_approved = true
          )
        WHERE id = $1
      `, [productId]);
      
      await client.query('COMMIT');
      
      return res.json({
        success: true,
        message: 'Avis supprimé avec succès'
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error deleting review:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de l\'avis'
    });
  }
});

// Admin: Get all reviews (with filtering and pagination)
app.get('/api/admin/reviews', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    const { page = 1, limit = 10, productId, approved } = req.query;
    
    // Calculate pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, Math.min(50, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;
    
    // Build query conditions
    const conditions = [];
    const params = [limitNum, offset];
    let paramIndex = 3;
    
    if (productId) {
      conditions.push(`r.product_id = $${paramIndex++}`);
      params.push(productId);
    }
    
    if (approved !== undefined) {
      conditions.push(`r.is_approved = $${paramIndex++}`);
      params.push(approved === 'true');
    }
    
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    
    // Get reviews with product and user information
    const { rows: reviews } = await pool.query(`
      SELECT 
        r.id, r.product_id AS "productId", r.user_id AS "userId", 
        r.rating, r.title, r.comment, r.is_verified AS "isVerified",
        r.is_approved AS "isApproved", r.created_at AS "createdAt",
        p.name AS "productName", 
        u.first_name AS "firstName", u.last_name AS "lastName", u.email
      FROM reviews r
      LEFT JOIN products p ON r.product_id = p.id
      LEFT JOIN users u ON r.user_id = u.id
      ${whereClause}
      ORDER BY r.created_at DESC
      LIMIT $1 OFFSET $2
    `, params);
    
    // Get total count for pagination
    const countParams = params.slice(2);
    const countQuery = `
      SELECT COUNT(*) FROM reviews r
      ${whereClause.replace('WHERE', 'WHERE')}
    `;
    
    const { rows: countResult } = await pool.query(countQuery, countParams);
    const total = parseInt(countResult[0].count);
    const totalPages = Math.ceil(total / limitNum);
    
    return res.json({
      success: true,
      data: reviews,
      page: pageNum,
      limit: limitNum,
      total,
      totalPages
    });
  } catch (error) {
    console.error('Error fetching admin reviews:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des avis'
    });
  }
});

// Admin: Approve or reject a review
app.patch('/api/admin/reviews/:reviewId/approve', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { approved } = req.body;
    
    if (approved === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Le paramètre "approved" est requis'
      });
    }
    
    // Check if review exists
    const { rows: reviewCheck } = await pool.query(
      'SELECT id, product_id FROM reviews WHERE id = $1',
      [reviewId]
    );
    
    if (reviewCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Avis non trouvé'
      });
    }
    
    const productId = reviewCheck[0].product_id;
    
    // Start transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Update review approval status
      await client.query(
        'UPDATE reviews SET is_approved = $1 WHERE id = $2',
        [approved, reviewId]
      );
      
      // Update product rating and review count
      await client.query(`
        UPDATE products
        SET 
          rating = (
            SELECT AVG(rating)::numeric(3,2) 
            FROM reviews 
            WHERE product_id = $1 AND is_approved = true
          ),
          reviews = (
            SELECT COUNT(*) 
            FROM reviews 
            WHERE product_id = $1 AND is_approved = true
          )
        WHERE id = $1
      `, [productId]);
      
      await client.query('COMMIT');
      
      return res.json({
        success: true,
        message: approved ? 'Avis approuvé avec succès' : 'Avis rejeté avec succès'
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error updating review approval:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du statut de l\'avis'
    });
  }
});

// Carousel API Routes
// GET all carousel slides
app.get('/api/carousel', async (req, res) => {
  try {
    const query = `
      SELECT id, image, title, subtitle, button_text as "buttonText", 
             button_link as "buttonLink", active, "order", 
             created_at as "createdAt", updated_at as "updatedAt"
      FROM carousel_slides
      WHERE active = TRUE
      ORDER BY "order" ASC
    `;
    
    const { rows } = await pool.query(query);
    
    return res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching carousel slides:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des slides du carousel',
      error: error.message
    });
  }
});

// GET a specific carousel slide by ID
app.get('/api/carousel/:id', async (req, res) => {
  try {
    const slideId = parseInt(req.params.id);
    
    if (isNaN(slideId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de slide invalide'
      });
    }
    
    const query = `
      SELECT id, image, title, subtitle, button_text as "buttonText", 
             button_link as "buttonLink", active, "order", 
             created_at as "createdAt", updated_at as "updatedAt"
      FROM carousel_slides
      WHERE id = $1
    `;
    
    const { rows } = await pool.query(query, [slideId]);
    
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Slide de carousel non trouvé'
      });
    }
    
    return res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error(`Error fetching carousel slide with id ${req.params.id}:`, error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du slide de carousel',
      error: error.message
    });
  }
});

// POST - Create a new carousel slide (admin only)
app.post('/api/carousel', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    const { title, subtitle, buttonText, buttonLink, image, active = true, order = 0 } = req.body;
    
    // Validate required fields
    if (!title || !image) {
      return res.status(400).json({
        success: false,
        message: 'Les champs titre et image sont obligatoires'
      });
    }
    
    const query = `
      INSERT INTO carousel_slides (
        title, subtitle, button_text, button_link, image, active, "order", updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      RETURNING id, image, title, subtitle, button_text as "buttonText", 
                button_link as "buttonLink", active, "order", 
                created_at as "createdAt", updated_at as "updatedAt"
    `;
    
    const values = [title, subtitle, buttonText, buttonLink, image, active, order];
    const { rows } = await pool.query(query, values);
    
    return res.status(201).json({
      success: true,
      data: rows[0],
      message: 'Slide de carousel créé avec succès'
    });
  } catch (error) {
    console.error('Error creating carousel slide:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du slide de carousel',
      error: error.message
    });
  }
});

// PUT - Update an existing carousel slide (admin only)
app.put('/api/carousel/:id', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    const slideId = parseInt(req.params.id);
    
    if (isNaN(slideId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de slide invalide'
      });
    }
    
    const { title, subtitle, buttonText, buttonLink, image, active, order } = req.body;
    
    // Check if slide exists
    const checkQuery = 'SELECT id FROM carousel_slides WHERE id = $1';
    const checkResult = await pool.query(checkQuery, [slideId]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Slide de carousel non trouvé'
      });
    }
    
    // Build dynamic update query
    const updates = [];
    const values = [];
    let paramIndex = 1;
    
    if (title !== undefined) {
      updates.push(`title = $${paramIndex++}`);
      values.push(title);
    }
    
    if (subtitle !== undefined) {
      updates.push(`subtitle = $${paramIndex++}`);
      values.push(subtitle);
    }
    
    if (buttonText !== undefined) {
      updates.push(`button_text = $${paramIndex++}`);
      values.push(buttonText);
    }
    
    if (buttonLink !== undefined) {
      updates.push(`button_link = $${paramIndex++}`);
      values.push(buttonLink);
    }
    
    if (image !== undefined) {
      updates.push(`image = $${paramIndex++}`);
      values.push(image);
    }
    
    if (active !== undefined) {
      updates.push(`active = $${paramIndex++}`);
      values.push(active);
    }
    
    if (order !== undefined) {
      updates.push(`"order" = $${paramIndex++}`);
      values.push(order);
    }
    
    // Always update the updated_at timestamp
    updates.push(`updated_at = NOW()`);
    
    if (updates.length === 1) {
      // Only the updated_at field is being updated, nothing actually changed
      return res.status(400).json({
        success: false,
        message: 'Aucune donnée fournie pour la mise à jour'
      });
    }
    
    // Add the slide ID as the last parameter
    values.push(slideId);
    
    const updateQuery = `
      UPDATE carousel_slides
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, image, title, subtitle, button_text as "buttonText", 
                button_link as "buttonLink", active, "order", 
                created_at as "createdAt", updated_at as "updatedAt"
    `;
    
    const { rows } = await pool.query(updateQuery, values);
    
    return res.json({
      success: true,
      data: rows[0],
      message: 'Slide de carousel mis à jour avec succès'
    });
  } catch (error) {
    console.error(`Error updating carousel slide with id ${req.params.id}:`, error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du slide de carousel',
      error: error.message
    });
  }
});

// DELETE - Remove a carousel slide (admin only)
app.delete('/api/carousel/:id', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    const slideId = parseInt(req.params.id);
    
    if (isNaN(slideId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de slide invalide'
      });
    }
    
    // Check if slide exists
    const checkQuery = 'SELECT id FROM carousel_slides WHERE id = $1';
    const checkResult = await pool.query(checkQuery, [slideId]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Slide de carousel non trouvé'
      });
    }
    
    const deleteQuery = 'DELETE FROM carousel_slides WHERE id = $1';
    await pool.query(deleteQuery, [slideId]);
    
    return res.json({
      success: true,
      message: 'Slide de carousel supprimé avec succès'
    });
  } catch (error) {
    console.error(`Error deleting carousel slide with id ${req.params.id}:`, error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du slide de carousel',
      error: error.message
    });
  }
});

// POST - Reorder carousel slides (admin only)
app.post('/api/carousel/reorder', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    const { slideIds } = req.body;
    
    if (!Array.isArray(slideIds) || slideIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Liste d\'IDs de slides invalide'
      });
    }
    
    // Start a transaction for the reordering
    await pool.query('BEGIN');
    
    // Update the order of each slide
    for (let i = 0; i < slideIds.length; i++) {
      const slideId = slideIds[i];
      await pool.query(
        'UPDATE carousel_slides SET "order" = $1, updated_at = NOW() WHERE id = $2',
        [i, slideId]
      );
    }
    
    // Commit the transaction
    await pool.query('COMMIT');
    
    return res.json({
      success: true,
      message: 'Ordre des slides de carousel mis à jour avec succès'
    });
  } catch (error) {
    // Rollback the transaction in case of error
    await pool.query('ROLLBACK');
    
    console.error('Error reordering carousel slides:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la réorganisation des slides de carousel',
      error: error.message
    });
  }
});

// Start the server
initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`
🚀 Server running on port ${PORT}
✨ Mode: ${process.env.NODE_ENV || 'development'} (PostgreSQL)
🔗 API URL: http://localhost:${PORT}/api
⌛ Time: ${new Date().toLocaleString()}
    `);
  });
}); 
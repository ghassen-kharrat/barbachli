const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// PostgreSQL Connection
const pool = new Pool({
  user: 'postgres',
  password: 'root',
  host: 'localhost',
  port: 5432,
  database: 'ecommerce'
});

async function setupDatabase() {
  try {
    console.log('🔄 Setting up database...');
    
    // Test PostgreSQL connection
    await pool.query('SELECT 1');
    console.log('✅ PostgreSQL connection successful');
    
    // Drop existing tables in reverse order of dependencies
    console.log('🔄 Dropping existing tables...');
    
    try {
      await pool.query(`
        DROP TABLE IF EXISTS order_items CASCADE;
        DROP TABLE IF EXISTS orders CASCADE;
        DROP TABLE IF EXISTS cart_items CASCADE;
        DROP TABLE IF EXISTS carts CASCADE;
        DROP TABLE IF EXISTS reviews CASCADE;
        DROP TABLE IF EXISTS product_images CASCADE;
        DROP TABLE IF EXISTS products CASCADE;
        DROP TABLE IF EXISTS categories CASCADE;
        DROP TABLE IF EXISTS users CASCADE;
      `);
      console.log('✅ Existing tables dropped successfully');
    } catch (dropError) {
      console.error('❌ Error dropping tables:', dropError);
      throw dropError;
    }
    
    // Create tables
    console.log('🔄 Creating tables...');
    const schemaSQL = fs.readFileSync(path.join(__dirname, 'database', 'schema.sql'), 'utf8');
    await pool.query(schemaSQL);
    console.log('✅ Database schema initialized');
    
    // Seed data
    console.log('🔄 Loading seed data...');
    const seedSQL = fs.readFileSync(path.join(__dirname, 'database', 'seed.sql'), 'utf8');
    await pool.query(seedSQL);
    console.log('✅ Seed data loaded successfully');
    
    console.log('🎉 Database setup completed successfully!');
  } catch (error) {
    console.error('❌ Database setup error:', error);
  } finally {
    // Close the pool
    await pool.end();
  }
}

// Run the setup
setupDatabase(); 
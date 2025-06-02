const { Pool } = require('pg');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

console.log('Testing database connection...');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set (value hidden for security)' : 'Not set');

// Create a database connection pool
const pool = new Pool(
  process.env.DATABASE_URL 
    ? { 
        connectionString: process.env.DATABASE_URL, 
        ssl: { 
          rejectUnauthorized: false 
        }
      }
    : {
        user: 'postgres',
        password: 'root',
        host: 'localhost',
        port: 5432,
        database: 'ecommerce'
      }
);

// Test the connection
async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('✅ Successfully connected to the database!');
    
    const result = await client.query('SELECT NOW() as current_time');
    console.log('Current database time:', result.rows[0].current_time);
    
    client.release();
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection error:');
    console.error(error);
    process.exit(1);
  } finally {
    pool.end();
  }
}

testConnection(); 
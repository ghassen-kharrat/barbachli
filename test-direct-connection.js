const { Pool } = require('pg');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

console.log('Testing Supabase direct connection...');

// Create a database connection pool with the direct connection string
const pool = new Pool({
  connectionString: 'postgresql://postgres:Gaston.07730218@db.iptgkvofawoqvykmkcrk.supabase.co:5432/postgres',
  ssl: { 
    rejectUnauthorized: false 
  }
});

// Test the connection
async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('✅ Successfully connected to Supabase using direct connection!');
    
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
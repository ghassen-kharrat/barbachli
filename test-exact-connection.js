const { Pool } = require('pg');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

console.log('Testing Supabase connection with exact format from dashboard...');

// Using the exact format shown in your Supabase dashboard screenshot
const connectionString = 'postgresql://postgres:[YOUR-PASSWORD]@db.iptgkvofawoqvykmkcrk.supabase.co:5432/postgres';
const connectionStringWithPassword = connectionString.replace('[YOUR-PASSWORD]', 'Gaston.07730218');

console.log('Connection string (password hidden):', connectionString);

// Create a database connection pool
const pool = new Pool({
  connectionString: connectionStringWithPassword,
  ssl: { 
    rejectUnauthorized: false 
  }
});

// Test the connection
async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('✅ Successfully connected to Supabase!');
    
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
const { Pool } = require('pg');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

console.log('Testing Supabase transaction pooler connection with explicit SSL mode...');

// Create a database connection pool with the transaction pooler connection string
// Using the format visible in the screenshots for the transaction pooler
const connectionString = 'postgres://postgres.iptgkvofawoqvykmkcrk:Gaston.07730218@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?sslmode=require';
console.log('Connection string (password hidden):', connectionString.replace(/:[^:]*@/, ':****@'));

const pool = new Pool({
  connectionString: connectionString,
  ssl: { 
    rejectUnauthorized: false 
  }
});

// Test the connection
async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('✅ Successfully connected to Supabase using transaction pooler with SSL!');
    
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
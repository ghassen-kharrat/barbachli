const { Pool } = require('pg');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

console.log('Testing Supabase connection with SSL disabled...');

// Direct connection with SSL disabled
const connectionString = 'postgres://postgres:Gaston.07730218@db.iptgkvofawoqvykmkcrk.supabase.co:5432/postgres';
console.log('Connection string (password hidden):', connectionString.replace(/:[^:]*@/, ':****@'));

const pool = new Pool({
  connectionString: connectionString,
  ssl: false // Disable SSL
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
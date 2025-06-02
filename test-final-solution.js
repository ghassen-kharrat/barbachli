const { Pool } = require('pg');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

console.log('Testing Supabase connection with final solution...');

// Set up environment variables for testing
process.env.DATABASE_URL = 'postgres://postgres.iptgkvofawoqvykmkcrk:Gaston.07730218@aws-0-eu-central-1.pooler.supabase.com:6543/postgres';
process.env.PGSSLMODE = 'no-verify';

console.log('Connection string (password hidden):', process.env.DATABASE_URL.replace(/:[^:]*@/, ':****@'));
console.log('SSL Mode:', process.env.PGSSLMODE);

// SSL configuration function
const getSslConfig = () => {
  const sslMode = process.env.PGSSLMODE;
  if (sslMode === "no-verify") {
    return { rejectUnauthorized: false };
  }
  if (sslMode === "disable" || sslMode === "false") {
    return false;
  }
  return { rejectUnauthorized: false }; // Default to accepting self-signed certs
};

// Create a database connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: getSslConfig()
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
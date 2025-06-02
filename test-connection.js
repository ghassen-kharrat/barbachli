const { Pool } = require('pg');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Test different connection string formats
async function testConnections() {
  const connectionStrings = [
    // Format 1: Standard connection with project name in username
    'postgres://postgres:Gaston.07730218@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?options=project%3Diptgkvofawoqvykmkcrk',
    
    // Format 2: Project name in username with dot syntax
    'postgres://postgres.iptgkvofawoqvykmkcrk:Gaston.07730218@aws-0-eu-central-1.pooler.supabase.com:6543/postgres',
    
    // Format 3: Direct connection to the database (no pooler)
    'postgres://postgres:Gaston.07730218@db.iptgkvofawoqvykmkcrk.supabase.co:5432/postgres',
    
    // Format 4: Direct connection with project in username
    'postgres://postgres.iptgkvofawoqvykmkcrk:Gaston.07730218@db.iptgkvofawoqvykmkcrk.supabase.co:5432/postgres',
    
    // Format 5: Connection with session pooler
    'postgres://postgres:Gaston.07730218@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?options=project%3Diptgkvofawoqvykmkcrk&pgbouncer=true',
    
    // Format 6: Connection with transaction pooler
    'postgres://postgres:Gaston.07730218@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?options=project%3Diptgkvofawoqvykmkcrk&pgbouncer=true&connection_limit=1'
  ];

  for (let i = 0; i < connectionStrings.length; i++) {
    const connectionString = connectionStrings[i];
    console.log(`\n\nTesting connection format ${i + 1}:`);
    console.log(connectionString.replace(/:[^:]*@/, ':****@'));
    
    const pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false }
    });
    
    try {
      const client = await pool.connect();
      try {
        const result = await client.query('SELECT NOW()');
        console.log('✅ Connection successful!');
        console.log('Current time:', result.rows[0].now);
      } finally {
        client.release();
      }
    } catch (err) {
      console.error('❌ Connection failed:', err.message);
    } finally {
      await pool.end();
    }
  }
}

// Run the tests
testConnections().catch(err => {
  console.error('Error in test script:', err);
}); 
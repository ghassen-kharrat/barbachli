const { Pool } = require('pg');

// Test connection with the format we believe will work
async function testConnection() {
  // Define connection parameters
  const connectionString = 'postgres://postgres.iptgkvofawoqvykmkcrk:Gaston.07730218@aws-0-eu-central-1.pooler.supabase.com:6543/postgres';
  
  console.log('Testing connection with string:', 
              connectionString.replace(/:[^:]*@/, ':****@'));
  
  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    console.log('Attempting to connect...');
    const client = await pool.connect();
    
    try {
      console.log('Connection established, running test query...');
      const result = await client.query('SELECT NOW() as time');
      console.log('✅ Connection successful!');
      console.log('Database time:', result.rows[0].time);
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('❌ Connection failed:');
    console.error('Error type:', err.constructor.name);
    console.error('Error code:', err.code);
    console.error('Error message:', err.message);
    
    if (err.code === 'XX000' && err.message.includes('Tenant or user not found')) {
      console.error('\nPossible issue: The project ID or username format is incorrect.');
      console.error('Please verify the project ID and credentials in Supabase dashboard.');
    }
  } finally {
    await pool.end();
  }
}

// Run the test
testConnection().catch(err => {
  console.error('Error in test script:', err);
}); 
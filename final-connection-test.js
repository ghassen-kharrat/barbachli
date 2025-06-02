const { Pool } = require('pg');

async function testFinalConnection() {
  // This is the exact connection string we're using in render.yaml
  const connectionString = 'postgres://postgres.iptgkvofawoqvykmkcrk:Gaston.07730218@aws-0-eu-central-1.pooler.supabase.com:6543/postgres';
  
  console.log('Testing final connection string (password hidden):');
  console.log(connectionString.replace(/:[^:]*@/, ':****@'));
  
  // Create pool with same config as in server.js
  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    // Disable prepared statements for transaction pooler
    prepare: false
  });
  
  try {
    console.log('Connecting to Supabase transaction pooler...');
    const client = await pool.connect();
    
    try {
      console.log('Running test query...');
      const result = await client.query('SELECT NOW() as time');
      console.log('✅ CONNECTION SUCCESSFUL!');
      console.log('Database time:', result.rows[0].time);
      console.log('\nThis configuration should work on Render.');
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('❌ CONNECTION FAILED:');
    console.error('Error type:', err.constructor.name);
    console.error('Error code:', err.code);
    console.error('Error message:', err.message);
    
    if (err.code === 'XX000' && err.message.includes('Tenant or user not found')) {
      console.error('\nPossible issue: The project ID or username format is incorrect.');
    } else {
      console.error('\nOther connection error. Check the hostname, port, and credentials.');
    }
    
    console.error('\nVerify your Supabase credentials and try again.');
  } finally {
    await pool.end();
  }
}

// Run the test
testFinalConnection().catch(err => {
  console.error('Error in test script:', err);
}); 
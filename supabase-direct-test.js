const { Pool } = require('pg');

async function testDirectConnection() {
  // From Supabase dashboard direct connection
  const directString = 'postgresql://postgres:Gaston.07730218@db.iptgkvofawoqvykmkcrk.supabase.co:5432/postgres';
  
  // Modified for transaction pooler (port 6543)
  const poolerString = 'postgresql://postgres:Gaston.07730218@aws-0-eu-central-1.pooler.supabase.com:6543/postgres';
  
  // Try both
  const connectionStrings = [
    directString,
    poolerString,
    // Alternative format with postgres
    'postgres://postgres:Gaston.07730218@db.iptgkvofawoqvykmkcrk.supabase.co:5432/postgres',
    // Format with project in username
    'postgres://postgres.iptgkvofawoqvykmkcrk:Gaston.07730218@aws-0-eu-central-1.pooler.supabase.com:6543/postgres'
  ];
  
  for (let i = 0; i < connectionStrings.length; i++) {
    const connectionString = connectionStrings[i];
    console.log(`\n\nTesting connection string ${i + 1}:`);
    console.log(connectionString.replace(/:[^:]*@/, ':****@'));
    
    // Create pool with SSL and no prepared statements
    const pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      prepare: false
    });
    
    try {
      console.log('Connecting...');
      const client = await pool.connect();
      
      try {
        console.log('Running test query...');
        const result = await client.query('SELECT NOW() as time');
        console.log('✅ CONNECTION SUCCESSFUL!');
        console.log('Database time:', result.rows[0].time);
      } finally {
        client.release();
      }
    } catch (err) {
      console.error('❌ CONNECTION FAILED:');
      console.error('Error type:', err.constructor.name);
      console.error('Error code:', err.code);
      console.error('Error message:', err.message);
    } finally {
      await pool.end();
    }
  }
}

// Run the test
testDirectConnection().catch(err => {
  console.error('Error in test script:', err);
}); 
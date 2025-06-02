const { Pool } = require('pg');

// Test various Supabase connection formats
async function testSupabaseConnections() {
  console.log('Testing Supabase connection string formats...');
  
  // Your database information
  const PROJECT_ID = 'iptgkvofawoqvykmkcrk';
  const DB_PASSWORD = 'Gaston.07730218';
  const REGION = 'eu-central-1';
  
  const connectionStrings = [
    // Format 1: Transaction pooler with project reference in username
    `postgres://postgres.${PROJECT_ID}:${DB_PASSWORD}@aws-0-${REGION}.pooler.supabase.com:6543/postgres`,
    
    // Format 2: Session pooler with project reference in username 
    `postgres://postgres.${PROJECT_ID}:${DB_PASSWORD}@aws-0-${REGION}.pooler.supabase.com:5432/postgres`,
    
    // Format 3: Direct connection with project in options
    `postgres://postgres:${DB_PASSWORD}@aws-0-${REGION}.pooler.supabase.com:6543/postgres?options=project%3D${PROJECT_ID}`,
    
    // Format 4: Direct connection without project reference
    `postgres://postgres:${DB_PASSWORD}@aws-0-${REGION}.pooler.supabase.com:6543/postgres`,
  ];

  for (let i = 0; i < connectionStrings.length; i++) {
    const connectionString = connectionStrings[i];
    console.log(`\n\nTesting connection format ${i + 1}:`);
    console.log(connectionString.replace(/:[^:]*@/, ':****@'));
    
    // Create pool with SSL options and no prepared statements for transaction mode
    const pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      // Turn off prepared statements for transaction mode
      ...(i === 0 || i === 2 || i === 3 ? { statement_timeout: 10000, query_timeout: 10000, prepare: false } : {})
    });
    
    try {
      console.log('Connecting...');
      const client = await pool.connect();
      try {
        console.log('Running test query...');
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
    } finally {
      await pool.end();
    }
  }
}

// Run the test
testSupabaseConnections().catch(err => {
  console.error('Error in test script:', err);
}); 
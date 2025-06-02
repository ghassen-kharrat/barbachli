require('dotenv').config();
const { Pool } = require('pg');

const test = async () => {
  console.log('Testing PostgreSQL connection...');
  
  try {
    // Create a connection pool
    const pool = new Pool({
      user: 'postgres',
      password: 'root',
      host: 'localhost',
      port: 5432,
      database: 'ecommerce'
    });
    
    // Test the connection
    const res = await pool.query('SELECT NOW() as now');
    console.log('✅ Connection successful!');
    console.log('Current database time:', res.rows[0].now);
    
    // Close the pool
    await pool.end();
    
    console.log('Connection test completed.');
  } catch (error) {
    console.error('❌ Connection failed!');
    console.error('Error details:', error);
    console.log('\nTroubleshooting tips:');
    console.log('1. Make sure PostgreSQL is installed and running');
    console.log('2. Check if the database "ecommerce" exists');
    console.log('3. Verify your PostgreSQL username and password');
    console.log('4. Check if PostgreSQL is accepting connections on port 5432');
  }
};

test(); 
const { Pool } = require('pg');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables
dotenv.config();

console.log('🔍 Validating deployment configuration...');

// 1. Check environment variables
console.log('\n📋 Checking environment variables:');
const requiredVars = ['DATABASE_URL', 'JWT_SECRET', 'PORT'];
let missingVars = [];

requiredVars.forEach(varName => {
  if (!process.env[varName]) {
    missingVars.push(varName);
    console.log(`❌ Missing ${varName}`);
  } else {
    console.log(`✅ ${varName} is set`);
  }
});

if (missingVars.length > 0) {
  console.error('\n⚠️ Missing required environment variables. Please set them before deploying.');
} else {
  console.log('\n✅ All required environment variables are set.');
}

// 2. Test database connection
console.log('\n📊 Testing database connection...');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('✅ Successfully connected to the database!');
    
    const result = await client.query('SELECT NOW() as current_time');
    console.log('Current database time:', result.rows[0].current_time);
    
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection error:');
    console.error(error.message);
    return false;
  } finally {
    await pool.end();
  }
}

// 3. Check for required files
console.log('\n📁 Checking for required files:');
const requiredFiles = [
  'server.js',
  'package.json',
  'render.yaml',
  path.join('database', 'schema.sql'),
  path.join('database', 'seed.sql')
];

let missingFiles = [];
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} exists`);
  } else {
    missingFiles.push(file);
    console.log(`❌ Missing ${file}`);
  }
});

if (missingFiles.length > 0) {
  console.error('\n⚠️ Missing required files. Please ensure all files are present before deploying.');
} else {
  console.log('\n✅ All required files are present.');
}

// 4. Run all checks
async function runChecks() {
  const dbConnected = await testConnection();
  
  console.log('\n📝 Deployment validation summary:');
  console.log(`Environment variables: ${missingVars.length === 0 ? '✅ All set' : '❌ Missing ' + missingVars.join(', ')}`);
  console.log(`Database connection: ${dbConnected ? '✅ Connected' : '❌ Failed'}`);
  console.log(`Required files: ${missingFiles.length === 0 ? '✅ All present' : '❌ Missing ' + missingFiles.join(', ')}`);
  
  if (missingVars.length === 0 && dbConnected && missingFiles.length === 0) {
    console.log('\n🚀 All checks passed! Your application is ready to deploy.');
    process.exit(0);
  } else {
    console.error('\n⚠️ Some checks failed. Please fix the issues before deploying.');
    process.exit(1);
  }
}

runChecks(); 
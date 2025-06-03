// Script to diagnose and fix connection issues between frontend, backend, and Supabase
require('dotenv').config();
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://iptgkvofawoqvykmkcrk.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlwdGdrdm9mYXdvcXZ5a21rY3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4NjkxMTMsImV4cCI6MjA2NDQ0NTExM30.oUsFpKGgeddXRU5lbaeaufBZ2wV7rnl1a0h2YEfC9b8';
const BACKEND_URL = process.env.BACKEND_URL || 'https://barbachli-1.onrender.com';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://barbachli.vercel.app';

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Test Supabase connection
async function testSupabaseConnection() {
  console.log('Testing Supabase connection...');
  try {
    const { data, error } = await supabase.from('products').select('count');
    if (error) {
      console.error('❌ Supabase connection error:', error);
      return { success: false, error };
    } else {
      console.log('✅ Supabase connection successful!');
      return { success: true, data };
    }
  } catch (err) {
    console.error('❌ Error testing Supabase connection:', err);
    return { success: false, error: err };
  }
}

// Test backend API connection
async function testBackendConnection() {
  console.log('Testing backend API connection...');
  try {
    const response = await axios.get(`${BACKEND_URL}/api`, {
      timeout: 10000
    });
    console.log('✅ Backend API connection successful!', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ Backend API connection error:', error.message);
    return { success: false, error };
  }
}

// Test frontend to backend connection
async function testFrontendToBackendConnection() {
  console.log('Testing frontend to backend connection...');
  try {
    const response = await axios.get(`${FRONTEND_URL}/api/health`, {
      timeout: 10000
    });
    console.log('✅ Frontend to backend connection successful!', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ Frontend to backend connection error:', error.message);
    return { success: false, error };
  }
}

// Fix Supabase connection issues
async function fixSupabaseConnection(result) {
  if (result.success) return true;
  
  console.log('\n🔧 Attempting to fix Supabase connection...');
  
  // Check if the error is related to authentication
  if (result.error && result.error.message && result.error.message.includes('JWT')) {
    console.log('Issue detected: Supabase authentication problem');
    console.log('Recommendation: Verify your Supabase API key is correct and not expired');
    console.log(`Current Supabase URL: ${SUPABASE_URL}`);
    console.log('Current Supabase Key: [Hidden for security]');
    
    // Create or update .env file with Supabase credentials
    try {
      const envPath = path.join(process.cwd(), '.env');
      let envContent = '';
      
      if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf8');
      }
      
      // Update or add Supabase credentials
      if (!envContent.includes('SUPABASE_URL=')) {
        envContent += `\nSUPABASE_URL=${SUPABASE_URL}`;
      }
      
      if (!envContent.includes('SUPABASE_KEY=')) {
        envContent += `\nSUPABASE_KEY=${SUPABASE_KEY}`;
      }
      
      fs.writeFileSync(envPath, envContent);
      console.log('✅ Updated .env file with Supabase credentials');
    } catch (err) {
      console.error('❌ Failed to update .env file:', err.message);
    }
  } else {
    console.log('Issue detected: General Supabase connection problem');
    console.log('Recommendation: Check your network connection and Supabase service status');
  }
  
  return false;
}

// Fix backend connection issues
async function fixBackendConnection(result) {
  if (result.success) return true;
  
  console.log('\n🔧 Attempting to fix backend connection...');
  
  // Check if the backend is running
  if (result.error && result.error.code === 'ECONNREFUSED') {
    console.log('Issue detected: Backend server is not running or unreachable');
    console.log('Recommendation: Start the backend server with "npm run server:supabase"');
    
    // Check if the backend URL is correct
    console.log(`Current backend URL: ${BACKEND_URL}`);
    console.log('If this URL is incorrect, set the correct URL in your .env file:');
    console.log('BACKEND_URL=https://your-backend-url.com');
  } else if (result.error && result.error.code === 'ENOTFOUND') {
    console.log('Issue detected: Backend domain cannot be resolved');
    console.log('Recommendation: Check if the backend URL is correct');
    console.log(`Current backend URL: ${BACKEND_URL}`);
  } else {
    console.log('Issue detected: General backend connection problem');
    console.log('Recommendation: Check your network connection and backend service status');
  }
  
  return false;
}

// Fix frontend to backend connection issues
async function fixFrontendToBackendConnection(result) {
  if (result.success) return true;
  
  console.log('\n🔧 Attempting to fix frontend to backend connection...');
  
  // Check if the frontend is configured correctly
  console.log('Issue detected: Frontend cannot connect to backend');
  console.log('Recommendations:');
  console.log('1. Check if the proxy configuration in vercel.json is correct');
  console.log('2. Verify that the API URL in src/config.js is set correctly');
  console.log('3. Make sure the backend URL is accessible from the frontend');
  
  // Check if src/config.js exists and update it
  try {
    const configPath = path.join(process.cwd(), 'src', 'config.js');
    if (fs.existsSync(configPath)) {
      let configContent = fs.readFileSync(configPath, 'utf8');
      
      console.log('\nCurrent config.js content:');
      console.log(configContent);
      
      console.log('\nMake sure the apiUrl is set correctly in production and development environments.');
    }
  } catch (err) {
    console.error('❌ Failed to check src/config.js:', err.message);
  }
  
  return false;
}

// Run all tests and fix issues
async function diagnoseAndFix() {
  console.log('=== DIAGNOSING CONNECTION ISSUES ===');
  
  // Test connections
  const supabaseResult = await testSupabaseConnection();
  const backendResult = await testBackendConnection();
  const frontendToBackendResult = await testFrontendToBackendConnection();
  
  // Fix issues
  let supabaseFixed = false;
  let backendFixed = false;
  let frontendToBackendFixed = false;
  
  if (!supabaseResult.success) {
    supabaseFixed = await fixSupabaseConnection(supabaseResult);
  } else {
    supabaseFixed = true;
  }
  
  if (!backendResult.success) {
    backendFixed = await fixBackendConnection(backendResult);
  } else {
    backendFixed = true;
  }
  
  if (!frontendToBackendResult.success) {
    frontendToBackendFixed = await fixFrontendToBackendConnection(frontendToBackendResult);
  } else {
    frontendToBackendFixed = true;
  }
  
  // Summary
  console.log('\n=== DIAGNOSIS SUMMARY ===');
  console.log(`Supabase Connection: ${supabaseResult.success ? '✅ WORKING' : supabaseFixed ? '🔧 FIXED' : '❌ FAILED'}`);
  console.log(`Backend API: ${backendResult.success ? '✅ WORKING' : backendFixed ? '🔧 FIXED' : '❌ FAILED'}`);
  console.log(`Frontend to Backend: ${frontendToBackendResult.success ? '✅ WORKING' : frontendToBackendFixed ? '🔧 FIXED' : '❌ FAILED'}`);
  
  if (supabaseResult.success && backendResult.success && frontendToBackendResult.success) {
    console.log('\n✅✅✅ ALL CONNECTIONS WORKING! Your system is properly connected.');
    return true;
  } else if (supabaseFixed && backendFixed && frontendToBackendFixed) {
    console.log('\n🔧🔧🔧 ALL ISSUES FIXED! Please restart your services and test again.');
    return true;
  } else {
    console.log('\n❌❌❌ SOME ISSUES REMAIN! Please follow the recommendations above.');
    return false;
  }
}

// Run the diagnosis and fix process
diagnoseAndFix().catch(err => {
  console.error('Error running diagnosis:', err);
}); 
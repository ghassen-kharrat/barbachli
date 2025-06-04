// Test connection between frontend, backend, and Supabase
require('dotenv').config();
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://iptgkvofawoqvykmkcrk.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlwdGdrdm9mYXdvcXZ5a21rY3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4NjkxMTMsImV4cCI6MjA2NDQ0NTExM30.oUsFpKGgeddXRU5lbaeaufBZ2wV7rnl1a0h2YEfC9b8';
const BACKEND_URL = process.env.BACKEND_URL || 'https://barbachli-auth.onrender.com';
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
      return false;
    } else {
      console.log('✅ Supabase connection successful!');
      return true;
    }
  } catch (err) {
    console.error('❌ Error testing Supabase connection:', err);
    return false;
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
    return true;
  } catch (error) {
    console.error('❌ Backend API connection error:', error.message);
    return false;
  }
}

// Test frontend to backend connection
async function testFrontendToBackendConnection() {
  console.log('Testing frontend to backend connection...');
  try {
    // This simulates a request from the frontend to the backend
    // First check if the frontend is accessible
    const healthResponse = await axios.get(`${FRONTEND_URL}/api/health`, {
      timeout: 10000
    });
    
    console.log('✅ Frontend health check successful!', healthResponse.data);
    
    // Now test a specific API endpoint
    const productsResponse = await axios.get(`${FRONTEND_URL}/api/products?limit=1`, {
      timeout: 10000
    });
    
    console.log('✅ Frontend to backend products API successful!');
    return true;
  } catch (error) {
    console.error('❌ Frontend to backend connection error:', error.message);
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('=== CONNECTION TEST RESULTS ===');
  
  const supabaseConnected = await testSupabaseConnection();
  const backendConnected = await testBackendConnection();
  const frontendToBackendConnected = await testFrontendToBackendConnection();
  
  console.log('\n=== SUMMARY ===');
  console.log(`Supabase Connection: ${supabaseConnected ? '✅ CONNECTED' : '❌ FAILED'}`);
  console.log(`Backend API: ${backendConnected ? '✅ CONNECTED' : '❌ FAILED'}`);
  console.log(`Frontend to Backend: ${frontendToBackendConnected ? '✅ CONNECTED' : '❌ FAILED'}`);
  
  if (supabaseConnected && backendConnected && frontendToBackendConnected) {
    console.log('\n✅✅✅ ALL CONNECTIONS SUCCESSFUL! Your system is properly connected.');
  } else {
    console.log('\n❌❌❌ SOME CONNECTIONS FAILED! Please check the errors above.');
  }
}

// Run the tests
runTests().catch(err => {
  console.error('Error running tests:', err);
}); 
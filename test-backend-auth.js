// Script to test backend authentication endpoints
const axios = require('axios');

// Configuration
const LOCAL_API = 'http://localhost:3001/api';
const RENDER_API = 'https://barbachli-auth.onrender.com/api';
const VERCEL_API = 'https://barbachli.vercel.app/api';

// Test credentials
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'Password123!';

// Helper function to make API requests
async function makeRequest(baseUrl, endpoint, method = 'GET', data = null, token = null) {
  const url = `${baseUrl}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  try {
    const response = await axios({
      method,
      url,
      data,
      headers,
      timeout: 10000
    });
    
    return {
      status: response.status,
      data: response.data,
      success: true
    };
  } catch (error) {
    return {
      status: error.response?.status || 0,
      data: error.response?.data || { message: error.message },
      success: false
    };
  }
}

// Test login endpoint
async function testLogin(baseUrl) {
  console.log(`\n=== TESTING LOGIN AT ${baseUrl} ===`);
  
  const result = await makeRequest(
    baseUrl,
    '/auth/login',
    'POST',
    {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    }
  );
  
  console.log(`Status: ${result.status}`);
  console.log('Response:', JSON.stringify(result.data, null, 2));
  
  if (result.success && result.data?.status === 'success') {
    console.log('✅ Login successful');
    return result.data?.data?.data?.token || result.data?.data?.token;
  } else {
    console.log('❌ Login failed');
    return null;
  }
}

// Test auth check endpoint
async function testAuthCheck(baseUrl, token) {
  console.log(`\n=== TESTING AUTH CHECK AT ${baseUrl} ===`);
  
  if (!token) {
    console.log('❌ No token available for auth check test');
    return false;
  }
  
  const result = await makeRequest(
    baseUrl,
    '/auth/check',
    'GET',
    null,
    token
  );
  
  console.log(`Status: ${result.status}`);
  console.log('Response:', JSON.stringify(result.data, null, 2));
  
  if (result.success && result.data?.status === 'success') {
    console.log('✅ Auth check successful');
    return true;
  } else {
    console.log('❌ Auth check failed');
    return false;
  }
}

// Test profile endpoint
async function testProfile(baseUrl, token) {
  console.log(`\n=== TESTING PROFILE AT ${baseUrl} ===`);
  
  if (!token) {
    console.log('❌ No token available for profile test');
    return false;
  }
  
  const result = await makeRequest(
    baseUrl,
    '/auth/profile',
    'GET',
    null,
    token
  );
  
  console.log(`Status: ${result.status}`);
  console.log('Response:', JSON.stringify(result.data, null, 2));
  
  if (result.success && result.data?.status === 'success') {
    console.log('✅ Profile fetch successful');
    return true;
  } else {
    console.log('❌ Profile fetch failed');
    return false;
  }
}

// Run tests on a specific API
async function testApi(name, baseUrl) {
  console.log(`\n===== TESTING ${name} API =====`);
  
  // Test login
  const token = await testLogin(baseUrl);
  
  // Test auth check
  const authCheckResult = await testAuthCheck(baseUrl, token);
  
  // Test profile
  const profileResult = await testProfile(baseUrl, token);
  
  // Summary
  console.log(`\n=== ${name} API TEST SUMMARY ===`);
  console.log(`Login: ${token ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Auth Check: ${authCheckResult ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Profile: ${profileResult ? '✅ PASS' : '❌ FAIL'}`);
  
  return {
    login: !!token,
    authCheck: authCheckResult,
    profile: profileResult,
    token
  };
}

// Main function to run all tests
async function runAllTests() {
  console.log('===== BACKEND AUTHENTICATION ENDPOINT TESTS =====');
  
  // Test local API
  console.log('\nTesting local API...');
  const localResults = await testApi('LOCAL', LOCAL_API);
  
  // Test Render API
  console.log('\nTesting Render API...');
  const renderResults = await testApi('RENDER', RENDER_API);
  
  // Test Vercel API
  console.log('\nTesting Vercel API...');
  const vercelResults = await testApi('VERCEL', VERCEL_API);
  
  // Final summary
  console.log('\n===== FINAL TEST SUMMARY =====');
  console.log('Local API:', localResults.login && localResults.authCheck && localResults.profile ? '✅ WORKING' : '❌ ISSUES');
  console.log('Render API:', renderResults.login && renderResults.authCheck && renderResults.profile ? '✅ WORKING' : '❌ ISSUES');
  console.log('Vercel API:', vercelResults.login && vercelResults.authCheck && vercelResults.profile ? '✅ WORKING' : '❌ ISSUES');
  
  // Recommendations
  console.log('\n===== RECOMMENDATIONS =====');
  
  if (localResults.login && localResults.authCheck && localResults.profile) {
    console.log('✅ Local API is working properly. You can deploy it to Render.');
  } else {
    console.log('❌ Local API has issues. Fix them before deploying.');
  }
  
  if (renderResults.login && renderResults.authCheck && renderResults.profile) {
    console.log('✅ Render API is working properly. Update frontend to use it.');
  } else {
    console.log('❌ Render API has issues. Deploy your fixed backend.');
  }
  
  if (vercelResults.login && vercelResults.authCheck && vercelResults.profile) {
    console.log('✅ Vercel API is working properly. You can continue using it.');
  } else {
    console.log('❌ Vercel API has issues. Update the API endpoints.');
  }
  
  // Next steps
  console.log('\n===== NEXT STEPS =====');
  
  if (localResults.login && localResults.authCheck && localResults.profile) {
    console.log('1. Deploy the local server to Render');
    console.log('2. Update the frontend to use the Render API');
  } else if (vercelResults.login && vercelResults.authCheck && vercelResults.profile) {
    console.log('1. Continue using the Vercel API endpoints');
    console.log('2. Fix the backend issues separately');
  } else {
    console.log('1. Fix the local server issues');
    console.log('2. Test again');
    console.log('3. Deploy to Render when working');
  }
}

// Run all tests
runAllTests().catch(error => {
  console.error('Error running tests:', error.message);
}); 
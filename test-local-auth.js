// Script to test local authentication endpoints
const axios = require('axios');

// Configuration
const API_URL = 'http://localhost:3001/api';

// Test admin credentials
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'Password123!';

// Test user credentials
const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'Password123!';

// Helper to make API requests
async function apiRequest(endpoint, method = 'GET', data = null, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  try {
    const config = {
      url: `${API_URL}${endpoint}`,
      method,
      headers
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    
    return {
      success: true,
      status: response.status,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      status: error.response?.status,
      data: error.response?.data,
      error: error.message
    };
  }
}

// Test health endpoint
async function testHealth() {
  console.log('\n=== Testing health endpoint ===');
  const result = await apiRequest('/health');
  console.log(`Status: ${result.status}`);
  console.log('Response:', result.data);
  
  if (result.success) {
    console.log('✅ Health endpoint working');
    return true;
  } else {
    console.log('❌ Health endpoint not working');
    return false;
  }
}

// Test admin login
async function testAdminLogin() {
  console.log('\n=== Testing admin login ===');
  const result = await apiRequest('/auth/login', 'POST', {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD
  });
  
  console.log(`Status: ${result.status}`);
  console.log('Response:', JSON.stringify(result.data, null, 2));
  
  if (result.success && result.data.status === 'success') {
    console.log('✅ Admin login successful');
    return result.data.data.data.token;
  } else {
    console.log('❌ Admin login failed');
    return null;
  }
}

// Test user login
async function testUserLogin() {
  console.log('\n=== Testing user login ===');
  const result = await apiRequest('/auth/login', 'POST', {
    email: TEST_EMAIL,
    password: TEST_PASSWORD
  });
  
  console.log(`Status: ${result.status}`);
  console.log('Response:', JSON.stringify(result.data, null, 2));
  
  if (result.success && result.data.status === 'success') {
    console.log('✅ User login successful');
    return result.data.data.data.token;
  } else {
    console.log('❌ User login failed');
    return null;
  }
}

// Test invalid login
async function testInvalidLogin() {
  console.log('\n=== Testing invalid login ===');
  const result = await apiRequest('/auth/login', 'POST', {
    email: 'wrong@example.com',
    password: 'wrong'
  });
  
  console.log(`Status: ${result.status}`);
  console.log('Response:', JSON.stringify(result.data, null, 2));
  
  if (!result.success && result.status === 401) {
    console.log('✅ Invalid login correctly rejected');
    return true;
  } else {
    console.log('❌ Invalid login test failed');
    return false;
  }
}

// Test auth check
async function testAuthCheck(token) {
  console.log('\n=== Testing auth check ===');
  const result = await apiRequest('/auth/check', 'GET', null, token);
  
  console.log(`Status: ${result.status}`);
  console.log('Response:', JSON.stringify(result.data, null, 2));
  
  if (result.success && result.data.status === 'success') {
    console.log('✅ Auth check successful');
    return true;
  } else {
    console.log('❌ Auth check failed');
    return false;
  }
}

// Test profile
async function testProfile(token) {
  console.log('\n=== Testing profile endpoint ===');
  const result = await apiRequest('/auth/profile', 'GET', null, token);
  
  console.log(`Status: ${result.status}`);
  console.log('Response:', JSON.stringify(result.data, null, 2));
  
  if (result.success && result.data.status === 'success') {
    console.log('✅ Profile endpoint successful');
    return true;
  } else {
    console.log('❌ Profile endpoint failed');
    return false;
  }
}

// Test register
async function testRegister() {
  console.log('\n=== Testing registration ===');
  const randomEmail = `test${Math.floor(Math.random() * 10000)}@example.com`;
  
  const result = await apiRequest('/auth/register', 'POST', {
    firstName: 'New',
    lastName: 'User',
    email: randomEmail,
    password: 'Password123!',
    confirmPassword: 'Password123!'
  });
  
  console.log(`Status: ${result.status}`);
  console.log('Response:', JSON.stringify(result.data, null, 2));
  
  if (result.success && result.data.status === 'success') {
    console.log('✅ Registration successful');
    return result.data.data.token;
  } else {
    console.log('❌ Registration failed');
    return null;
  }
}

// Run all tests
async function runTests() {
  console.log('=== TESTING LOCAL AUTHENTICATION API ===');
  
  // Test server health
  const healthOk = await testHealth();
  if (!healthOk) {
    console.error('❌ Server is not responding. Make sure it is running on port 3001.');
    return;
  }
  
  // Test admin login
  const adminToken = await testAdminLogin();
  
  // Test user login
  const userToken = await testUserLogin();
  
  // Test invalid login
  const invalidLoginOk = await testInvalidLogin();
  
  // Test auth check with admin token
  let authCheckOk = false;
  if (adminToken) {
    authCheckOk = await testAuthCheck(adminToken);
  }
  
  // Test profile with admin token
  let profileOk = false;
  if (adminToken) {
    profileOk = await testProfile(adminToken);
  }
  
  // Test registration
  const newUserToken = await testRegister();
  
  // Test auth check with new user token
  let newUserAuthOk = false;
  if (newUserToken) {
    newUserAuthOk = await testAuthCheck(newUserToken);
  }
  
  // Summary
  console.log('\n=== TEST SUMMARY ===');
  console.log(`Health check: ${healthOk ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Admin login: ${adminToken ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`User login: ${userToken ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Invalid login: ${invalidLoginOk ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Auth check: ${authCheckOk ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Profile: ${profileOk ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Registration: ${newUserToken ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`New user auth: ${newUserAuthOk ? '✅ PASS' : '❌ FAIL'}`);
  
  if (adminToken && userToken && invalidLoginOk && authCheckOk && profileOk && newUserToken && newUserAuthOk) {
    console.log('\n✅ All tests passed! The local authentication API is working correctly.');
  } else {
    console.log('\n❌ Some tests failed. Please check the server logs for errors.');
  }
  
  // Next steps
  console.log('\n=== NEXT STEPS ===');
  console.log('1. Deploy this authentication API to your hosting provider (Render)');
  console.log('2. Update your frontend to use the real authentication endpoints');
  console.log('3. Connect to your real database for permanent storage');
}

// Run the tests
runTests().catch(error => {
  console.error('Error running tests:', error.message);
}); 
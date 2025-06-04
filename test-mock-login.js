// Script to test login with the mock API endpoint
const fs = require('fs');
const path = require('path');

// Import the mock login endpoint handler
const authLoginPath = path.join(__dirname, 'api', 'auth', 'auth-login.js');
const authLogin = require(authLoginPath);

// Create mock request and response objects
function createMockReq(method, body) {
  return {
    method,
    body: body || {}
  };
}

function createMockRes() {
  const res = {
    status: function(statusCode) {
      this.statusCode = statusCode;
      return this;
    },
    json: function(data) {
      this.data = data;
      return this;
    },
    end: function() {
      this.ended = true;
      return this;
    },
    setHeader: function(name, value) {
      if (!this.headers) this.headers = {};
      this.headers[name] = value;
      return this;
    },
    // For logging/testing
    statusCode: 200,
    data: null,
    ended: false,
    headers: {}
  };
  return res;
}

// Test login with admin credentials
function testAdminLogin() {
  console.log('Testing admin login with mock API...');
  
  const req = createMockReq('POST', {
    email: 'admin@example.com',
    password: 'Password123!'
  });
  
  const res = createMockRes();
  
  // Call the mock API handler
  authLogin(req, res);
  
  // Log the results
  console.log('Status code:', res.statusCode);
  console.log('Response data:', JSON.stringify(res.data, null, 2));
  
  // Verify it has the admin role
  if (res.statusCode === 200 && 
      res.data && 
      res.data.data && 
      res.data.data.data && 
      res.data.data.data.role === 'admin') {
    console.log('✅ Admin login successful! User has admin role.');
    return true;
  } else {
    console.log('❌ Admin login failed or user does not have admin role.');
    return false;
  }
}

// Test login with test user
function testUserLogin() {
  console.log('\nTesting regular user login with mock API...');
  
  const req = createMockReq('POST', {
    email: 'test@example.com',
    password: 'Password123!'
  });
  
  const res = createMockRes();
  
  // Call the mock API handler
  authLogin(req, res);
  
  // Log the results
  console.log('Status code:', res.statusCode);
  console.log('Response data:', JSON.stringify(res.data, null, 2));
  
  if (res.statusCode === 200) {
    console.log('✅ User login successful!');
    return true;
  } else {
    console.log('❌ User login failed.');
    return false;
  }
}

// Test invalid login
function testInvalidLogin() {
  console.log('\nTesting invalid login with mock API...');
  
  const req = createMockReq('POST', {
    email: 'wrong@example.com',
    password: 'WrongPassword'
  });
  
  const res = createMockRes();
  
  // Call the mock API handler
  authLogin(req, res);
  
  // Log the results
  console.log('Status code:', res.statusCode);
  console.log('Response data:', JSON.stringify(res.data, null, 2));
  
  if (res.statusCode === 401) {
    console.log('✅ Invalid login correctly rejected.');
    return true;
  } else {
    console.log('❌ Invalid login test failed.');
    return false;
  }
}

// Run all tests
function runTests() {
  console.log('=== TESTING MOCK API ENDPOINTS ===\n');
  
  // Check if the mock API file exists
  if (!fs.existsSync(authLoginPath)) {
    console.error(`❌ Mock API file not found: ${authLoginPath}`);
    console.error('Please run fix-auth-endpoints.js first to generate the mock APIs.');
    return;
  }
  
  // Run the tests
  const adminLoginResult = testAdminLogin();
  const userLoginResult = testUserLogin();
  const invalidLoginResult = testInvalidLogin();
  
  // Summary
  console.log('\n=== TEST RESULTS ===');
  console.log(`Admin login: ${adminLoginResult ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`User login: ${userLoginResult ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Invalid login: ${invalidLoginResult ? '✅ PASS' : '❌ FAIL'}`);
  
  if (adminLoginResult && userLoginResult && invalidLoginResult) {
    console.log('\n✅ All tests passed! The mock API is working correctly.');
    console.log('\nNext steps:');
    console.log('1. Deploy these mock API endpoints to Vercel');
    console.log('2. Update the frontend to use the deployed endpoints');
    console.log('3. Use the admin credentials: admin@example.com / Password123!');
  } else {
    console.log('\n❌ Some tests failed. Please check the mock API implementation.');
  }
}

// Run the tests
runTests(); 
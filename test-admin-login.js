// Script to test admin login after password update
const axios = require('axios');

// Create API clients
const vercelApi = axios.create({
  baseURL: 'https://barbachli.vercel.app',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

const backendApi = axios.create({
  baseURL: 'https://barbachli-1.onrender.com',
  timeout: 40000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Admin credentials 
const adminCredentials = {
  email: 'admin@example.com',
  password: 'Password123!'
};

// Test login to Vercel API
async function testVercelLogin() {
  try {
    console.log('Testing admin login via Vercel API...');
    console.log('Email:', adminCredentials.email);
    console.log('Password: Password123!');
    
    const response = await vercelApi.post('/api/auth/login', adminCredentials);
    
    console.log('✅ Admin login successful!');
    console.log('Status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
    // Check if user has admin role
    const userRole = response.data?.data?.user?.role;
    if (userRole && userRole.toLowerCase() === 'admin') {
      console.log('✅ User has admin privileges!');
    } else {
      console.log('⚠️ User does not have admin role:', userRole || 'unknown');
    }
    
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ Admin login via Vercel API failed:');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error:', error.message);
    }
    
    return { success: false, error };
  }
}

// Test login to backend API
async function testBackendLogin() {
  try {
    console.log('\nTesting admin login via direct backend API...');
    console.log('Email:', adminCredentials.email);
    console.log('Password: Password123!');
    
    const response = await backendApi.post('/api/auth/login', adminCredentials);
    
    console.log('✅ Admin login successful!');
    console.log('Status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
    // Check if user has admin role
    const userRole = response.data?.user?.role || response.data?.data?.user?.role;
    if (userRole && userRole.toLowerCase() === 'admin') {
      console.log('✅ User has admin privileges!');
    } else {
      console.log('⚠️ User does not have admin role:', userRole || 'unknown');
    }
    
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ Admin login via backend API failed:');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error:', error.message);
    }
    
    return { success: false, error };
  }
}

// Run both tests
async function runTests() {
  console.log('ADMIN LOGIN TEST\n');
  
  // Test Vercel API
  const vercelResult = await testVercelLogin();
  
  // Test backend API
  const backendResult = await testBackendLogin();
  
  // Summary
  console.log('\n=== TEST SUMMARY ===');
  console.log('Vercel API login:', vercelResult.success ? 'SUCCESS ✅' : 'FAILED ❌');
  console.log('Backend API login:', backendResult.success ? 'SUCCESS ✅' : 'FAILED ❌');
  
  if (vercelResult.success || backendResult.success) {
    console.log('\n✅ ADMIN PASSWORD UPDATE SUCCESSFUL!');
    console.log('You can now use these admin credentials:');
    console.log('Email: admin@example.com');
    console.log('Password: Password123!');
  } else {
    console.log('\n❌ ADMIN PASSWORD UPDATE VERIFICATION FAILED');
    console.log('Please follow the instructions in update-password-instructions.md to manually update the password');
  }
}

// Run the tests
runTests().catch(console.error); 
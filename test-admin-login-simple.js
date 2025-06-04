// Simple script to test admin login
const axios = require('axios');

// Admin credentials
const adminCredentials = {
  email: 'admin@example.com',
  password: 'Password123!'
};

// Test login to Vercel API
async function testLogin() {
  console.log('Testing admin login...');
  console.log('Email:', adminCredentials.email);
  console.log('Password:', adminCredentials.password);
  
  try {
    console.log('\nTrying Vercel API...');
    const response = await axios.post('https://barbachli.vercel.app/api/auth/login', adminCredentials, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    console.log('✅ Login successful!');
    console.log('Status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
    // Check if user has admin role
    const userRole = response.data?.data?.user?.role;
    console.log('User role:', userRole || 'unknown');
    
    return { success: true, isAdmin: userRole === 'admin', data: response.data };
  } catch (error) {
    console.error('❌ Login failed:');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error:', error.message);
    }
    
    return { success: false, error };
  }
}

// Run the test
testLogin().catch(console.error); 
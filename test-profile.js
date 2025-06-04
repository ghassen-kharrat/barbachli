// Script to test accessing user profile with test account
const axios = require('axios');

async function testUserProfile() {
  // Test credentials
  const credentials = {
    email: 'test@example.com',
    password: 'Password123!'
  };
  
  console.log('Testing user profile access with test account:');
  console.log('Email:', credentials.email);
  console.log('Password: Password123!');
  
  try {
    // Step 1: Login to get token
    console.log('\nStep 1: Logging in to get token...');
    const loginResponse = await axios.post('https://barbachli.vercel.app/api/auth/login', credentials, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 30000
    });
    
    console.log('✅ Login successful!');
    console.log('Status:', loginResponse.status);
    
    // Extract token
    const token = loginResponse.data?.data?.token;
    if (!token) {
      throw new Error('No token received from login');
    }
    
    console.log('Token received:', token);
    
    // Step 2: Try to access profile with token
    console.log('\nStep 2: Accessing user profile...');
    const profileResponse = await axios.get('https://barbachli.vercel.app/api/auth/profile', {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      timeout: 30000
    });
    
    console.log('✅ Profile access successful!');
    console.log('Status:', profileResponse.status);
    console.log('Profile data:', JSON.stringify(profileResponse.data, null, 2));
    
    // Step 3: Try to access products endpoint
    console.log('\nStep 3: Accessing products endpoint...');
    const productsResponse = await axios.get('https://barbachli.vercel.app/api/products', {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      timeout: 30000
    });
    
    console.log('✅ Products access successful!');
    console.log('Status:', productsResponse.status);
    console.log('Products count:', productsResponse.data?.data?.length || 0);
    
    console.log('\n=== CONCLUSION ===');
    console.log('The test account is working correctly and can access protected resources.');
    console.log('Use these credentials:');
    console.log('Email: test@example.com');
    console.log('Password: Password123!');
    
    return { success: true };
  } catch (error) {
    console.error('❌ Error during test:');
    
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
testUserProfile().catch(console.error); 
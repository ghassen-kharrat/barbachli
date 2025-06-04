// Script to test accessing user profile with direct backend API
const axios = require('axios');

async function testUserProfile() {
  // Test credentials
  const credentials = {
    email: 'test@example.com',
    password: 'Password123!'
  };
  
  console.log('Testing user profile access with direct backend API:');
  console.log('Email:', credentials.email);
  console.log('Password: Password123!');
  
  try {
    // Step 1: Login to get token
    console.log('\nStep 1: Logging in to get token...');
    const loginResponse = await axios.post('https://barbachli-auth.onrender.com/api/auth/login', credentials, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 40000
    });
    
    console.log('✅ Login successful!');
    console.log('Status:', loginResponse.status);
    console.log('Login response:', JSON.stringify(loginResponse.data, null, 2));
    
    // Extract token
    const token = loginResponse.data?.token || loginResponse.data?.data?.token;
    if (!token) {
      throw new Error('No token received from login');
    }
    
    console.log('Token received:', token);
    
    // Step 2: Try to access user data with token
    console.log('\nStep 2: Accessing user data...');
    
    // Check if /api/auth/me endpoint exists
    try {
      const meResponse = await axios.get('https://barbachli-auth.onrender.com/api/auth/me', {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        timeout: 40000
      });
      
      console.log('✅ User data access successful via /api/auth/me!');
      console.log('Status:', meResponse.status);
      console.log('User data:', JSON.stringify(meResponse.data, null, 2));
    } catch (meError) {
      console.log('❌ Error accessing /api/auth/me:', meError.response?.status || meError.message);
      
      // Try /api/users/me endpoint
      try {
        const userMeResponse = await axios.get('https://barbachli-auth.onrender.com/api/users/me', {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          timeout: 40000
        });
        
        console.log('✅ User data access successful via /api/users/me!');
        console.log('Status:', userMeResponse.status);
        console.log('User data:', JSON.stringify(userMeResponse.data, null, 2));
      } catch (userMeError) {
        console.log('❌ Error accessing /api/users/me:', userMeError.response?.status || userMeError.message);
      }
    }
    
    // Step 3: Try to access products endpoint
    console.log('\nStep 3: Accessing products endpoint...');
    const productsResponse = await axios.get('https://barbachli-auth.onrender.com/api/products', {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      timeout: 40000
    });
    
    console.log('✅ Products access successful!');
    console.log('Status:', productsResponse.status);
    console.log('Products count:', productsResponse.data?.length || 0);
    
    console.log('\n=== CONCLUSION ===');
    console.log('The test account login works with the direct backend API.');
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
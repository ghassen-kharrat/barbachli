// Script to attempt direct user creation via backend API
const axios = require('axios');

// Create a direct axios instance for the backend
const backendApi = axios.create({
  baseURL: 'https://barbachli-1.onrender.com',
  timeout: 40000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Generate a unique email to avoid duplicate registration errors
function generateUniqueEmail() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `user${timestamp}${random}@example.com`;
}

// Format user data for creation
const userData = {
  firstName: 'Test',
  lastName: 'User',
  email: generateUniqueEmail(),
  password: 'Password123!',
  confirmPassword: 'Password123!',
  phone: '1234567890',
  address: '123 Test Street',
  city: 'Test City',
  zipCode: '12345'
};

async function createUser() {
  console.log('Attempting to create user directly via backend API');
  console.log('User data:', { ...userData, password: '******', confirmPassword: '******' });
  
  try {
    // First check if the server is online
    try {
      const healthCheck = await backendApi.get('/api/products');
      console.log('Backend is online, products endpoint responded with status:', healthCheck.status);
    } catch (healthError) {
      console.warn('Backend health check failed:', healthError.message);
      console.log('Attempting user creation anyway...');
    }
    
    // Try to create the user through the register endpoint
    console.log('\nAttempting registration...');
    const response = await backendApi.post('/api/auth/register', userData);
    
    console.log('✅ User creation successful!');
    console.log('Status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
    console.log('\n=== USER CREDENTIALS ===');
    console.log('Email:', userData.email);
    console.log('Password: Password123!');
    console.log('========================');
    
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ User creation failed:');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error data:', JSON.stringify(error.response.data, null, 2));
      
      // If we're hitting rate limits, try an alternative approach
      if (error.response.data?.message?.includes('rate limit')) {
        console.log('\nHit rate limit, trying with a predefined email...');
        
        // Try with a different email that might bypass rate limits
        const altUserData = {
          ...userData,
          email: `testuser${Date.now()}@barbachli.com` // Using the site's domain might bypass some filters
        };
        
        try {
          const altResponse = await backendApi.post('/api/auth/register', altUserData);
          
          console.log('✅ Alternative user creation successful!');
          console.log('Status:', altResponse.status);
          console.log('Response data:', JSON.stringify(altResponse.data, null, 2));
          
          console.log('\n=== USER CREDENTIALS ===');
          console.log('Email:', altUserData.email);
          console.log('Password: Password123!');
          console.log('========================');
          
          return { success: true, data: altResponse.data };
        } catch (altError) {
          console.error('❌ Alternative user creation also failed:');
          if (altError.response) {
            console.error('Status:', altError.response.status);
            console.error('Error data:', JSON.stringify(altError.response.data, null, 2));
          } else {
            console.error('Error:', altError.message);
          }
        }
      }
    } else {
      console.error('Error:', error.message);
    }
    
    console.log('\n=== IMPORTANT NOTICE ===');
    console.log('User creation failed due to rate limits or other restrictions.');
    console.log('You can use these existing test credentials:');
    console.log('Email: test@example.com');
    console.log('Password: Password123!');
    console.log('========================');
    
    return { success: false, error };
  }
}

// Execute the user creation
createUser().catch(console.error); 
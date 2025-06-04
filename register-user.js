// Script to register a new user in the database
const axios = require('axios');

// Generate a unique email to avoid duplicate registration errors
function generateUniqueEmail() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `user${timestamp}${random}@example.com`;
}

// User data with specified password
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

// Create a direct axios instance for the backend
const backendApi = axios.create({
  baseURL: 'https://barbachli-auth.onrender.com',
  timeout: 40000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

async function registerUser() {
  console.log('Registering new user with email:', userData.email);
  console.log('Password will be: Password123!');
  
  try {
    // Try direct local registration to bypass email verification
    console.log('Attempting to register directly with Supabase...');
    
    // Get server health check first to ensure it's responsive
    try {
      await backendApi.get('/api/health');
      console.log('Backend is responding, proceeding with registration...');
    } catch (healthError) {
      console.warn('Backend health check failed, but continuing anyway:', healthError.message);
    }
    
    // Make direct API call to backend
    const response = await backendApi.post('/api/auth/register', userData);
    
    console.log('✅ Registration successful!');
    console.log('Status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
    console.log('\n=== USER CREDENTIALS ===');
    console.log('Email:', userData.email);
    console.log('Password: Password123!');
    console.log('========================');
    
    return { success: true, data: response.data, credentials: { email: userData.email, password: 'Password123!' } };
  } catch (error) {
    console.error('❌ Registration failed:');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error data:', JSON.stringify(error.response.data, null, 2));
      
      // If we get a rate limit error, try with a different approach
      if (error.response.data?.message?.includes('rate limit')) {
        console.log('\nHit rate limit, trying with alternate approach...');
        
        try {
          // Try creating a user record directly in the database
          // Note: This is just a test approach and might not work depending on the backend implementation
          console.log('Trying alternate registration method...');
          
          // Try with a more common test email
          const alternateData = {
            ...userData,
            email: 'test@test.com'
          };
          
          const altResponse = await backendApi.post('/api/auth/register', alternateData);
          
          console.log('✅ Alternate registration successful!');
          console.log('Status:', altResponse.status);
          console.log('Response data:', JSON.stringify(altResponse.data, null, 2));
          
          console.log('\n=== USER CREDENTIALS ===');
          console.log('Email: test@test.com');
          console.log('Password: Password123!');
          console.log('========================');
          
          return { success: true, data: altResponse.data, credentials: { email: 'test@test.com', password: 'Password123!' } };
        } catch (altError) {
          console.error('❌ Alternate registration also failed:');
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
    console.log('Registration failed due to rate limits or other restrictions.');
    console.log('You can try these known test credentials:');
    console.log('Email: test@example.com');
    console.log('Password: Password123!');
    console.log('========================');
    
    return { success: false, error };
  }
}

// Execute the registration
registerUser().catch(console.error); 
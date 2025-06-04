// Script to test login with test credentials
const axios = require('axios');

async function testLogin() {
  // Test credentials
  const credentials = {
    email: 'test@example.com',
    password: 'Password123!'
  };
  
  console.log('Testing login with credentials:');
  console.log('Email:', credentials.email);
  console.log('Password: Password123!');
  
  try {
    // Try Vercel API
    console.log('\nTrying login via Vercel API...');
    const response = await axios.post('https://barbachli.vercel.app/api/auth/login', credentials, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 30000
    });
    
    console.log('✅ Login successful!');
    console.log('Status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
    // If we got a token, print it
    if (response.data?.data?.token) {
      console.log('\nAccess token:', response.data.data.token);
    }
    
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ Login via Vercel API failed:');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error data:', JSON.stringify(error.response.data, null, 2));
      
      // Try direct backend
      console.log('\nTrying login via direct backend...');
      try {
        const directResponse = await axios.post('https://barbachli-1.onrender.com/api/auth/login', credentials, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: 40000
        });
        
        console.log('✅ Direct login successful!');
        console.log('Status:', directResponse.status);
        console.log('Response data:', JSON.stringify(directResponse.data, null, 2));
        
        // If we got a token, print it
        if (directResponse.data?.data?.token) {
          console.log('\nAccess token:', directResponse.data.data.token);
        }
        
        return { success: true, data: directResponse.data };
      } catch (directError) {
        console.error('❌ Direct login also failed:');
        if (directError.response) {
          console.error('Status:', directError.response.status);
          console.error('Error data:', JSON.stringify(directError.response.data, null, 2));
        } else {
          console.error('Error:', directError.message);
        }
      }
    } else {
      console.error('Error:', error.message);
    }
    
    return { success: false, error };
  }
}

// Run the test
testLogin().catch(console.error); 
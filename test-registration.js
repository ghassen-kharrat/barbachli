// Test script for registration API
const axios = require('axios');

// Test registration with camelCase format (expected by backend)
async function testRegistrationCamelCase() {
  console.log('===== TESTING REGISTRATION WITH CAMELCASE FORMAT =====');
  
  const testData = {
    firstName: 'Test',
    lastName: 'User',
    email: `test${Date.now()}@example.com`, // Use timestamp to ensure unique email
    password: 'password123',
    confirmPassword: 'password123',
    phone: '1234567890'
  };
  
  try {
    console.log('Registration data:', { ...testData, password: '*****', confirmPassword: '*****' });
    
    // Try the Vercel API proxy
    const response = await axios.post('https://barbachli.vercel.app/api/auth/register', testData, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    console.log('Registration successful!');
    console.log('Status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Registration failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error:', error.message);
    }
    return { success: false, error };
  }
}

// Test registration with snake_case format (coming from frontend)
async function testRegistrationSnakeCase() {
  console.log('===== TESTING REGISTRATION WITH SNAKE_CASE FORMAT =====');
  
  const testData = {
    first_name: 'Test',
    last_name: 'User',
    email: `test${Date.now()}@example.com`, // Use timestamp to ensure unique email
    password: 'password123',
    confirm_password: 'password123',
    phone: '1234567890'
  };
  
  try {
    console.log('Registration data:', { ...testData, password: '*****', confirm_password: '*****' });
    
    // Try the Vercel API proxy
    const response = await axios.post('https://barbachli.vercel.app/api/auth/register', testData, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    console.log('Registration successful!');
    console.log('Status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Registration failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error:', error.message);
    }
    return { success: false, error };
  }
}

// Test direct registration to backend
async function testDirectRegistration() {
  console.log('===== TESTING DIRECT REGISTRATION TO BACKEND =====');
  
  const testData = {
    firstName: 'Test',
    lastName: 'User',
    email: `test${Date.now()}@example.com`, // Use timestamp to ensure unique email
    password: 'password123',
    confirmPassword: 'password123',
    phone: '1234567890'
  };
  
  try {
    console.log('Registration data:', { ...testData, password: '*****', confirmPassword: '*****' });
    
    // Try direct API call to backend
    const response = await axios.post('https://barbachli-1.onrender.com/api/auth/register', testData, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    console.log('Registration successful!');
    console.log('Status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Registration failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error:', error.message);
    }
    return { success: false, error };
  }
}

// Run all tests
async function runTests() {
  console.log('Starting registration tests...');
  
  // Test with camelCase format
  const camelCaseResult = await testRegistrationCamelCase();
  
  // Test with snake_case format
  const snakeCaseResult = await testRegistrationSnakeCase();
  
  // Test direct backend call
  const directResult = await testDirectRegistration();
  
  // Print test summary
  console.log('\n===== TEST SUMMARY =====');
  console.log('CamelCase format test:', camelCaseResult.success ? 'PASSED' : 'FAILED');
  console.log('Snake_case format test:', snakeCaseResult.success ? 'PASSED' : 'FAILED');
  console.log('Direct backend test:', directResult.success ? 'PASSED' : 'FAILED');
}

// Run the tests
runTests().catch(console.error); 
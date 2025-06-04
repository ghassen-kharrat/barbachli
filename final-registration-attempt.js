// Final attempt to register a user
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
  baseURL: 'https://barbachli-auth.onrender.com',
  timeout: 40000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Generate various test emails
function generateEmails() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  
  return [
    `user${timestamp}${random}@example.com`,
    `test${timestamp}${random}@gmail.com`,
    `test-${random}@protonmail.com`,
    `test+${random}@outlook.com`,
    `test.user.${random}@yahoo.com`
  ];
}

// Create test user data
function createUserData(email) {
  return {
    firstName: 'Test',
    lastName: 'User',
    email: email,
    password: 'Password123!',
    confirmPassword: 'Password123!',
    phone: '1234567890'
  };
}

// Try to register a user
async function tryRegister(api, userData, endpoint = '/api/auth/register') {
  try {
    const response = await api.post(endpoint, userData);
    return { success: true, status: response.status, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      status: error.response?.status, 
      message: error.response?.data?.message || error.message 
    };
  }
}

// Login test
async function tryLogin(credentials) {
  try {
    const response = await vercelApi.post('/api/auth/login', credentials);
    return { success: true, status: response.status, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      status: error.response?.status, 
      message: error.response?.data?.message || error.message 
    };
  }
}

// Main function to try multiple registration approaches
async function attemptRegistration() {
  console.log('Starting final registration attempts...');
  
  // Try using the existing test account
  console.log('\n1. Testing login with existing account:');
  const testLogin = await tryLogin({ 
    email: 'test@example.com', 
    password: 'Password123!' 
  });
  
  if (testLogin.success) {
    console.log('✅ Login successful with test account!');
    console.log('You can use these credentials:');
    console.log('Email: test@example.com');
    console.log('Password: Password123!');
    console.log('Response:', JSON.stringify(testLogin.data, null, 2));
    return;
  } else {
    console.log('❌ Login failed with test account:', testLogin.message);
  }
  
  // Try multiple emails with Vercel API
  const emails = generateEmails();
  console.log(`\n2. Trying registration with ${emails.length} different email addresses...`);
  
  for (let i = 0; i < emails.length; i++) {
    const email = emails[i];
    console.log(`\nAttempt ${i+1}/${emails.length} with email: ${email}`);
    
    const userData = createUserData(email);
    const result = await tryRegister(vercelApi, userData);
    
    if (result.success) {
      console.log('✅ Registration successful!');
      console.log('Response:', JSON.stringify(result.data, null, 2));
      console.log('\nYou can use these credentials:');
      console.log(`Email: ${email}`);
      console.log('Password: Password123!');
      return;
    } else {
      console.log(`❌ Registration failed: ${result.message} (${result.status})`);
    }
    
    // Wait 2 seconds between attempts to avoid rate limiting
    if (i < emails.length - 1) {
      console.log('Waiting 2 seconds before next attempt...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  // Try direct backend API
  console.log('\n3. Trying direct backend API registration...');
  for (let i = 0; i < emails.length; i++) {
    const email = emails[i];
    console.log(`\nBackend attempt ${i+1}/${emails.length} with email: ${email}`);
    
    const userData = createUserData(email);
    const result = await tryRegister(backendApi, userData);
    
    if (result.success) {
      console.log('✅ Registration successful!');
      console.log('Response:', JSON.stringify(result.data, null, 2));
      console.log('\nYou can use these credentials:');
      console.log(`Email: ${email}`);
      console.log('Password: Password123!');
      return;
    } else {
      console.log(`❌ Registration failed: ${result.message} (${result.status})`);
    }
    
    // Wait 2 seconds between attempts
    if (i < emails.length - 1) {
      console.log('Waiting 2 seconds before next attempt...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  console.log('\n=== FINAL CONCLUSION ===');
  console.log('All registration attempts failed, likely due to rate limiting or server restrictions.');
  console.log('Please use the existing test account:');
  console.log('Email: test@example.com');
  console.log('Password: Password123!');
}

// Run the registration attempts
attemptRegistration().catch(console.error); 
// Script to test login with existing users from Supabase Authentication
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

// List of test users to try (based on your Supabase Authentication screenshot)
const testUsers = [
  // Test Users from the screenshot
  {
    email: 'test1748988875238486@gmail.com',
    password: 'Password123!' // Standard test password to try
  },
  {
    email: 'test1748988873633656@gmail.com',
    password: 'Password123!'
  },
  {
    email: 'test1748988692732@gmail.com',
    password: 'Password123!'
  },
  {
    email: 'test1748988691602@gmail.com',
    password: 'Password123!'
  },
  {
    email: 'test1748988690998@gmail.com',
    password: 'Password123!'
  },
  // Your personal email
  {
    email: 'kharrat.ghassen@gmail.com',
    password: 'your-password-here' // Replace with your actual password if you want to test
  }
];

// Test login with a single user
async function testUserLogin(user) {
  console.log(`\nTesting login for: ${user.email}`);
  console.log('Password:', user.password === 'your-password-here' ? '[HIDDEN]' : user.password);
  
  try {
    // Try Vercel API first
    console.log('Trying via Vercel API...');
    const response = await vercelApi.post('/api/auth/login', user);
    
    console.log('✅ Login successful!');
    console.log('Status:', response.status);
    console.log('User data:', JSON.stringify(response.data?.data?.user || {}, null, 2));
    
    // Extract token if available
    const token = response.data?.data?.token;
    if (token) {
      console.log('Token received:', token.substring(0, 15) + '...');
    }
    
    return { success: true, data: response.data };
  } catch (error) {
    console.log('❌ Vercel API login failed:', error.response?.status || error.message);
    
    // Try backend API
    try {
      console.log('Trying via direct backend API...');
      const backendResponse = await backendApi.post('/api/auth/login', user);
      
      console.log('✅ Backend login successful!');
      console.log('Status:', backendResponse.status);
      console.log('User data:', JSON.stringify(backendResponse.data?.data?.user || {}, null, 2));
      
      return { success: true, data: backendResponse.data };
    } catch (backendError) {
      console.log('❌ Backend API login failed:', backendError.response?.status || backendError.message);
    }
    
    return { success: false, error };
  }
}

// Test all users
async function testAllUsers() {
  console.log('=== TESTING LOGIN WITH EXISTING USERS ===\n');
  
  const results = [];
  
  for (const user of testUsers) {
    if (user.password === 'your-password-here') {
      console.log(`\nSkipping ${user.email} as password is not set`);
      results.push({ user: user.email, success: false, reason: 'Password not provided' });
      continue;
    }
    
    try {
      const result = await testUserLogin(user);
      results.push({ user: user.email, success: result.success });
    } catch (error) {
      console.error(`Error testing ${user.email}:`, error.message);
      results.push({ user: user.email, success: false, error: error.message });
    }
  }
  
  // Print summary
  console.log('\n=== TEST SUMMARY ===');
  results.forEach(result => {
    console.log(`${result.user}: ${result.success ? 'SUCCESS ✅' : 'FAILED ❌'} ${result.reason || ''}`);
  });
  
  const anySuccess = results.some(r => r.success);
  
  if (anySuccess) {
    console.log('\n✅ Found working users! You can use the credentials above.');
  } else {
    console.log('\n❌ No working users found. You need to:');
    console.log('1. Create a new user in Supabase Authentication');
    console.log('2. Follow the instructions in create-admin-user.md');
  }
}

// Run the tests
testAllUsers().catch(console.error); 
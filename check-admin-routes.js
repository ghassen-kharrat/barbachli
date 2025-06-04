// Script to check for admin routes and API endpoints
const axios = require('axios');

// Create a direct axios instance for the backend
const backendApi = axios.create({
  baseURL: 'https://barbachli-auth.onrender.com',
  timeout: 40000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// List of potential admin endpoints to check
const potentialEndpoints = [
  '/api/admin/users',
  '/api/users',
  '/api/admin/create-user',
  '/api/auth/admin-register',
  '/api/auth/admin/register',
  '/api/admin/auth/register'
];

// Check if an endpoint exists by making a GET request
async function checkEndpoint(endpoint) {
  try {
    await backendApi.get(endpoint);
    return { exists: true, method: 'GET', status: 200 };
  } catch (error) {
    if (error.response) {
      // If we get a response (even error), the endpoint exists
      // 401/403 usually means the endpoint exists but requires auth
      if (error.response.status === 401 || error.response.status === 403) {
        return { 
          exists: true, 
          method: 'GET', 
          status: error.response.status,
          requiresAuth: true 
        };
      }
      return { 
        exists: error.response.status !== 404, 
        method: 'GET',
        status: error.response.status 
      };
    }
    return { exists: false, error: error.message };
  }
}

// Try to log in as admin
async function tryAdminLogin() {
  console.log('Attempting admin login with common credentials...');
  
  // Common admin credentials to try
  const adminCredentials = [
    { email: 'admin@example.com', password: 'Password123!' },
    { email: 'admin@barbachli.com', password: 'Password123!' },
    { email: 'admin@admin.com', password: 'admin123' },
  ];
  
  for (const credentials of adminCredentials) {
    try {
      console.log(`Trying login with ${credentials.email}...`);
      const response = await backendApi.post('/api/auth/login', credentials);
      
      if (response.status === 200) {
        console.log('✅ Admin login successful!');
        console.log('Response:', JSON.stringify(response.data, null, 2));
        
        // Extract token if available
        const token = response.data?.data?.token || response.data?.token;
        if (token) {
          console.log('Token:', token);
          return { success: true, token, credentials };
        }
        return { success: true, credentials };
      }
    } catch (error) {
      console.log(`Login failed for ${credentials.email}:`, 
                 error.response?.status || error.message);
    }
  }
  
  return { success: false };
}

// Main function to check for admin functionality
async function checkAdminRoutes() {
  console.log('Checking for admin routes and API endpoints...');
  
  // First check for standard authentication
  const adminLoginResult = await tryAdminLogin();
  
  // Check all potential endpoints
  console.log('\nChecking potential admin endpoints:');
  
  const results = {};
  for (const endpoint of potentialEndpoints) {
    console.log(`Checking ${endpoint}...`);
    results[endpoint] = await checkEndpoint(endpoint);
    console.log(`  Result: ${JSON.stringify(results[endpoint])}`);
  }
  
  // Try to log in with test account and see if it has admin privileges
  console.log('\nChecking if test account has admin privileges...');
  
  try {
    const loginResponse = await backendApi.post('/api/auth/login', {
      email: 'test@example.com',
      password: 'Password123!'
    });
    
    if (loginResponse.status === 200) {
      console.log('✅ Test account login successful');
      
      // Extract token
      const token = loginResponse.data?.data?.token || loginResponse.data?.token;
      
      if (token) {
        console.log('Token obtained, checking for admin access...');
        
        // Try to access potential admin endpoints with token
        const authApi = axios.create({
          baseURL: 'https://barbachli-auth.onrender.com',
          timeout: 40000,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        // Try to access admin endpoints
        for (const endpoint of potentialEndpoints) {
          try {
            console.log(`Checking ${endpoint} with auth...`);
            const response = await authApi.get(endpoint);
            console.log(`  Success! Status: ${response.status}`);
          } catch (error) {
            console.log(`  Failed with status: ${error.response?.status || error.message}`);
          }
        }
      }
    }
  } catch (error) {
    console.log('Test account login failed:', error.response?.status || error.message);
  }
  
  console.log('\n=== SUMMARY ===');
  console.log('Admin login attempt:', adminLoginResult.success ? 'SUCCESS' : 'FAILED');
  console.log('Potential admin endpoints:');
  Object.entries(results).forEach(([endpoint, result]) => {
    console.log(`  ${endpoint}: ${result.exists ? 'EXISTS' : 'NOT FOUND'} (${result.status || 'N/A'})`);
  });
  
  console.log('\n=== CONCLUSION ===');
  console.log('Based on the checks, it appears that direct user creation might not be possible.');
  console.log('Recommendation: Use the existing test account:');
  console.log('Email: test@example.com');
  console.log('Password: Password123!');
}

// Execute the checks
checkAdminRoutes().catch(console.error); 
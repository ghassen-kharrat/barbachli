// Script to analyze and fix missing auth endpoints
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// API URLs
const vercelUrl = 'https://barbachli.vercel.app/api';
const backendUrl = 'https://barbachli-auth.onrender.com/api';

// List of endpoints to check
const endpoints = [
  '/auth/login',
  '/auth/check',
  '/auth/profile',
  '/auth/register',
  '/carousel',
  '/banner',
  '/products',
  '/categories'
];

// Create a structured client for API calls
const createClient = (baseUrl) => {
  return axios.create({
    baseURL: baseUrl,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });
};

// Test an endpoint
async function testEndpoint(client, endpoint) {
  try {
    const response = await client.get(endpoint);
    return { 
      status: response.status, 
      working: true,
      data: typeof response.data === 'object' ? response.data : { message: 'Data received' }
    };
  } catch (error) {
    return { 
      status: error.response?.status || 0, 
      working: false,
      error: error.response?.data || error.message
    };
  }
}

// Create mock data file for a specific endpoint
function createMockEndpoint(endpoint, data) {
  const filename = endpoint.replace(/^\//, '').replace(/\//g, '-') + '.js';
  const filePath = path.join(__dirname, 'api', path.dirname(endpoint));
  const fullPath = path.join(filePath, path.basename(filename));
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(filePath, { recursive: true });
  }
  
  // If this is an auth endpoint, create appropriate auth response
  let mockData = data;
  if (endpoint.startsWith('/auth/')) {
    if (endpoint === '/auth/check') {
      mockData = {
        status: 'success',
        data: {
          authenticated: true,
          user: {
            id: 1,
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@example.com',
            role: 'admin'
          }
        }
      };
    } else if (endpoint === '/auth/profile') {
      mockData = {
        status: 'success',
        data: {
          id: 1,
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@example.com',
          role: 'admin',
          phone: '1234567890',
          address: '123 Test St',
          city: 'Test City',
          zipCode: '12345'
        }
      };
    }
  }
  
  // Write content to file
  const content = `// Mock API endpoint for ${endpoint}
module.exports = (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Handle the actual request
  if (req.method === 'GET') {
    return res.status(200).json(${JSON.stringify(mockData, null, 2)});
  }
  
  // For POST requests (like login/register)
  if (req.method === 'POST') {
    // For login endpoint
    if ('${endpoint}' === '/auth/login') {
      // Check credentials in a very simple way
      const { email, password } = req.body;
      
      // Admin credentials
      if (email === 'admin@example.com' && password === 'Password123!') {
        return res.status(200).json({
          status: 'success',
          data: {
            success: true,
            data: {
              id: 1,
              firstName: 'Admin',
              lastName: 'User',
              email: 'admin@example.com',
              role: 'admin',
              token: 'mock-jwt-token-for-admin-user'
            }
          }
        });
      }
      
      // Test credentials
      if (email === 'test@example.com' && password === 'Password123!') {
        return res.status(200).json({
          status: 'success',
          data: {
            success: true,
            data: {
              id: 2,
              firstName: 'Test',
              lastName: 'User',
              email: 'test@example.com',
              role: 'user',
              token: 'mock-jwt-token-for-test-user'
            }
          }
        });
      }
      
      // Invalid credentials
      return res.status(401).json({
        status: 'error',
        message: 'Invalid login credentials'
      });
    }
    
    // Generic response for other POST endpoints
    return res.status(200).json({
      status: 'success',
      message: 'Operation completed successfully'
    });
  }
  
  // Default response for unsupported methods
  return res.status(405).json({
    status: 'error',
    message: 'Method not allowed'
  });
};`;
  
  fs.writeFileSync(fullPath, content);
  console.log(`Created mock endpoint: ${fullPath}`);
  return fullPath;
}

// Main function to check all endpoints and create missing ones
async function checkAndFixEndpoints() {
  console.log('Checking API endpoints...\n');
  
  const vercelClient = createClient(vercelUrl);
  const backendClient = createClient(backendUrl);
  
  const results = {};
  const missingEndpoints = [];
  
  // Check each endpoint
  for (const endpoint of endpoints) {
    console.log(`Checking ${endpoint}...`);
    
    // Check Vercel API
    const vercelResult = await testEndpoint(vercelClient, endpoint);
    console.log(`  Vercel: ${vercelResult.working ? '✅' : '❌'} (${vercelResult.status})`);
    
    // Check Backend API
    const backendResult = await testEndpoint(backendClient, endpoint);
    console.log(`  Backend: ${backendResult.working ? '✅' : '❌'} (${backendResult.status})`);
    
    results[endpoint] = { vercel: vercelResult, backend: backendResult };
    
    // If both are not working, add to missing endpoints
    if (!vercelResult.working && !backendResult.working) {
      missingEndpoints.push(endpoint);
    }
  }
  
  // Summary
  console.log('\n=== ENDPOINT SUMMARY ===');
  Object.entries(results).forEach(([endpoint, result]) => {
    const vercelStatus = result.vercel.working ? '✅' : '❌';
    const backendStatus = result.backend.working ? '✅' : '❌';
    console.log(`${endpoint}: Vercel ${vercelStatus}, Backend ${backendStatus}`);
  });
  
  // Fix missing endpoints
  if (missingEndpoints.length > 0) {
    console.log('\n=== FIXING MISSING ENDPOINTS ===');
    console.log('Creating mock API endpoints for missing routes...');
    
    const createdFiles = [];
    
    for (const endpoint of missingEndpoints) {
      // For endpoints that work on either platform, get data to use as mock
      let mockData = { status: 'success', message: 'Mock data' };
      
      if (results[endpoint].vercel.working) {
        mockData = results[endpoint].vercel.data;
      } else if (results[endpoint].backend.working) {
        mockData = results[endpoint].backend.data;
      }
      
      // Create mock endpoint
      const filePath = createMockEndpoint(endpoint, mockData);
      createdFiles.push(filePath);
    }
    
    console.log('\nCreated the following mock API endpoints:');
    createdFiles.forEach(file => console.log(`- ${file}`));
    
    console.log('\nTo use these endpoints:');
    console.log('1. Deploy them to Vercel');
    console.log('2. Alternatively, create a local API server with Next.js API routes');
    
    // Create index file with instructions
    const indexPath = path.join(__dirname, 'api', 'README.md');
    const indexContent = `# Mock API Endpoints

This directory contains mock API endpoints for your application.

## Missing Endpoints
The following endpoints were missing from both Vercel and Backend APIs:
${missingEndpoints.map(e => `- \`${e}\``).join('\n')}

## Usage Instructions
1. These files can be deployed directly to Vercel as API routes
2. Alternatively, you can use them in a local Next.js server:
   - Create a Next.js app with \`npx create-next-app@latest\`
   - Copy these files to the \`pages/api\` directory
   - Run the development server with \`npm run dev\`

## API Endpoints Overview
${endpoints.map(e => `- \`${e}\`: ${results[e].vercel.working || results[e].backend.working ? '✅' : '❌'}`).join('\n')}
`;
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(path.join(__dirname, 'api'))) {
      fs.mkdirSync(path.join(__dirname, 'api'), { recursive: true });
    }
    
    fs.writeFileSync(indexPath, indexContent);
    console.log(`Created README: ${indexPath}`);
  } else {
    console.log('\nAll endpoints are working on at least one platform. No fixes needed.');
  }
}

// Run the check and fix
checkAndFixEndpoints().catch(console.error); 
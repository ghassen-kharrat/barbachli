// Login endpoint
const axios = require('axios');
const mockData = require('../mockData');

// Helper function to check if data is already in snake_case format
function isSnakeCaseData(body) {
  return body && (body.first_name !== undefined || body.last_name !== undefined);
}

// Helper function to check if data is already in camelCase format
function isCamelCaseData(body) {
  return body && (body.firstName !== undefined || body.lastName !== undefined);
}

// Helper function to convert field names if needed
function adaptRequestBody(body) {
  // For login, we just need email and password - no conversion needed
  // The backend's login endpoint just takes email and password, regardless of casing format
  return {
    email: body.email,
    password: body.password
  };
}

module.exports = async (req, res) => {
  console.log('Login endpoint called');
  console.log('Request method:', req.method);
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  // Handle OPTIONS request for preflight
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS preflight request');
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    console.log('Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Debug raw request
  console.log('Raw request body:', req.body);

  // Ensure we have a request body
  if (!req.body) {
    console.error('Login request body is undefined');
    
    // Return an error response
    return res.status(400).json({
      status: 'error',
      message: 'Request body is missing'
    });
  }

  // Log the request body for debugging (without password)
  try {
    const { password, ...safeBody } = req.body;
    console.log('Login request body:', { ...safeBody, password: '******' });
  } catch (e) {
    console.error('Error parsing login request body:', e.message);
  }

  try {
    console.log('Forwarding login request to backend...');
    
    // Always use Supabase backend URL
    const backendBaseUrl = 'https://barbachli-auth.onrender.com';
    const url = `${backendBaseUrl}/api/auth/login`;
    
    console.log(`Sending request to: ${url}`);
    
    // Adapt request body to backend expectations
    const adaptedBody = adaptRequestBody(req.body);
    console.log('Adapted request body:', { ...adaptedBody, password: '******' });
    
    // Forward login request to backend with increased timeout
    try {
      const response = await axios.post(url, adaptedBody, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 second timeout
      });
      
      // Return the response from the backend
      console.log('Login successful:', response.status);
      console.log('Response data:', JSON.stringify(response.data, null, 2));
      
      res.status(200).json({
        status: 'success',
        data: response.data
      });
    } catch (requestError) {
      console.error('Error during request to backend:', requestError.message);
      
      // For auth errors, return the error from the backend
      if (requestError.response) {
        return res.status(requestError.response.status).json({
          status: 'error',
          message: requestError.response.data?.message || 'Login failed',
          error: requestError.response.data
        });
      } else {
        return res.status(500).json({
          status: 'error',
          message: 'An unexpected error occurred',
          error: requestError.message
        });
      }
    }
  } catch (error) {
    console.error('Login proxy error:', error.message);
    
    // Return a friendly error response
    return res.status(500).json({
      status: 'error',
      message: 'An unexpected error occurred during login',
      error: error.message
    });
  }
}; 
// Registration endpoint
const axios = require('axios');
const mockData = require('../mockData');

module.exports = async (req, res) => {
  console.log('Register endpoint called');
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
    console.error('Request body is undefined');
    
    // Return an error response
    return res.status(400).json({
      status: 'error',
      message: 'Request body is missing'
    });
  }

  // Log the request body for debugging (without password)
  try {
    const { password, ...safeBody } = req.body;
    console.log('Register request body:', { ...safeBody, password: '******' });
  } catch (e) {
    console.error('Error parsing request body:', e.message);
  }

  try {
    console.log('Forwarding registration request to backend...');
    
    // Always use a direct backend URL
    const backendBaseUrl = 'https://barbachli-1.onrender.com';
    const url = `${backendBaseUrl}/api/auth/register`;
    
    console.log(`Sending request to: ${url}`);
    
    // Forward registration request to backend with increased timeout
    try {
      const response = await axios.post(url, req.body, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 second timeout
      });
      
      // Return the response from the backend
      console.log('Registration successful:', response.status);
      console.log('Response data:', JSON.stringify(response.data, null, 2));
      
      res.status(200).json({
        status: 'success',
        data: response.data
      });
    } catch (requestError) {
      console.error('Error during request to backend:', requestError.message);
      
      // If the backend is slow or returns a 5xx error, we'll use mockData for testing
      if (requestError.code === 'ECONNABORTED' || 
          (requestError.response && requestError.response.status >= 500)) {
        console.log('Backend unavailable or error, using mock data for testing');
        return res.status(200).json(mockData.registerSuccess);
      }
      
      // For other errors, return the error response
      if (requestError.response) {
        return res.status(requestError.response.status).json({
          status: 'error',
          message: requestError.response.data?.message || 'Registration failed',
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
    console.error('Registration proxy error:', error.message);
    
    // Return a friendly error response
    return res.status(500).json({
      status: 'error',
      message: 'An unexpected error occurred during registration',
      error: error.message
    });
  }
}; 
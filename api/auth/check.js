// Auth check endpoint
const axios = require('axios');
const mockData = require('../mockData');

module.exports = async (req, res) => {
  console.log('Auth check endpoint called');
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
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

  // If no authorization header is present, return 401
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    console.log('No authorization header provided');
    return res.status(401).json({
      status: 'error',
      message: 'No authorization token provided'
    });
  }

  try {
    console.log('Forwarding auth check request to backend...');
    
    // Always use Supabase backend URL
    const backendBaseUrl = 'https://barbachli-auth.onrender.com';
    const url = `${backendBaseUrl}/api/auth/check`;
    
    console.log(`Sending request to: ${url}`);
    
    // Forward auth check request to backend with increased timeout
    try {
      const response = await axios.get(url, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': authHeader
        },
        timeout: 30000 // 30 second timeout
      });
      
      // Return the response from the backend
      console.log('Auth check successful');
      res.status(200).json({
        status: 'success',
        data: response.data
      });
    } catch (requestError) {
      console.error('Error during request to backend:', requestError.message);
      
      // For auth errors, return 401
      if (requestError.response && requestError.response.status === 401) {
        return res.status(401).json({
          status: 'error',
          message: 'Authentication failed'
        });
      }
      
      // For other errors, return the error response
      if (requestError.response) {
        return res.status(requestError.response.status).json(requestError.response.data);
      } else {
        return res.status(500).json({
          status: 'error',
          message: 'An unexpected error occurred',
          error: requestError.message
        });
      }
    }
  } catch (error) {
    console.error('Auth check proxy error:', error.message);
    
    // Return a friendly error response
    return res.status(500).json({
      status: 'error',
      message: 'An unexpected error occurred during authentication check',
      error: error.message
    });
  }
}; 
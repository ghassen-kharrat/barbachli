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
    
    // Always use a direct backend URL that is confirmed working
    const backendBaseUrl = 'https://barbachli-1.onrender.com';
    const url = `${backendBaseUrl}/api/auth/check`;
    
    console.log(`Sending request to: ${url}`);
    
    // Forward auth check request to backend with timeout
    const response = await axios.get(url, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      timeout: 10000 // 10 second timeout
    });
    
    // Return the response from the backend
    console.log('Auth check successful');
    res.status(200).json({
      status: 'success',
      data: response.data
    });
  } catch (error) {
    console.error('Auth check proxy error:', error.message);
    
    if (error.response) {
      // The request was made and the server responded with a status code
      console.error('Backend returned error:', error.response.status);
      return res.status(error.response.status).json(error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received from backend');
      return res.status(503).json({
        status: 'error',
        message: 'The authentication service is currently unavailable.',
        error: 'SERVICE_UNAVAILABLE'
      });
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error during request setup:', error.message);
      return res.status(500).json({
        status: 'error',
        message: 'An unexpected error occurred',
        error: error.message
      });
    }
  }
}; 
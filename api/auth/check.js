// Auth check endpoint
const axios = require('axios');
const mockData = require('../mockData');

module.exports = async (req, res) => {
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
    res.status(200).end();
    return;
  }

  // If no authorization header is present, return 401
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({
      status: 'error',
      message: 'No authorization token provided'
    });
  }

  try {
    // Use environment variable for backend URL if available, otherwise use hardcoded URL
    const backendBaseUrl = process.env.BACKEND_URL || 'https://barbachli-1.onrender.com';
    
    // Forward auth check request to backend with timeout
    const response = await axios.get(`${backendBaseUrl}/api/auth/check`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      timeout: 5000 // 5 second timeout
    });
    
    // Return the response from the backend
    res.status(200).json({
      status: 'success',
      data: response.data
    });
  } catch (error) {
    console.error('Auth check proxy error:', error.message);
    
    // If it's a network error, return mock user data
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || error.message.includes('Network Error')) {
      console.log('Returning mock user data');
      return res.status(200).json(mockData.user);
    }
    
    // Forward the error from the backend
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(401).json({ 
        error: 'Authentication failed', 
        message: 'Could not verify authentication',
        details: error.message
      });
    }
  }
}; 
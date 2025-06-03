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
    // Extract token from authorization header
    const token = authHeader.replace('Bearer ', '');
    
    // For now, return a mock user based on the token
    // This is a temporary solution until the backend is fully functional
    const userData = {
      id: Math.floor(Math.random() * 10000),
      firstName: 'Authenticated',
      lastName: 'User',
      email: 'user@example.com',
      role: 'user',
      token: token
    };
    
    return res.status(200).json({
      status: 'success',
      message: 'Authentication successful',
      data: userData
    });
  } catch (error) {
    console.error('Auth check error:', error.message);
    
    return res.status(500).json({
      status: 'error',
      message: 'An error occurred during authentication check',
      error: error.message
    });
  }
}; 
// Login endpoint
const axios = require('axios');
const mockData = require('../mockData');

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
    // For now, use mock data to allow login to work
    // This is a temporary solution until the backend API is fully functional
    const userData = {
      id: Math.floor(Math.random() * 10000),
      firstName: 'Test',
      lastName: 'User',
      email: req.body.email || 'user@example.com',
      role: 'user',
      token: 'temp_token_' + Math.random().toString(36).substring(2, 15)
    };
    
    // Store the token in a cookie for authentication
    res.setHeader('Set-Cookie', `auth_token=${userData.token}; Path=/; HttpOnly; SameSite=Strict`);
    
    // Return success with user data
    return res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: userData
    });
  } catch (error) {
    console.error('Login error:', error.message);
    
    return res.status(500).json({
      status: 'error',
      message: 'An error occurred during login',
      error: error.message
    });
  }
}; 
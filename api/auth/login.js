// Login endpoint
const axios = require('axios');

module.exports = async (req, res) => {
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
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Log the request body for debugging (without password)
  const { password, ...safeBody } = req.body;
  console.log('Login request body:', { ...safeBody, password: '******' });

  try {
    // Forward login request to backend with timeout
    const response = await axios.post('https://barbachli-api.onrender.com/api/auth/login', req.body, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      timeout: 8000 // 8 second timeout
    });
    
    // Return the response from the backend
    res.status(200).json({
      status: 'success',
      data: response.data
    });
  } catch (error) {
    console.error('Login proxy error:', error.message);
    
    // If it's a network error, return a more user-friendly response
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || error.message.includes('Network Error')) {
      return res.status(503).json({
        status: 'error',
        message: 'Login service temporarily unavailable. Please try again later.',
        error: 'SERVICE_UNAVAILABLE'
      });
    }
    
    // Forward the error from the backend
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ 
        status: 'error',
        message: 'Login failed. Please try again later.',
        error: 'LOGIN_FAILED',
        details: error.message
      });
    }
  }
}; 
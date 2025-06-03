// Registration endpoint
const axios = require('axios');

module.exports = async (req, res) => {
  console.log('Register endpoint called');
  console.log('Request method:', req.method);
  console.log('Request headers:', JSON.stringify(req.headers, null, 2));
  
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
    return res.status(400).json({
      status: 'error',
      message: 'Missing request body',
      error: 'BAD_REQUEST'
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
    
    // Forward registration request to backend with timeout
    const response = await axios.post('https://barbachli-api.onrender.com/api/auth/register', req.body, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      timeout: 8000 // 8 second timeout
    });
    
    // Return the response from the backend
    console.log('Registration successful:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
    res.status(200).json({
      status: 'success',
      data: response.data
    });
  } catch (error) {
    console.error('Registration proxy error:', error.message);
    
    // If it's a network error, return a more user-friendly response
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || error.message.includes('Network Error')) {
      console.log('Network error detected, returning service unavailable');
      return res.status(503).json({
        status: 'error',
        message: 'Registration service temporarily unavailable. Please try again later.',
        error: 'SERVICE_UNAVAILABLE'
      });
    }
    
    // Forward the error from the backend with detailed logging
    if (error.response) {
      console.error('Backend returned error:', error.response.status);
      console.error('Error data:', JSON.stringify(error.response.data, null, 2));
      res.status(error.response.status).json(error.response.data);
    } else {
      console.error('Unknown error during registration:', error);
      res.status(500).json({ 
        status: 'error',
        message: 'Registration failed. Please try again later.',
        error: 'REGISTRATION_FAILED',
        details: error.message
      });
    }
  }
}; 
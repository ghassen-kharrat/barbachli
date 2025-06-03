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
    
    // Use the direct backend URL
    const backendUrl = 'https://barbachli-1.onrender.com/api/auth/register';
    console.log(`Sending request to: ${backendUrl}`);
    
    // Forward registration request to backend with timeout
    const response = await axios({
      method: 'post',
      url: backendUrl,
      data: req.body,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 second timeout
    });
    
    // Return the response from the backend
    console.log('Registration successful:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
    return res.status(200).json({
      status: 'success',
      data: response.data
    });
  } catch (error) {
    console.error('Registration proxy error:', error.message);
    
    // If we can't reach the backend, try a direct Supabase registration
    // This is a temporary solution until the backend is fixed
    console.log('Backend registration failed, returning error response');
    
    if (error.response) {
      // The request was made and the server responded with a status code
      console.error('Backend returned error:', error.response.status);
      console.error('Error data:', JSON.stringify(error.response.data, null, 2));
      
      return res.status(error.response.status).json({
        status: 'error',
        message: error.response.data?.message || 'Registration failed',
        error: error.response.data
      });
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received from backend');
      
      return res.status(503).json({
        status: 'error',
        message: 'The authentication service is currently unavailable. Please try again later.',
        error: 'SERVICE_UNAVAILABLE'
      });
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error during request setup:', error.message);
      
      return res.status(500).json({
        status: 'error',
        message: 'An unexpected error occurred during registration',
        error: error.message
      });
    }
  }
}; 
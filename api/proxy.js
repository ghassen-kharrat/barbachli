// General API proxy
const axios = require('axios');

module.exports = async (req, res) => {
  console.log('API proxy called');
  console.log('Request method:', req.method);
  console.log('Request URL:', req.url);
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
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

  // Get the path from the request
  const path = req.url.replace(/^\/api/, '');
  
  // Use environment variable for backend URL if available, otherwise use hardcoded URL
  const backendBaseUrl = process.env.BACKEND_URL || 'https://barbachli-1.onrender.com';
  const backendUrl = `${backendBaseUrl}/api${path}`;
  
  console.log(`Proxying request to: ${backendUrl}`);
  console.log(`Method: ${req.method}`);
  
  // Debug request body
  if (req.body) {
    try {
      // If it's a login or register request, hide the password
      if (path.includes('/auth/login') || path.includes('/auth/register')) {
        const { password, ...safeBody } = req.body;
        console.log('Request body:', { ...safeBody, password: '******' });
      } else {
        console.log('Request body:', req.body);
      }
    } catch (e) {
      console.error('Error parsing request body:', e.message);
    }
  } else {
    console.log('No request body or body is empty');
  }

  try {
    // Forward the request to the backend with increased timeout
    const response = await axios({
      method: req.method,
      url: backendUrl,
      headers: {
        ...req.headers,
        host: new URL(backendBaseUrl).host,
        origin: backendBaseUrl,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(req.headers.authorization && { 'Authorization': req.headers.authorization })
      },
      data: req.body,
      timeout: 15000, // 15 second timeout
      validateStatus: () => true // Don't throw on any status code
    });
    
    // Log the response status
    console.log(`Backend response status: ${response.status}`);
    
    // Forward the response back to the client
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('API proxy error:', error.message);
    
    // If it's a network error, return a more user-friendly response
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || error.message.includes('Network Error')) {
      console.log('Network error detected, returning service unavailable');
      return res.status(503).json({
        status: 'error',
        message: 'API service temporarily unavailable. Please try again later.',
        error: 'SERVICE_UNAVAILABLE'
      });
    }
    
    // Forward any other error
    if (error.response) {
      console.error('Backend returned error:', error.response.status);
      console.error('Error data:', JSON.stringify(error.response.data, null, 2));
      res.status(error.response.status).json(error.response.data);
    } else {
      console.error('Unknown error during API request:', error);
      res.status(500).json({ 
        status: 'error',
        message: 'API request failed. Please try again later.',
        error: 'API_REQUEST_FAILED',
        details: error.message
      });
    }
  }
}; 
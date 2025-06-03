// General API proxy
const axios = require('axios');

module.exports = async (req, res) => {
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
    res.status(200).end();
    return;
  }

  // Get the path from the request
  const path = req.url.replace(/^\/api/, '');
  const backendUrl = `https://barbachli-api.onrender.com/api${path}`;
  
  console.log(`Proxying request to: ${backendUrl}`);
  console.log(`Method: ${req.method}`);

  try {
    // Forward the request to the backend
    const response = await axios({
      method: req.method,
      url: backendUrl,
      headers: {
        ...req.headers,
        host: 'barbachli-api.onrender.com',
        origin: 'https://barbachli-api.onrender.com',
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(req.headers.authorization && { 'Authorization': req.headers.authorization })
      },
      data: req.body,
      timeout: 8000, // 8 second timeout
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
      return res.status(503).json({
        status: 'error',
        message: 'API service temporarily unavailable. Please try again later.',
        error: 'SERVICE_UNAVAILABLE'
      });
    }
    
    // Forward any other error
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ 
        status: 'error',
        message: 'API request failed. Please try again later.',
        error: 'API_REQUEST_FAILED',
        details: error.message
      });
    }
  }
}; 
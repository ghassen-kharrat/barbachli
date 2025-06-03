// Auth check endpoint
const axios = require('axios');

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

  // Extract authorization header
  const authHeader = req.headers.authorization;

  try {
    // Forward auth check request to backend
    const response = await axios.get('https://barbachli-api.onrender.com/api/auth/check', {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': authHeader
      }
    });
    
    // Return the response from the backend
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Auth check proxy error:', error.response?.data || error.message);
    
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
// Health check endpoint
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

  try {
    // Check backend API health with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    const response = await axios.get('https://barbachli-api.onrender.com/api/health', {
      signal: controller.signal,
      timeout: 3000
    });
    
    clearTimeout(timeoutId);
    
    const backendStatus = response.status === 200 ? 'online' : 'offline';
    
    res.status(200).json({
      status: 'ok',
      message: 'API proxy is healthy',
      timestamp: new Date().toISOString(),
      backend: {
        status: backendStatus,
        url: 'https://barbachli-api.onrender.com/api'
      }
    });
  } catch (error) {
    console.error('Health check error:', error.message);
    res.status(200).json({
      status: 'ok',
      message: 'API proxy is healthy, but backend is unreachable',
      timestamp: new Date().toISOString(),
      backend: {
        status: 'offline',
        url: 'https://barbachli-api.onrender.com/api',
        error: error.message
      }
    });
  }
}; 
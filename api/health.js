// Health check endpoint to diagnose API connectivity
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

  // Test connectivity to backend
  const backendBaseUrl = 'https://barbachli-1.onrender.com';
  const status = {
    success: true,
    timestamp: new Date().toISOString(),
    backend: {
      url: backendBaseUrl,
      status: 'unknown',
      response: null,
      error: null
    }
  };

  try {
    // Test connection to backend
    console.log(`Testing connection to backend: ${backendBaseUrl}/api`);
    const backendResponse = await axios.get(`${backendBaseUrl}/api`, {
      timeout: 5000
    });
    
    status.backend.status = 'ok';
    status.backend.response = backendResponse.data;
  } catch (error) {
    status.success = false;
    status.backend.status = 'error';
    status.backend.error = {
      message: error.message,
      code: error.code,
      response: error.response ? {
        status: error.response.status,
        data: error.response.data
      } : null
    };
  }

  // Return health check status
  res.status(200).json(status);
}; 
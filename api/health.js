// Health check endpoint
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
    // Check backend API health
    const response = await fetch('https://barbachli-api.onrender.com/api/health');
    const backendStatus = response.ok ? 'online' : 'offline';
    
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
    console.error('Health check error:', error);
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
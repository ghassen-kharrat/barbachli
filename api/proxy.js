// Serverless function to proxy API requests to the backend
const axios = require('axios');

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
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
    // Get the target path from the request
    const targetPath = req.url.replace(/^\/api/, '');
    const targetUrl = `https://barbachli-api.onrender.com/api${targetPath}`;

    console.log(`Proxying request to: ${targetUrl}`);

    // Forward the request to the backend API
    const response = await axios({
      method: req.method,
      url: targetUrl,
      headers: {
        ...req.headers,
        host: 'barbachli-api.onrender.com',
      },
      data: req.body,
      validateStatus: () => true, // Don't throw on any status code
    });

    // Forward the response back to the client
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Proxy server error', details: error.message });
  }
}; 
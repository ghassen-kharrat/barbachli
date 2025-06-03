// Carousel endpoint
const axios = require('axios');
const mockData = require('./mockData');

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
    // Use environment variable for backend URL if available, otherwise use hardcoded URL
    const backendBaseUrl = process.env.BACKEND_URL || 'https://barbachli-1.onrender.com';
    
    // Get carousel data from backend with timeout
    const response = await axios.get(`${backendBaseUrl}/api/carousel`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      timeout: 5000 // 5 second timeout
    });
    
    // Return the carousel data
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Carousel proxy error:', error.message);
    
    // If the backend is down, return mock data
    console.log('Returning mock carousel data');
    res.status(200).json(mockData.carousel);
  }
}; 
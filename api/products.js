// Products endpoint
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
    // Get query parameters
    const { limit, sortBy, sortDirection, hasDiscount, category } = req.query;
    
    // Build the query string
    let queryString = '';
    if (limit) queryString += `limit=${limit}&`;
    if (sortBy) queryString += `sortBy=${sortBy}&`;
    if (sortDirection) queryString += `sortDirection=${sortDirection}&`;
    if (hasDiscount) queryString += `hasDiscount=${hasDiscount}&`;
    if (category) queryString += `category=${category}&`;
    
    // Remove trailing & if exists
    if (queryString.endsWith('&')) {
      queryString = queryString.slice(0, -1);
    }
    
    // Add ? if query string is not empty
    if (queryString) {
      queryString = `?${queryString}`;
    }
    
    console.log(`Fetching products with query: ${queryString}`);
    
    // Use environment variable for backend URL if available, otherwise use hardcoded URL
    const backendBaseUrl = process.env.BACKEND_URL || 'https://barbachli-1.onrender.com';
    
    // Get products from backend with timeout
    const response = await axios.get(`${backendBaseUrl}/api/products${queryString}`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      timeout: 5000 // 5 second timeout
    });
    
    // Return the products
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Products proxy error:', error.message);
    
    // If the backend is down, return mock data
    console.log('Returning mock products data');
    res.status(200).json(mockData.products);
  }
}; 
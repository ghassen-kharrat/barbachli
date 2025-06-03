// Categories endpoint
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
    // Get categories from backend
    const response = await axios.get('https://barbachli-api.onrender.com/api/categories', {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    // Return the categories
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Categories proxy error:', error);
    
    // If the backend is down, return mock data
    res.status(200).json({
      status: 'success',
      data: [
        { id: 1, name: 'Électronique', parentId: null },
        { id: 2, name: 'Vêtements', parentId: null },
        { id: 3, name: 'Maison', parentId: null },
        { id: 4, name: 'Smartphones', parentId: 1 },
        { id: 5, name: 'Ordinateurs', parentId: 1 },
        { id: 6, name: 'Hommes', parentId: 2 },
        { id: 7, name: 'Femmes', parentId: 2 },
        { id: 8, name: 'Décoration', parentId: 3 }
      ]
    });
  }
}; 
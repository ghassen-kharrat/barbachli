// Products endpoint
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
    
    // Get products from backend
    const response = await axios.get(`https://barbachli-api.onrender.com/api/products${queryString}`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    // Return the products
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Products proxy error:', error);
    
    // If the backend is down, return mock data
    res.status(200).json({
      status: 'success',
      data: [
        {
          id: 1,
          name: 'Smartphone XYZ',
          description: 'Un smartphone de dernière génération',
          price: 999.99,
          discountPrice: 899.99,
          category: 'Smartphones',
          stock: 10,
          images: [
            'https://via.placeholder.com/300x300?text=Smartphone+XYZ'
          ],
          rating: 4.5
        },
        {
          id: 2,
          name: 'Laptop ABC',
          description: 'Un ordinateur portable puissant',
          price: 1299.99,
          discountPrice: null,
          category: 'Ordinateurs',
          stock: 5,
          images: [
            'https://via.placeholder.com/300x300?text=Laptop+ABC'
          ],
          rating: 4.2
        }
      ],
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: 2
      }
    });
  }
}; 
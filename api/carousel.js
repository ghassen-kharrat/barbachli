// Carousel endpoint
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
    // Get carousel data from backend
    const response = await axios.get('https://barbachli-api.onrender.com/api/carousel', {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    // Return the carousel data
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Carousel proxy error:', error);
    
    // If the backend is down, return mock data
    res.status(200).json({
      status: 'success',
      data: [
        {
          id: 1,
          title: 'Nouveaux produits',
          subtitle: 'Découvrez notre nouvelle collection',
          buttonText: 'Acheter maintenant',
          buttonLink: '/products',
          imageUrl: 'https://via.placeholder.com/1200x400?text=Nouveaux+produits'
        },
        {
          id: 2,
          title: 'Offres spéciales',
          subtitle: 'Jusqu\'à 50% de réduction',
          buttonText: 'Voir les offres',
          buttonLink: '/products?hasDiscount=true',
          imageUrl: 'https://via.placeholder.com/1200x400?text=Offres+speciales'
        }
      ]
    });
  }
}; 
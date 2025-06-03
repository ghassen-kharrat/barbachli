// Mock data for when the backend is unavailable
const mockData = {
  // Categories mock data
  categories: {
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
  },
  
  // Products mock data
  products: {
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
  },
  
  // Carousel mock data
  carousel: {
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
  },
  
  // User mock data
  user: {
    status: 'success',
    data: {
      user: {
        id: 1,
        firstName: 'Guest',
        lastName: 'User',
        email: 'guest@example.com',
        role: 'user'
      }
    }
  },
  
  // Mock registration success response
  registerSuccess: {
    status: 'success',
    message: 'Registration successful',
    data: {
      user: {
        id: 999,
        firstName: 'New',
        lastName: 'User',
        email: 'new.user@example.com',
        role: 'user'
      }
    }
  },
  
  // Mock login success response
  loginSuccess: {
    status: 'success',
    message: 'Login successful',
    data: {
      token: 'mock-jwt-token-for-testing-purposes-only',
      user: {
        id: 1,
        firstName: 'Guest',
        lastName: 'User',
        email: 'guest@example.com',
        role: 'user'
      }
    }
  },
  
  // Test account login success response (for test script)
  testLoginSuccess: {
    status: 'success',
    message: 'Login successful',
    data: {
      token: 'mock-test-jwt-token-for-testing-purposes-only',
      user: {
        id: 2,
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        role: 'user'
      }
    }
  }
};

module.exports = mockData; 
const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:5000/api';

// Test functions
const testAPI = async () => {
  try {
    console.log('Testing API Status...');
    const { data: status } = await axios.get(`${API_URL}`);
    console.log('✅ API Status:', status);

    console.log('\nFetching products...');
    const { data: products } = await axios.get(`${API_URL}/products`);
    console.log(`✅ Got ${products.items.length} products (${products.total} total)`);
    console.log('First product:', products.items[0].name);

    console.log('\nTesting login with admin credentials...');
    const { data: loginResult } = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@example.com',
      password: 'admin123'
    });
    
    console.log('✅ Login successful!');
    console.log('Token:', loginResult.data.token.substring(0, 20) + '...');
    console.log('User:', `${loginResult.data.firstName} ${loginResult.data.lastName} (${loginResult.data.role})`);

    console.log('\nAPI tests passed successfully!');
    
  } catch (error) {
    console.error('❌ Error testing API:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
};

// Run the tests
testAPI(); 
const axios = require('axios');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// API base URL
const API_BASE_URL = process.env.API_URL || 'http://localhost:5001/api';

// Test function
async function testOrderFunctionality() {
  try {
    console.log('🧪 Testing Order Functionality');
    console.log('===========================');
    
    // 1. Login to get a token
    console.log('1️⃣ Logging in...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'jean@example.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.data.token;
    console.log('✅ Login successful, received token');
    
    // Configure axios with authorization header
    const authAxios = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    // 2. Check current cart
    console.log('\n2️⃣ Checking cart...');
    const cartResponse = await authAxios.get('/cart');
    console.log(`📦 Cart has ${cartResponse.data.data.items.length} items`);
    
    // If cart is empty, add a product
    if (cartResponse.data.data.items.length === 0) {
      console.log('📦 Cart is empty, adding a product...');
      await authAxios.post('/cart/items', {
        productId: 2, // Laptop UltraBook
        quantity: 1
      });
      const updatedCartResponse = await authAxios.get('/cart');
      console.log(`✅ Product added to cart. Cart now has ${updatedCartResponse.data.data.items.length} items`);
    }
    
    // 3. Create an order
    console.log('\n3️⃣ Creating an order...');
    const orderData = {
      shippingAddress: '456 Avenue Secondaire',
      shippingCity: 'Lyon',
      shippingZipCode: '69001',
      phoneNumber: '0123456788',
      notes: 'Test order from API script'
    };
    
    const orderResponse = await authAxios.post('/orders', orderData);
    const orderId = orderResponse.data.data.id;
    console.log(`✅ Order created with ID: ${orderId}`);
    
    // 4. Get order details
    console.log('\n4️⃣ Getting order details...');
    const orderDetailsResponse = await authAxios.get(`/orders/${orderId}`);
    console.log(`📋 Order ${orderDetailsResponse.data.data.reference} - Status: ${orderDetailsResponse.data.data.status}`);
    console.log(`📦 Items: ${orderDetailsResponse.data.data.items.length}`);
    console.log(`💰 Total: ${orderDetailsResponse.data.data.totalPrice} DT`);
    
    // 5. List all orders
    console.log('\n5️⃣ Listing all orders...');
    const ordersResponse = await authAxios.get('/orders');
    console.log(`🧾 Found ${ordersResponse.data.total} orders in total`);
    
    // 6. Cancel the order we just created
    console.log('\n6️⃣ Cancelling the order...');
    const cancelResponse = await authAxios.put(`/orders/${orderId}/cancel`);
    const updatedOrderResponse = await authAxios.get(`/orders/${orderId}`);
    console.log(`📋 Order status now: ${updatedOrderResponse.data.data.status}`);
    
    console.log('\n✅ Test completed successfully!');
    return true;
  } catch (error) {
    console.error('❌ Test failed:');
    if (error.response) {
      console.error(`Error ${error.response.status}: ${error.response.data.message || JSON.stringify(error.response.data)}`);
    } else {
      console.error(error.message);
    }
    return false;
  }
}

// Run the test
testOrderFunctionality()
  .then(success => {
    if (success) {
      console.log('\n🎉 All tests passed! The order system is working correctly.');
    } else {
      console.log('\n⚠️ Tests failed. Please check the error messages above.');
    }
  })
  .catch(error => {
    console.error('❌ Unexpected error:', error);
  }); 
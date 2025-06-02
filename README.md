# eCommerce Site

A full-featured eCommerce application built with React, Node.js, Express, and PostgreSQL.

## Features

- 📱 Responsive design for all devices
- 🛍️ Product browsing with filtering and sorting
- 🔍 Advanced search functionality
- 🛒 Shopping cart with persistent storage
- 💳 Checkout process with order confirmation
- 👤 User authentication and profile management
- 📦 Order history and tracking
- 👑 Admin dashboard for product, order, and user management

## Quick Start

### Prerequisites

- Node.js (v14+)
- PostgreSQL (v13+)
- PowerShell (for Windows users)

### Installation

1. Clone the repository:

```
git clone https://github.com/yourusername/ecommerce-site.git
cd ecommerce-site
```

2. Install dependencies:

```
npm install
```

3. Run the application:

For Windows users:
```
powershell -ExecutionPolicy Bypass -File start.ps1
```

Or alternatively:
```
start.bat
```

For others:
```
npm run dev
```

The script will:
- Create a `.env` file if it doesn't exist
- Set up the PostgreSQL database if necessary
- Start both the frontend and backend servers

## Test Order Functionality

To verify that the order system is working correctly:

1. Make sure the application is running
2. Run the order test script:

```
node test-orders.js
```

This will:
- Login as a test user
- Check the cart and add an item if needed
- Create a test order
- Fetch order details
- List all orders
- Cancel the test order
- Verify everything worked correctly

## Manual Setup

If you prefer to set up everything manually:

1. Create a `.env` file in the project root with:

```
PORT=5001
JWT_SECRET=your-super-secret-key-for-jwt-tokens
DATABASE_URL=postgresql://postgres:root@localhost:5432/ecommerce
NODE_ENV=development
REACT_APP_API_URL=http://localhost:5001/api
```

2. Set up the PostgreSQL database:

```
powershell -ExecutionPolicy Bypass -File setup-db.ps1
```

3. Start the development server:

```
npm run dev
```

## Login Credentials

The application comes with two pre-configured users:

1. **Admin User**
   - Email: admin@example.com
   - Password: admin123

2. **Regular User**
   - Email: jean@example.com
   - Password: password123

## Recent Fixes

This version includes several important fixes to make the application fully functional:

1. **TypeScript Errors**: 
   - Fixed AdminRoute and PrivateRoute components to handle the auth data structure correctly
   - Added proper typing for protected routes

2. **API Integration**:
   - Integrated real API calls instead of mock data for cart functionality
   - Implemented complete checkout process with order confirmation
   - Added API endpoints for cart management (add, update, remove items)
   - Added comprehensive order management endpoints (create, list, cancel, update status)

3. **Order Management System**:
   - Replaced mock data with real API calls in order hooks
   - Added order cancellation functionality
   - Implemented administrative order status updates
   - Created test script to verify order functionality

4. **Environment Configuration**:
   - Added automatic creation of `.env` file with essential configuration
   - Updated API base URL to use port 5001 to prevent conflicts

5. **Database**:
   - Added complete PostgreSQL integration with fallback to in-memory storage
   - Implemented proper transaction handling for orders and cart operations

## Troubleshooting

### Common Issues

1. **PostgreSQL Connection**:
   - Ensure PostgreSQL is running on your system
   - Check that the PostgreSQL user (default: postgres) and password (default: root) are correct in your .env file
   - Make sure PostgreSQL is running on port 5432

2. **Port Conflicts**:
   - The app uses port 5001 for the server and 3000 for React
   - If either port is in use, modify the PORT variable in .env and/or package.json

3. **Authentication Issues**:
   - If login doesn't work, try clearing localStorage in your browser
   - Ensure the JWT_SECRET in .env is set correctly

4. **Database Schema**:
   - If you encounter database issues, you can reset the schema with:
     ```
     powershell -ExecutionPolicy Bypass -File setup-db.ps1
     ```

5. **Order Processing Issues**:
   - If orders aren't being created, check the browser console for errors
   - Make sure your cart has items before trying to checkout
   - Run the test-orders.js script to diagnose specific issues

## Development

- Frontend: React with TypeScript, React Router, React Query, and Styled Components
- Backend: Express.js RESTful API
- Database: PostgreSQL with a fallback to in-memory storage for development

## Project Structure

- `/src` - Frontend React application
  - `/apis` - API client configuration
  - `/features` - Feature modules (auth, products, cart, orders)
  - `/layouts` - Page layouts
  - `/pages` - Page components
- `/database` - Database schema and seed data
- `/server.js` - Express.js backend server

## Scripts

- `npm start` - Run the frontend React application
- `npm run server` - Run the backend server with nodemon
- `npm run dev` - Run both frontend and backend concurrently
- `npm run build` - Build the frontend for production
- `node test-orders.js` - Test order functionality

## License

This project is licensed under the MIT License.

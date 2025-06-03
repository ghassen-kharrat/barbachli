# Barbachli E-Commerce Site

This is an e-commerce platform built with React, Next.js, Node.js, and Supabase.

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

Several critical fixes have been implemented to address API connection issues:

1. **Field Format Consistency**
   - Fixed field name format mismatches (camelCase vs snake_case)
   - Updated API clients to send data in the format expected by the backend
   - Added special handling for password fields to ensure validation passes

2. **API Connection Stability**
   - Added fallback mechanisms for unreliable endpoints
   - Implemented mock data for unavailable services
   - Extended timeouts for critical operations

3. **Data Validation**
   - Enhanced client-side validation
   - Improved error handling and error messages
   - Fixed password validation to ensure passwords match

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

## API Integration

The application uses multiple API endpoints:

- **Frontend**: Deployed on Vercel
- **Backend**: Running on Render
- **Database**: Supabase

API requests flow through Vercel API routes (/api/*) which proxy requests to the backend server.

## Testing

To run the API tests:

```
node test-registration.js
```

This will verify the registration functionality is working correctly.

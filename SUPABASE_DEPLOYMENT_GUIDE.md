# Supabase Deployment Guide

This guide explains how to deploy the Barbachli E-commerce application with Supabase as the database.

## 1. Render Backend Deployment

1. Go to your Render dashboard: https://dashboard.render.com/
2. Select your `barbachli-auth` service
3. Go to the **Settings** tab
4. Under **Environment**, add the following environment variables:
   - `SUPABASE_URL`: `https://iptgkvofawoqvykmkcrk.supabase.co`
   - `SUPABASE_KEY`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlwdGdrdm9mYXdvcXZ5a21rY3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4NjkxMTMsImV4cCI6MjA2NDQ0NTExM30.oUsFpKGgeddXRU5lbaeaufBZ2wV7rnl1a0h2YEfC9b8`
   - `PORT`: `8080`
   - `NODE_ENV`: `production`
5. Update the **Build Command** to: `npm install`
6. Update the **Start Command** to: `npm start` (this will use server-supabase.js since we updated package.json)
7. Click "Save Changes" and deploy

## 2. Supabase Database Schema

Before the application will work correctly, ensure the following tables exist in your Supabase database:

### Users Table
```sql
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR NOT NULL UNIQUE,
  first_name VARCHAR NOT NULL,
  last_name VARCHAR NOT NULL,
  password VARCHAR NOT NULL,
  role VARCHAR NOT NULL DEFAULT 'user',
  is_active BOOLEAN DEFAULT true,
  phone VARCHAR,
  address VARCHAR,
  city VARCHAR,
  zip_code VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Categories Table
```sql
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR NOT NULL,
  slug VARCHAR NOT NULL UNIQUE,
  description TEXT,
  parent_id UUID REFERENCES categories(id),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Products Table
```sql
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  discount_price DECIMAL(10, 2),
  stock INTEGER NOT NULL DEFAULT 0,
  category_id UUID REFERENCES categories(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Product Images Table
```sql
CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id),
  image_url VARCHAR NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Cart Items Table
```sql
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);
```

## 3. Initialize the Database

Run the database setup script to create initial data:

```bash
npm run setup-supabase-db
```

This will create:
- An admin user
- Sample categories
- Sample products
- Product images
- Test user

## 4. Test Credentials

The application comes with these test credentials:

- **Admin User**:
  - Email: admin@example.com
  - Password: admin123

- **Regular User**:
  - Email: test@example.com
  - Password: Password123!

## 5. Troubleshooting

### Authentication Issues

If users can register but their data isn't being saved:

1. Check that the Supabase credentials are correctly set in Render environment variables
2. Verify that the server is using `server-supabase.js` (check logs for "Supabase client initialized")
3. Inspect error logs in Render for specific errors

### Database Connection Issues

If you see 500 errors or database connection failures:

1. Check if tables exist in Supabase using the SQL Editor
2. Verify RLS (Row Level Security) policies aren't blocking access
3. Try running the setup script with `npm run setup-supabase-db`

### Table Schema Issues

If you're getting database errors:

1. Check that all required fields are included in your tables
2. Make sure to create tables in the right order (categories before products)
3. Use the SQL definitions provided above to recreate tables if needed

### Product-Related Errors

If products aren't displaying or you're getting 404 errors on product endpoints:

1. Check that the products table has data
2. Verify product images are properly linked in the database
3. Check product categories for proper relationships

## 6. Updating Frontend Configuration

Make sure your frontend is pointing to the correct API URL:

1. In your frontend config (`config.js` or similar), verify the API URL:
   ```javascript
   const API_URL = 'https://barbachli-auth.onrender.com/api';
   ```

2. If you're using environment variables on Vercel, add:
   - `NEXT_PUBLIC_API_URL`: `https://barbachli-auth.onrender.com/api` 
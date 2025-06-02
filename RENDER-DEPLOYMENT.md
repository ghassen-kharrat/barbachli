# Deploying to Render

This guide will help you deploy your e-commerce application to Render.

## Prerequisites

1. A Render account (https://render.com)
2. A Supabase PostgreSQL database (https://supabase.com)
3. Your code pushed to a Git repository (GitHub, GitLab, etc.)

## Database Setup

1. Make sure your Supabase database is set up and accessible
2. Note your database connection string: `postgres://postgres:PASSWORD@db.iptgkvofawoqvykmkcrk.supabase.co:5432/postgres`

## Deployment Steps

### 1. Test Your Database Connection Locally

Before deploying, test your database connection:

```bash
# Set your environment variables
export DATABASE_URL=postgres://postgres:PASSWORD@db.iptgkvofawoqvykmkcrk.supabase.co:5432/postgres
export JWT_SECRET=your_secret_key
export PORT=5001

# Run the test script
npm run test-db
```

If successful, you'll see: "✅ Successfully connected to the database!"

### 2. Deploy to Render

#### Option 1: Using the Render Dashboard

1. Log in to your Render account
2. Click "New" and select "Web Service"
3. Connect your Git repository
4. Configure your service:
   - **Name**: `barbachli-api` (or your preferred name)
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run test-db`
   - **Start Command**: `node server.js`
   - **Health Check Path**: `/api`
5. Add environment variables:
   - `NODE_ENV`: `production`
   - `PORT`: `5001`
   - `JWT_SECRET`: `your_secret_key` (use a secure value)
   - `DATABASE_URL`: `postgres://postgres:PASSWORD@db.iptgkvofawoqvykmkcrk.supabase.co:5432/postgres`
   - `REACT_APP_API_URL`: `https://your-app-name.onrender.com/api`
6. Click "Create Web Service"

#### Option 2: Using the render.yaml File

1. Make sure your `render.yaml` file is properly configured
2. Log in to your Render account
3. Go to "Blueprints" in the dashboard
4. Click "New Blueprint Instance"
5. Connect your Git repository
6. Render will automatically deploy your services as defined in the `render.yaml` file

## Troubleshooting

### Database Connection Issues

If you see the error: "❌ Database connection error: connect ENETUNREACH", try the following:

1. Verify your database connection string format:
   - Use `postgres://` instead of `postgresql://`
   - Make sure the username and password are correct
   - Check that the database host is accessible from Render

2. Test the connection using the `test-db` script:
   ```bash
   npm run test-db
   ```

3. Check if your Supabase database allows connections from external services:
   - Go to your Supabase dashboard
   - Navigate to Database > Settings
   - Ensure that "Allow connections from all IP addresses" is enabled or add Render's IP ranges

### Other Common Issues

1. **Port conflicts**: Make sure the PORT environment variable matches what's defined in your code
2. **Missing environment variables**: Verify all required environment variables are set
3. **SSL issues**: Make sure SSL is properly configured for database connections

## Monitoring

Once deployed, you can monitor your application:

1. Go to your Render dashboard
2. Click on your service name
3. View logs, metrics, and status information

## Support

If you continue to experience issues, contact Render support or check their documentation:
https://render.com/docs 
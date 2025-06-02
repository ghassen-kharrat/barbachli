# Fixing Render Deployment Issues

This guide will help you fix the deployment issues with your e-commerce application on Render.

## The Problem

The error you're encountering:
```
==> Running 'node server.js'
🔄 Initializing database...
❌ Database connection error: connect ENETUNREACH 2a05:d012:42e:570d:fbf5:eb68:acac:223e:5432 - Local (:::0)
The application requires a PostgreSQL database connection to function.
```

This error occurs because:
1. Render is trying to connect to your Supabase database using IPv6
2. There might be an issue with your database connection string format

## Solution Steps

### 1. Update your Database Connection String

Make sure your database connection string in `render.yaml` uses the correct format:

```yaml
services:
  - type: web
    name: barbachli-api
    env: node
    buildCommand: npm install && npm run test-db
    startCommand: node server.js
    healthCheckPath: /api
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 5001
      - key: JWT_SECRET
        value: 12345
      - key: DATABASE_URL
        value: postgres://postgres:Gaston.07730218@db.iptgkvofawoqvykmkcrk.supabase.co:5432/postgres
      - key: REACT_APP_API_URL
        value: https://barbachli-api.onrender.com/api
```

Key changes:
- Use `postgres://` instead of `postgresql://` in your connection string
- Make sure the hostname is correct: `db.iptgkvofawoqvykmkcrk.supabase.co`

### 2. Use the Supabase Connection Pooler

If you continue to have IPv6 connectivity issues, use Supabase's connection pooler instead of direct connection:

1. Go to your Supabase dashboard
2. Click on "Project Settings" > "Database"
3. Click on "Connection Pooling"
4. Copy the connection string for "Transaction Pooling" (it should look like `postgres://postgres.iptgkvofawoqvykmkcrk:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres`)
5. Update your `render.yaml` file with this connection string

### 3. Update Server.js Database Connection Code

Make sure your `server.js` file properly handles SSL connections:

```javascript
// PostgreSQL Connection
const pool = new Pool(
  process.env.DATABASE_URL 
    ? { 
        connectionString: process.env.DATABASE_URL, 
        ssl: { 
          rejectUnauthorized: false 
        }
      }
    : {
        user: 'postgres',
        password: 'root',
        host: 'localhost',
        port: 5432,
        database: 'ecommerce'
      }
);
```

### 4. Test the Connection Locally

Before deploying, test your database connection locally:

```bash
# Set the environment variable with your connection string
$env:DATABASE_URL="postgres://postgres:Gaston.07730218@db.iptgkvofawoqvykmkcrk.supabase.co:5432/postgres"

# Run the test script
npm run test-db
```

### 5. Verify Supabase Settings

1. Check if your Supabase project allows connections from external IPs
2. Go to your Supabase dashboard > Settings > Database
3. Make sure "SSL Enforcement" is configured correctly

### 6. Deploy with the Updated Configuration

After making these changes, redeploy your application to Render:

1. Commit your changes to your Git repository
2. Push to your main branch
3. Render will automatically redeploy your application

## Additional Troubleshooting

If you continue to experience issues:

1. Check Render logs for more detailed error messages
2. Try using the Supabase connection pooler with IPv4 support
3. Contact Supabase support to ensure your database is properly configured for external connections
4. Consider adding a health check endpoint to your application that tests database connectivity

## Resources

- [Supabase Connection Docs](https://supabase.com/docs/guides/database/connecting-to-postgres)
- [Render Deployment Docs](https://render.com/docs/deploy-node-express-app)
- [Node-Postgres SSL Configuration](https://node-postgres.com/features/ssl) 
# Deployment Guide for E-commerce Site

This document provides instructions for deploying the e-commerce application to different hosting platforms.

## Prerequisites

Before deploying, make sure you have:

1. A completed build of the application (`npm run build`)
2. Access to your database credentials
3. An account on the platform where you want to deploy (Vercel, Render, etc.)

## Environment Variables

The application requires the following environment variables:

```
DB_HOST=aws-0-eu-central-1.pooler.supabase.com
DB_PORT=6543
DB_USER=postgres.iptgkvofawoqvykmkcrk
DB_PASSWORD=Gaston.07730218
DB_NAME=postgres
PGSSLMODE=no-verify
```

## Deploying to Vercel

1. **Create a Vercel account** if you don't have one already at [vercel.com](https://vercel.com)

2. **Install the Vercel CLI** (optional):
   ```
   npm install -g vercel
   ```

3. **Login to Vercel** (if using CLI):
   ```
   vercel login
   ```

4. **Deploy the application**:
   - Option 1: Using the Vercel Dashboard
     1. Go to [vercel.com/new](https://vercel.com/new)
     2. Import your GitHub repository
     3. Configure the project:
        - Build Command: `npm run build`
        - Output Directory: `build`
        - Add the environment variables listed above
     4. Click "Deploy"

   - Option 2: Using the Vercel CLI
     1. Navigate to your project directory
     2. Run `vercel`
     3. Follow the prompts to configure your project
     4. Add environment variables using `vercel env add`

5. **Connect your custom domain** (optional):
   1. Go to your project settings in the Vercel dashboard
   2. Navigate to the "Domains" section
   3. Add your custom domain and follow the instructions

## Deploying to Render

1. **Create a Render account** if you don't have one already at [render.com](https://render.com)

2. **Create a new Web Service**:
   1. Go to your Render dashboard
   2. Click "New" and select "Web Service"
   3. Connect your GitHub repository
   4. Configure the service:
      - Name: Choose a name for your service
      - Environment: Node
      - Build Command: `npm install && npm run build`
      - Start Command: `npm run start:server` (or appropriate server start command)
      - Add the environment variables listed above
   5. Click "Create Web Service"

3. **Connect your custom domain** (optional):
   1. Go to your web service settings
   2. Navigate to the "Custom Domain" section
   3. Add your domain and follow the instructions

## Post-Deployment Verification

After deploying, verify that:

1. The frontend loads correctly
2. API endpoints are working
3. Database connections are established
4. User authentication works properly
5. Product listings and images are displayed correctly

## Troubleshooting

If you encounter issues during deployment:

1. Check the deployment logs for errors
2. Verify that all environment variables are set correctly
3. Ensure your database is accessible from the hosting provider
4. Check for CORS issues if the frontend can't communicate with the backend

## Note on TypeScript Errors

The project has been configured to build successfully despite TypeScript errors by setting `TSC_COMPILE_ON_ERROR=true` in the build script. This allows deployment while there are still some type issues in the codebase.

For a production environment, it's recommended to gradually fix these TypeScript errors to ensure better code quality and prevent potential runtime issues. The main TypeScript errors that need to be addressed include:

1. URL.createObjectURL() type issues in ProductForm.tsx
2. FormErrors interface property access in various components
3. Type conversions for price and discountPrice properties
4. Order property type issues in OrderDetailPage.tsx
5. User data property naming conventions (firstName vs first_name, etc.)

To fix these issues systematically, consider:
- Adding proper type assertions for File objects
- Defining complete interfaces for all data structures
- Using consistent property naming across the application
- Implementing proper type guards for conditional rendering 
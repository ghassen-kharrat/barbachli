# Deployment Instructions for Barbachli E-Commerce Authentication Server

This document provides step-by-step instructions for deploying the Barbachli E-Commerce Authentication Server to Render.com.

## Prerequisites

- A GitHub account with access to the repository
- A Render.com account

## Deployment Steps

### 1. Log in to Render Dashboard

Go to https://dashboard.render.com/ and log in to your account.

### 2. Create a New Web Service

1. Click on the **New** button in the top right corner
2. Select **Web Service** from the dropdown menu

### 3. Connect Your Repository

1. Connect your GitHub account if you haven't already
2. Select the repository `barbachli` from the list of repositories
3. Click **Connect**

### 4. Configure the Web Service

Use the following configuration settings:

| Setting | Value |
|---------|-------|
| **Name** | `barbachli-auth` |
| **Environment** | `Node` |
| **Region** | Choose the region closest to your users |
| **Branch** | `main` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Plan** | `Free` |

### 5. Add Environment Variables

Click on the **Advanced** button and add the following environment variable:

| Key | Value |
|-----|-------|
| `PORT` | `8080` |

### 6. Deploy the Service

Click on the **Create Web Service** button to start the deployment process.

### 7. Monitor the Deployment

You can monitor the deployment process in the Render dashboard. Once the deployment is complete, you'll see a green "Live" status indicator.

### 8. Test the Authentication Server

Test the authentication server by making a request to the following endpoints:

- Health check: `https://barbachli-auth.onrender.com/api/health`
- Login: `https://barbachli-auth.onrender.com/api/auth/login` (POST)
- Check authentication: `https://barbachli-auth.onrender.com/api/auth/check` (GET with Authorization header)

## Troubleshooting

If you encounter any issues during deployment, check the following:

1. **Build Failures**: Check the build logs for any errors.
2. **Runtime Errors**: Check the logs for any runtime errors.
3. **Environment Variables**: Make sure all required environment variables are set correctly.
4. **Permissions**: Make sure Render has the necessary permissions to access your repository.

## Next Steps

After successfully deploying the authentication server, you need to update your frontend configuration to use the new authentication server URL. This has already been done in the `src/config.js` file.

The frontend should now be using the following URLs:

- API URL: `https://barbachli-auth.onrender.com/api`
- Auth API URL: `https://barbachli-auth.onrender.com/api`
- Image Base URL: `https://barbachli-auth.onrender.com/images` 
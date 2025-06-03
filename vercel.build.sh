#!/bin/bash

# Set environment variables
export TSC_COMPILE_ON_ERROR=true
export PUBLIC_URL=/

# Build the React app
echo "Building React app with TSC_COMPILE_ON_ERROR=true"
npm run build

# Create a _redirects file if it doesn't exist
if [ ! -f "build/_redirects" ]; then
  echo "Creating _redirects file"
  echo "/* /index.html 200" > build/_redirects
fi

echo "Build completed" 
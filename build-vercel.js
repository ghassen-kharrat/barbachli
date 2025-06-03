// Custom build script for Vercel deployment
const { execSync } = require('child_process');

// Set environment variable
process.env.TSC_COMPILE_ON_ERROR = 'true';
process.env.PUBLIC_URL = '/';

console.log('Starting build with TSC_COMPILE_ON_ERROR=true and PUBLIC_URL=/');

try {
  // Run the build command with cross-env
  execSync('npx cross-env TSC_COMPILE_ON_ERROR=true PUBLIC_URL=/ react-scripts build', { stdio: 'inherit' });
  console.log('Build completed successfully');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
} 
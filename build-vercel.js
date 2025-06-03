// Custom build script for Vercel deployment
const { execSync } = require('child_process');

// Set environment variable
process.env.TSC_COMPILE_ON_ERROR = 'true';

console.log('Starting build with TSC_COMPILE_ON_ERROR=true');

try {
  // Run the build command
  execSync('react-scripts build', { stdio: 'inherit' });
  console.log('Build completed successfully');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
} 
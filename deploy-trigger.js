// Simple script to help with deployment
const { execSync } = require('child_process');
const fs = require('fs');

console.log('Starting deployment process...');

// Create a temporary file to trigger a new commit
const timestamp = new Date().toISOString();
fs.writeFileSync('deploy-trigger.txt', `Deployment triggered at ${timestamp}`);

try {
  // Add the file to git
  console.log('Adding trigger file to git...');
  execSync('git add deploy-trigger.txt');
  
  // Commit the change
  console.log('Committing changes...');
  execSync(`git commit -m "Trigger deployment at ${timestamp}"`);
  
  // Push to GitHub
  console.log('Pushing to GitHub...');
  execSync('git push origin main');
  
  console.log('Deployment triggered successfully!');
  console.log('Check Vercel dashboard for deployment status.');
} catch (error) {
  console.error('Error during deployment:', error.message);
  process.exit(1);
} 
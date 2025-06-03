// Script to start the backend server with proper configuration
require('dotenv').config();
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Check if .env file exists, if not create it with default values
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('Creating .env file with default values...');
  const defaultEnv = `
SUPABASE_URL=https://iptgkvofawoqvykmkcrk.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlwdGdrdm9mYXdvcXZ5a21rY3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4NjkxMTMsImV4cCI6MjA2NDQ0NTExM30.oUsFpKGgeddXRU5lbaeaufBZ2wV7rnl1a0h2YEfC9b8
PORT=5001
JWT_SECRET=your_jwt_secret_here
NODE_ENV=development
`;
  fs.writeFileSync(envPath, defaultEnv);
  console.log('✅ Created .env file');
}

// Parse command line arguments
const args = process.argv.slice(2);
const useSupabase = args.includes('--supabase') || args.includes('-s');
const port = args.find(arg => arg.startsWith('--port='))?.split('=')[1] || process.env.PORT || 5001;

// Determine which server file to run
const serverFile = useSupabase ? 'server-supabase.js' : 'server.js';
console.log(`Starting ${serverFile} on port ${port}...`);

// Start the server process
const serverProcess = spawn('node', [serverFile, `--port=${port}`], {
  stdio: 'inherit',
  env: {
    ...process.env,
    PORT: port
  }
});

// Handle server process events
serverProcess.on('error', (error) => {
  console.error(`Failed to start server: ${error.message}`);
  process.exit(1);
});

serverProcess.on('exit', (code, signal) => {
  if (code !== 0) {
    console.log(`Server process exited with code ${code} and signal ${signal}`);
  }
});

// Handle termination signals
process.on('SIGINT', () => {
  console.log('Stopping server...');
  serverProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('Stopping server...');
  serverProcess.kill('SIGTERM');
});

console.log(`Server running at http://localhost:${port}`);
console.log('Press Ctrl+C to stop'); 
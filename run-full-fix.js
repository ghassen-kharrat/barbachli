// Main script to run the complete authentication fix
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Print colorful banner
function printBanner() {
  console.log(`${colors.cyan}
╭──────────────────────────────────────────────────╮
│                                                  │
│    ${colors.yellow}ECOMMERCE AUTHENTICATION FIX${colors.cyan}                   │
│                                                  │
│    ${colors.green}Comprehensive solution for connecting${colors.cyan}           │
│    ${colors.green}frontend, backend and database${colors.cyan}                  │
│                                                  │
╰──────────────────────────────────────────────────╯
${colors.reset}`);
}

// Execute a script and return a promise
function executeScript(scriptPath, args = []) {
  return new Promise((resolve, reject) => {
    console.log(`${colors.yellow}Running: ${path.basename(scriptPath)}${colors.reset}`);
    console.log(`${colors.blue}${'─'.repeat(50)}${colors.reset}`);
    
    const child = spawn('node', [scriptPath, ...args], {
      stdio: 'inherit'
    });
    
    child.on('close', (code) => {
      console.log(`${colors.blue}${'─'.repeat(50)}${colors.reset}`);
      
      if (code === 0) {
        console.log(`${colors.green}✓ ${path.basename(scriptPath)} completed successfully${colors.reset}`);
        resolve();
      } else {
        console.log(`${colors.red}✗ ${path.basename(scriptPath)} failed with code ${code}${colors.reset}`);
        reject(new Error(`Script exited with code ${code}`));
      }
      
      console.log();
    });
  });
}

// Install dependencies
async function installDependencies() {
  console.log(`${colors.cyan}Installing required dependencies...${colors.reset}`);
  
  return new Promise((resolve, reject) => {
    const dependencies = [
      'express',
      'cors',
      'body-parser',
      '@supabase/supabase-js',
      'axios'
    ];
    
    const npm = spawn('npm', ['install', ...dependencies], {
      stdio: 'inherit'
    });
    
    npm.on('close', (code) => {
      if (code === 0) {
        console.log(`${colors.green}✓ Dependencies installed successfully${colors.reset}\n`);
        resolve();
      } else {
        console.log(`${colors.red}✗ Failed to install dependencies${colors.reset}\n`);
        reject(new Error(`npm install exited with code ${code}`));
      }
    });
  });
}

// Run local server for testing
function startLocalServer() {
  console.log(`${colors.cyan}Starting local backend server...${colors.reset}`);
  
  // Don't use spawn here as we don't want to wait for this to complete
  const server = spawn('node', ['server.js'], {
    stdio: 'inherit',
    detached: true
  });
  
  // Don't reference the server to allow it to run independently
  server.unref();
  
  console.log(`${colors.green}✓ Server started in the background${colors.reset}\n`);
  console.log(`${colors.yellow}Please allow a few seconds for the server to start before testing${colors.reset}\n`);
  
  // Return a promise that resolves after a delay to allow server to start
  return new Promise(resolve => setTimeout(resolve, 3000));
}

// Main function to run all scripts
async function runFullFix() {
  printBanner();
  
  try {
    // Step 1: Install dependencies
    await installDependencies();
    
    // Step 2: Test Supabase connection
    console.log(`${colors.cyan}Step 1: Testing Supabase connection and user setup${colors.reset}`);
    await executeScript(path.join(__dirname, 'test-supabase-connection.js'));
    
    // Step 3: Fix backend connection
    console.log(`${colors.cyan}Step 2: Setting up backend server and database connection${colors.reset}`);
    await executeScript(path.join(__dirname, 'fix-auth-backend.js'));
    
    // Step 4: Start local server
    console.log(`${colors.cyan}Step 3: Starting local backend server${colors.reset}`);
    await startLocalServer();
    
    // Step 5: Test backend endpoints
    console.log(`${colors.cyan}Step 4: Testing authentication endpoints${colors.reset}`);
    await executeScript(path.join(__dirname, 'test-backend-auth.js'));
    
    // Success message
    console.log(`${colors.green}
╭──────────────────────────────────────────────────╮
│                                                  │
│    AUTHENTICATION FIX COMPLETED SUCCESSFULLY     │
│                                                  │
│    Please read REAL-AUTH-SOLUTION.md for         │
│    detailed instructions on next steps.          │
│                                                  │
╰──────────────────────────────────────────────────╯
${colors.reset}`);
    
  } catch (error) {
    console.error(`${colors.red}
╭──────────────────────────────────────────────────╮
│                                                  │
│    ERROR DURING AUTHENTICATION FIX               │
│                                                  │
│    ${error.message.padEnd(46)}    │
│                                                  │
│    Please check the error messages above         │
│    and fix any issues before continuing.         │
│                                                  │
╰──────────────────────────────────────────────────╯
${colors.reset}`);
    process.exit(1);
  }
}

// Run the full fix
runFullFix(); 
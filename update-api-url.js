// Script to update the API URL in the Vercel deployment
const fs = require('fs');
const path = require('path');
const axios = require('axios');

console.log('Starting API URL update script...');

// Function to update config.js
async function updateConfigFile() {
  try {
    const configPath = path.join(__dirname, 'src', 'config.js');
    console.log(`Reading config file at: ${configPath}`);
    
    if (fs.existsSync(configPath)) {
      let configContent = fs.readFileSync(configPath, 'utf8');
      
      // Check if the file contains any references to barbachli-supabase
      if (configContent.includes('barbachli-supabase')) {
        console.log('Found references to barbachli-supabase in config.js, updating...');
        
        // Replace all instances of barbachli-supabase with barbachli-auth
        configContent = configContent.replace(/barbachli-supabase\.onrender\.com/g, 'barbachli-auth.onrender.com');
        
        // Write the updated content back to the file
        fs.writeFileSync(configPath, configContent, 'utf8');
        console.log('Successfully updated config.js');
      } else {
        console.log('No references to barbachli-supabase found in config.js');
      }
    } else {
      console.error('Config file not found!');
    }
  } catch (error) {
    console.error('Error updating config file:', error);
  }
}

// Function to check all API service files for direct URL references
async function checkApiServiceFiles() {
  try {
    const apiServicesDir = path.join(__dirname, 'src', 'features');
    console.log(`Checking API service files in: ${apiServicesDir}`);
    
    if (fs.existsSync(apiServicesDir)) {
      // Find all .ts files in the features directory recursively
      const findTsFiles = (dir) => {
        let results = [];
        const list = fs.readdirSync(dir);
        
        list.forEach(file => {
          const filePath = path.join(dir, file);
          const stat = fs.statSync(filePath);
          
          if (stat.isDirectory()) {
            // Recursively search directories
            results = results.concat(findTsFiles(filePath));
          } else if (file.endsWith('.ts') || file.endsWith('.js')) {
            // Add TypeScript and JavaScript files to results
            results.push(filePath);
          }
        });
        
        return results;
      };
      
      const serviceFiles = findTsFiles(apiServicesDir);
      console.log(`Found ${serviceFiles.length} potential service files`);
      
      // Check each file for barbachli-supabase references
      let updatedFiles = 0;
      
      for (const filePath of serviceFiles) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        if (content.includes('barbachli-supabase')) {
          console.log(`Found reference in: ${filePath}`);
          
          // Replace all instances of barbachli-supabase with barbachli-auth
          const updatedContent = content.replace(/barbachli-supabase\.onrender\.com/g, 'barbachli-auth.onrender.com');
          
          // Write the updated content back to the file
          fs.writeFileSync(filePath, updatedContent, 'utf8');
          updatedFiles++;
        }
      }
      
      console.log(`Updated ${updatedFiles} files with API URL references`);
    } else {
      console.error('API services directory not found!');
    }
  } catch (error) {
    console.error('Error checking API service files:', error);
  }
}

// Function to test API connectivity
async function testApiConnectivity() {
  try {
    console.log('Testing API connectivity...');
    
    // Test barbachli-auth API
    console.log('Testing barbachli-auth API...');
    try {
      const authResponse = await axios.get('https://barbachli-auth.onrender.com/api/health', { timeout: 10000 });
      console.log('barbachli-auth API response:', authResponse.status, authResponse.data);
    } catch (error) {
      console.error('Error connecting to barbachli-auth API:', error.message);
    }
    
    // Test barbachli-supabase API (for comparison)
    console.log('Testing barbachli-supabase API...');
    try {
      const supabaseResponse = await axios.get('https://barbachli-supabase.onrender.com/api/health', { timeout: 10000 });
      console.log('barbachli-supabase API response:', supabaseResponse.status, supabaseResponse.data);
    } catch (error) {
      console.error('Error connecting to barbachli-supabase API:', error.message);
    }
  } catch (error) {
    console.error('Error testing API connectivity:', error);
  }
}

// Main function to run all tasks
async function main() {
  console.log('Starting API URL update process...');
  
  // Update config.js
  await updateConfigFile();
  
  // Check API service files
  await checkApiServiceFiles();
  
  // Test API connectivity
  await testApiConnectivity();
  
  console.log('API URL update process completed');
}

// Run the main function
main().catch(error => {
  console.error('Unhandled error in main process:', error);
  process.exit(1);
}); 
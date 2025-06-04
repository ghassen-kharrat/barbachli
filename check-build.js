// Script to check the build directory for hardcoded references to onrender.com URLs
const fs = require('fs');
const path = require('path');

console.log('Starting URL reference check...');

// Function to check files in a directory recursively
function checkDirectory(directory) {
  console.log(`Checking directory: ${directory}`);
  
  let foundReferences = {
    'barbachli-supabase': 0,
    'barbachli-auth': 0,
    'barbachli-1': 0,
    'onrender.com': 0
  };
  
  try {
    // Get all files in the directory
    const files = fs.readdirSync(directory);
    
    // Process each file
    files.forEach(file => {
      const filePath = path.join(directory, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        // Recursively check subdirectories
        const subResults = checkDirectory(filePath);
        // Merge results
        Object.keys(subResults).forEach(key => {
          foundReferences[key] += subResults[key];
        });
      } else if (stats.isFile()) {
        // Check if the file is a text file (JS, HTML, CSS, etc.)
        const extension = path.extname(file).toLowerCase();
        if (['.js', '.html', '.css', '.json', '.txt', '.map', '.ts', '.tsx'].includes(extension)) {
          try {
            // Read the file content
            const content = fs.readFileSync(filePath, 'utf8');
            
            // Check for each type of reference
            if (content.includes('barbachli-supabase')) {
              console.log(`Found barbachli-supabase reference in: ${filePath}`);
              foundReferences['barbachli-supabase']++;
            }
            
            if (content.includes('barbachli-auth')) {
              console.log(`Found barbachli-auth reference in: ${filePath}`);
              foundReferences['barbachli-auth']++;
            }
            
            if (content.includes('barbachli-1')) {
              console.log(`Found barbachli-1 reference in: ${filePath}`);
              foundReferences['barbachli-1']++;
            }
            
            // Check for general onrender.com references
            if (content.includes('onrender.com') && 
                !content.includes('barbachli-supabase') && 
                !content.includes('barbachli-auth') &&
                !content.includes('barbachli-1')) {
              console.log(`Found other onrender.com reference in: ${filePath}`);
              foundReferences['onrender.com']++;
            }
          } catch (error) {
            console.error(`Error reading file ${filePath}: ${error.message}`);
          }
        }
      }
    });
  } catch (error) {
    console.error(`Error accessing directory ${directory}: ${error.message}`);
  }
  
  return foundReferences;
}

// Main function
function main() {
  let totalReferences = {
    'barbachli-supabase': 0,
    'barbachli-auth': 0,
    'barbachli-1': 0,
    'onrender.com': 0
  };
  
  // Check the source directory
  const srcDir = path.join(__dirname, 'src');
  if (fs.existsSync(srcDir)) {
    console.log('\nChecking source directory...');
    const srcReferences = checkDirectory(srcDir);
    console.log('\nSource directory summary:');
    Object.keys(srcReferences).forEach(key => {
      console.log(`- ${key}: ${srcReferences[key]} references`);
      totalReferences[key] += srcReferences[key];
    });
  } else {
    console.error('Source directory not found.');
  }
  
  // Check if the build directory exists
  const buildDir = path.join(__dirname, 'build');
  if (fs.existsSync(buildDir)) {
    console.log('\nChecking build directory...');
    const buildReferences = checkDirectory(buildDir);
    console.log('\nBuild directory summary:');
    Object.keys(buildReferences).forEach(key => {
      console.log(`- ${key}: ${buildReferences[key]} references`);
      totalReferences[key] += buildReferences[key];
    });
  } else {
    console.log('Build directory not found.');
  }
  
  console.log('\nTotal references found:');
  Object.keys(totalReferences).forEach(key => {
    console.log(`- ${key}: ${totalReferences[key]} references`);
  });
}

// Run the main function
main(); 
const fs = require('fs');
const path = require('path');
const https = require('https');

// Create directories if they don't exist
const productsDir = path.join(__dirname, 'public/images/products');
const carouselDir = path.join(__dirname, 'public/images/carousel');

if (!fs.existsSync(productsDir)) {
  fs.mkdirSync(productsDir, { recursive: true });
}

if (!fs.existsSync(carouselDir)) {
  fs.mkdirSync(carouselDir, { recursive: true });
}

// List of image filenames we need based on the seed.sql file
const productImages = [
  'iphone14pro-1.jpg', 'iphone14pro-2.jpg', 'iphone14pro-3.jpg',
  'samsung-s23-1.jpg', 'samsung-s23-2.jpg',
  'xiaomi-redmi-1.jpg', 'xiaomi-redmi-2.jpg',
  'oppo-reno-1.jpg', 'oppo-reno-2.jpg',
  'huawei-p50-1.jpg',
  'ipad-air-1.jpg', 'ipad-air-2.jpg',
  'galaxy-tab-1.jpg',
  'lenovo-tab-1.jpg',
  'iphone-case-1.jpg',
  'wireless-charger-1.jpg',
  'airpods-1.jpg',
  'macbook-air-1.jpg', 'macbook-air-2.jpg', 'macbook-air-3.jpg',
  'dell-xps-1.jpg', 'dell-xps-2.jpg',
  'thinkpad-1.jpg',
  'hp-pavilion-1.jpg',
  'acer-nitro-1.jpg',
  'imac-1.jpg',
  'hp-desktop-1.jpg',
  'mouse-1.jpg',
  'keyboard-1.jpg',
  'samsung-tv-1.jpg', 'samsung-tv-2.jpg',
  'lg-tv-1.jpg',
  'tcl-tv-1.jpg',
  'bose-1.jpg', 'bose-2.jpg',
  'jbl-1.jpg',
  'sonos-1.jpg',
  'refrigerator-1.jpg',
  'washing-machine-1.jpg',
  'robot-vacuum-1.jpg',
  'cookware-1.jpg',
  'coffee-machine-1.jpg',
  'desk-1.jpg',
  'leather-jacket-1.jpg',
  'summer-dress-1.jpg',
  'sneakers-1.jpg',
  'ps5-1.jpg', 'ps5-2.jpg',
  'nintendo-switch-1.jpg',
  'fifa23-1.jpg'
];

const carouselImages = [
  'smartphones.jpg',
  'sale.jpg',
  'gaming.jpg',
  'audio.jpg'
];

// Function to download an image from a URL
function downloadImage(url, destination) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destination);
    
    https.get(url, response => {
      response.pipe(file);
      
      file.on('finish', () => {
        file.close(resolve);
        console.log(`Downloaded: ${destination}`);
      });
    }).on('error', err => {
      fs.unlink(destination, () => {}); // Delete the file if there was an error
      reject(err);
    });
  });
}

// Download product images using placeholders
async function downloadProductImages() {
  for (const imageName of productImages) {
    const destination = path.join(productsDir, imageName);
    
    // Skip if the file already exists
    if (fs.existsSync(destination)) {
      console.log(`Skipping, already exists: ${destination}`);
      continue;
    }
    
    // Get a unique placeholder image for each product
    const seed = imageName.replace(/[^a-zA-Z0-9]/g, '');
    const url = `https://picsum.photos/seed/${seed}/600/600`;
    
    try {
      await downloadImage(url, destination);
    } catch (error) {
      console.error(`Failed to download ${imageName}: ${error.message}`);
    }
  }
}

// Download carousel images
async function downloadCarouselImages() {
  const carouselUrls = {
    'smartphones.jpg': 'https://picsum.photos/seed/smartphones/1200/400',
    'sale.jpg': 'https://picsum.photos/seed/sale/1200/400',
    'gaming.jpg': 'https://picsum.photos/seed/gaming/1200/400',
    'audio.jpg': 'https://picsum.photos/seed/audio/1200/400'
  };
  
  for (const imageName of carouselImages) {
    const destination = path.join(carouselDir, imageName);
    
    // Skip if the file already exists
    if (fs.existsSync(destination)) {
      console.log(`Skipping, already exists: ${destination}`);
      continue;
    }
    
    try {
      await downloadImage(carouselUrls[imageName], destination);
    } catch (error) {
      console.error(`Failed to download ${imageName}: ${error.message}`);
    }
  }
}

// Run the downloads
async function main() {
  console.log('Downloading product images...');
  await downloadProductImages();
  
  console.log('Downloading carousel images...');
  await downloadCarouselImages();
  
  console.log('All images downloaded successfully!');
}

main().catch(error => {
  console.error('Error in main process:', error);
}); 
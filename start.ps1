Write-Host "Starting eCommerce Application..." -ForegroundColor Green

# Create .env file if it doesn't exist
if (!(Test-Path .\.env)) {
    Write-Host "Creating .env file..." -ForegroundColor Yellow
    @"
PORT=5001
JWT_SECRET=your-super-secret-key-for-jwt-tokens
DATABASE_URL=postgresql://postgres:root@localhost:5432/ecommerce
NODE_ENV=development
REACT_APP_API_URL=http://localhost:5001/api
"@ | Out-File -FilePath .\.env -Encoding utf8
    Write-Host "Created .env file!" -ForegroundColor Green
}

# Check if database is set up
Write-Host "Checking PostgreSQL connection..." -ForegroundColor Yellow
$testConnection = & psql -U postgres -c "SELECT 1 FROM pg_database WHERE datname='ecommerce'" postgres

if ($testConnection -notlike "*1 row*") {
    Write-Host "Database 'ecommerce' not found. Running database setup..." -ForegroundColor Yellow
    & powershell -ExecutionPolicy Bypass -File setup-db.ps1
} else {
    Write-Host "Database 'ecommerce' already exists!" -ForegroundColor Green
}

# Start application with concurrently
Write-Host "Starting application..." -ForegroundColor Green
npm run dev 
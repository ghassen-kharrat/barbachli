Write-Host "Setting up PostgreSQL database for ecommerce-site" -ForegroundColor Green

# Set PostgreSQL credentials based on .env
$env:PGPASSWORD = "root"
$pgUser = "postgres"

Write-Host "Creating database..." -ForegroundColor Yellow
& psql -U $pgUser -c "CREATE DATABASE ecommerce WITH ENCODING='UTF8';" postgres

if ($LASTEXITCODE -ne 0) {
    Write-Host "Database may already exist, trying to proceed..." -ForegroundColor Yellow
}

Write-Host "Creating schema..." -ForegroundColor Yellow
& psql -U $pgUser -d ecommerce -f "database/schema.sql"

Write-Host "Loading seed data..." -ForegroundColor Yellow
& psql -U $pgUser -d ecommerce -f "database/seed.sql"

if ($LASTEXITCODE -eq 0) {
    Write-Host "Database setup complete!" -ForegroundColor Green
} else {
    Write-Host "There were errors during database setup. Check the output above." -ForegroundColor Red
}

Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 
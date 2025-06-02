@echo off
echo Starting eCommerce Application...

rem Check if .env file exists
if not exist .env (
    echo Creating .env file...
    (
        echo PORT=5001
        echo JWT_SECRET=your-super-secret-key-for-jwt-tokens
        echo DATABASE_URL=postgresql://postgres:root@localhost:5432/ecommerce
        echo NODE_ENV=development
        echo REACT_APP_API_URL=http://localhost:5001/api
    ) > .env
    echo Created .env file!
)

rem Check database
echo Checking PostgreSQL connection...
psql -U postgres -c "SELECT 1 FROM pg_database WHERE datname='ecommerce'" postgres | findstr "1 row" > nul
if errorlevel 1 (
    echo Database 'ecommerce' not found. Running database setup...
    call setup-db.bat
) else (
    echo Database 'ecommerce' already exists!
)

rem Start application
echo Starting application...
npm run dev 
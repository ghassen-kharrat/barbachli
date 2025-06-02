@echo off
echo Setting up PostgreSQL database for ecommerce-site

echo Creating database...
psql -U postgres -c "CREATE DATABASE ecommerce;"

echo Creating schema and loading seed data...
psql -U postgres -d ecommerce -f database/schema.sql
psql -U postgres -d ecommerce -f database/seed.sql

echo Database setup complete!
pause 
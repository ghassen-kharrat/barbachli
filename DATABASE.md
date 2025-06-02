# PostgreSQL Database Setup

This document explains how to set up the PostgreSQL database for the e-commerce application.

## Current Status

The application currently uses an in-memory database for development and testing. This allows you to run the application without setting up PostgreSQL, making it easier to get started.

## PostgreSQL Setup (When Ready)

When you're ready to use PostgreSQL:

1. **Install PostgreSQL**:
   - Download and install PostgreSQL from [postgresql.org](https://www.postgresql.org/download/)
   - Make sure the PostgreSQL service is running

2. **Create a Database**:
   ```sql
   CREATE DATABASE ecommerce;
   ```

3. **Update Environment Variables**:
   - Edit the `.env` file in the project root
   - Set `DATABASE_URL` to your PostgreSQL connection string
   - For example: `DATABASE_URL=postgresql://username:password@localhost:5432/ecommerce`

4. **Modify Server Code**:
   - Replace the in-memory database with PostgreSQL
   - Uncomment the PostgreSQL connection code in `server.js`
   - The schema and seed files are already prepared in the `database` directory

5. **Run Database Setup**:
   - For Windows: Run `setup-db.bat` or `.\setup-db.ps1`
   - For Linux/Mac: Run `./setup-db.sh`
   - Alternatively, run the SQL files manually with:
     ```
     psql -U postgres -d ecommerce -f database/schema.sql
     psql -U postgres -d ecommerce -f database/seed.sql
     ```

## Accessing PostgreSQL

You might need to set up a PostgreSQL user and password:

```sql
-- Create a new user
CREATE USER myuser WITH PASSWORD 'mypassword';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE ecommerce TO myuser;
```

## Testing the Connection

You can test your database connection using the `test-db.js` script:

```
node test-db.js
```

This will try to connect to PostgreSQL using your connection string and report any issues.

## Login Credentials

The seed data includes two test users:

1. **Admin User**
   - Email: admin@example.com
   - Password: admin123

2. **Regular User**
   - Email: jean@example.com
   - Password: password123 
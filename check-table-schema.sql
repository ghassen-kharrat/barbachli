-- SQL script to check table schemas to help understand the correct column names

-- Check the schema of the users table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users';

-- Check if there's an auth_users table and its schema
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'auth_users';

-- Check all tables that might contain user information
SELECT table_name 
FROM information_schema.tables 
WHERE table_name LIKE '%user%';

-- Check if there's a specific admin role field
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name LIKE '%role%';

-- Check if there's an admins table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'admins';

-- Check constraints to understand relationship keys
SELECT tc.constraint_name, tc.table_name, kcu.column_name, 
       tc.constraint_type, ccu.table_name AS foreign_table_name,
       ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.constraint_column_usage ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'users';

-- Look for an id column specifically
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'id'; 
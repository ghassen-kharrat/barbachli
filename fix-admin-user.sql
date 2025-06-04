-- SQL script to fix admin user in database

-- First, let's confirm the admin user exists in auth.users
-- We can see from your screenshot that the UUID is '57ecae66-fe5e-4c89-9296-5a31240a6a31'
SELECT id, email FROM auth.users WHERE email = 'admin@example.com';

-- Now, let's properly update or insert this user into your application's users table
-- The UUID needs to be properly formatted as a UUID type, not a string with quotes

-- Method 1: If the user already exists in your users table
UPDATE users
SET role = 'admin', is_active = true
WHERE email = 'admin@example.com';

-- Method 2: If the user doesn't exist in your users table yet, insert it
-- The UUID should be properly cast to UUID type
INSERT INTO users (id, email, first_name, last_name, role, is_active)
VALUES (
  -- Use the proper UUID format without quotes
  '57ecae66-fe5e-4c89-9296-5a31240a6a31'::uuid,
  'admin@example.com',
  'Admin',
  'User',
  'admin',
  true
)
ON CONFLICT (id) DO UPDATE 
SET role = 'admin', is_active = true;

-- Alternative: If your users table uses auth_id instead of id
INSERT INTO users (auth_id, email, first_name, last_name, role, is_active)
VALUES (
  '57ecae66-fe5e-4c89-9296-5a31240a6a31',
  'admin@example.com',
  'Admin',
  'User',
  'admin',
  true
)
ON CONFLICT (auth_id) DO UPDATE 
SET role = 'admin', is_active = true;

-- Verify the update worked
SELECT * FROM users WHERE email = 'admin@example.com';

-- Reset the password if needed
UPDATE auth.users
SET encrypted_password = crypt('Password123!', gen_salt('bf'))
WHERE email = 'admin@example.com'; 
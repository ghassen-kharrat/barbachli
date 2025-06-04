-- SQL script to update admin user password
-- Execute this in the Supabase SQL Editor

-- First, generate a new password hash for 'Password123!'
-- This uses the built-in Supabase/PostgreSQL function
SELECT crypt('Password123!', gen_salt('bf')) AS new_password_hash;

-- After running the above command, you'll get a hash like '$2a$06$xxxxxxxxxxx'
-- Copy that hash and replace 'NEW_PASSWORD_HASH' below, then run this query

-- UPDATE auth.users
-- SET encrypted_password = 'NEW_PASSWORD_HASH'
-- WHERE id = '1' AND email = 'admin@example.com';

-- Verify the update
-- SELECT id, email, role FROM auth.users WHERE id = '1';

-- Note: If the above command doesn't work due to schema differences, try these alternatives:

-- Alternative 1: Update in users table
-- UPDATE users
-- SET password = 'NEW_PASSWORD_HASH'
-- WHERE id = 1 AND email = 'admin@example.com';

-- Alternative 2: For custom auth implementation
-- UPDATE users
-- SET password_hash = 'NEW_PASSWORD_HASH'
-- WHERE id = 1 AND email = 'admin@example.com'; 
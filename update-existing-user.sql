-- SQL script to give admin privileges to an existing user in Supabase

-- Get the UUID of Ghassen Kharrat's account
SELECT id, email FROM auth.users WHERE email = 'kharrat.ghassen@gmail.com';

-- Option 1: If you have a users table linked to auth.users
-- Replace 'UUID_FROM_ABOVE' with the actual UUID from the previous query
-- INSERT INTO users (auth_id, email, first_name, last_name, role, is_active)
-- VALUES (
--   'UUID_FROM_ABOVE',
--   'kharrat.ghassen@gmail.com',
--   'Ghassen',
--   'Kharrat',
--   'admin',
--   true
-- )
-- ON CONFLICT (auth_id) DO UPDATE 
-- SET role = 'admin', is_active = true;

-- Option 2: If your users table already has this user
UPDATE users
SET role = 'admin', is_active = true
WHERE email = 'kharrat.ghassen@gmail.com';

-- Option 3: If your application uses a separate admins table
-- INSERT INTO admins (user_id)
-- SELECT id FROM users WHERE email = 'kharrat.ghassen@gmail.com'
-- ON CONFLICT (user_id) DO NOTHING;

-- Verify the update
SELECT * FROM users WHERE email = 'kharrat.ghassen@gmail.com';

-- Reset password if needed (Note: This needs admin privileges and might not work)
-- UPDATE auth.users
-- SET encrypted_password = crypt('Password123!', gen_salt('bf'))
-- WHERE email = 'kharrat.ghassen@gmail.com'; 
-- Simple SQL script to fix admin user
-- This approach focuses on just fixing the error in your original query

-- From your screenshot, I see you tried to insert a user with ID as a string with quotes
-- The error shows: 22P02: invalid input syntax for type integer: "57ecae66-fe5e-4c89-9296-5a31240a6a31"

-- Here's the corrected version that should work:
INSERT INTO users (id, email, first_name, last_name, role, is_active)
VALUES (
  1,  -- Using a simple integer ID instead of UUID
  'admin@example.com',
  'Admin',
  'User',
  'admin',
  true
);

-- If that still doesn't work, try without specifying the ID:
INSERT INTO users (email, first_name, last_name, role, is_active)
VALUES (
  'admin@example.com',
  'Admin',
  'User',
  'admin',
  true
);

-- If the user already exists, try a simple update:
UPDATE users
SET role = 'admin', is_active = true
WHERE email = 'admin@example.com';

-- To verify it worked:
SELECT * FROM users WHERE email = 'admin@example.com';

-- If none of these work, please run the check-table-schema.sql script
-- to get more information about your database structure. 
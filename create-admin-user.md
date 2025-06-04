# Creating an Admin User in Supabase

Since there's no admin@example.com user in the Authentication system, we need to create one:

## Method 1: Using the Supabase Authentication UI

1. In your Supabase dashboard, go to "Authentication" → "Users" (you're already there based on your screenshot)
2. Click the "Add user" button in the top-right corner
3. Fill in the following details:
   - Email: `admin@example.com`
   - Password: `Password123!`
   - (Optional) Display name: `Admin User`
4. Click "Create user"

## Method 2: Using SQL to Sync the Database

After creating the user in Authentication, you'll need to make sure the user has admin privileges in your application database:

1. Go to the "SQL Editor" in Supabase
2. Run the following query to add admin role to the newly created user:

```sql
-- Get the UUID of the newly created admin user
SELECT id FROM auth.users WHERE email = 'admin@example.com';

-- Use the UUID from above to update or insert into your users table
INSERT INTO users (auth_id, email, first_name, last_name, role, is_active)
VALUES (
  'UUID_FROM_ABOVE', -- Replace with the actual UUID
  'admin@example.com',
  'Admin',
  'User',
  'admin',
  true
);

-- If the user already exists in your users table, update instead:
-- UPDATE users
-- SET role = 'admin', is_active = true
-- WHERE email = 'admin@example.com';
```

## Testing the Admin User

After creating the user:

1. Try logging in to your application at https://barbachli.vercel.app/login with:
   - Email: `admin@example.com`
   - Password: `Password123!`

2. Verify you have admin privileges by accessing admin-only sections of your site

## Alternative: Using an Existing User

If you prefer to use one of your existing users (like one of your Ghassen Kharrat accounts), you can:

1. Update the role of that user to 'admin' in your database
2. Reset the password if needed using the "Reset password" option in the Authentication UI 
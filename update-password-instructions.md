# How to Update Admin User Password in Supabase

Based on your screenshot showing access to the Supabase dashboard, here's how to update the admin user's password:

## Method 1: Using the Supabase Dashboard (Recommended)

1. Login to the Supabase dashboard at https://supabase.com/dashboard/project/ptgkvovawoqvkmkcr
2. Navigate to "Authentication" → "Users" in the left sidebar
3. Find the admin user (ID: 1, email: admin@example.com)
4. Click on the three dots menu (⋮) next to the user
5. Select "Reset Password"
6. Enter the new password: `Password123!` 
7. Click "Reset Password" to confirm

## Method 2: Using SQL Editor in Supabase

If Method 1 doesn't work, you can try updating the password hash directly:

1. Login to the Supabase dashboard
2. Navigate to "SQL Editor" in the left sidebar
3. Create a new query
4. Enter the following SQL:

```sql
-- Generate a new password hash for 'Password123!'
-- Note: This is a PostgreSQL function that comes with Supabase Auth
SELECT crypt('Password123!', gen_salt('bf'));
```

5. Run the query to generate a password hash
6. Copy the generated hash
7. Create another query with:

```sql
-- Update the password hash for admin user (ID 1)
UPDATE auth.users
SET encrypted_password = 'PASTE_GENERATED_HASH_HERE'
WHERE id = '1';
```

8. Run the query to update the password

## Testing the New Password

After updating the password, you can test the login with:

- Email: `admin@example.com`
- Password: `Password123!`

Try logging in through the website frontend at https://barbachli.vercel.app/login 
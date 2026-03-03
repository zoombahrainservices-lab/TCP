-- ============================================================================
-- ADD ROLE COLUMN TO PROFILES TABLE
-- ============================================================================
-- This migration adds the 'role' column to the profiles table
-- Run this in your Supabase SQL Editor
-- ============================================================================

-- Add role column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'role'
  ) THEN
    ALTER TABLE profiles ADD COLUMN role TEXT DEFAULT 'student';
    
    -- Create index for faster role lookups
    CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
    
    RAISE NOTICE 'Role column added successfully';
  ELSE
    RAISE NOTICE 'Role column already exists';
  END IF;
END $$;

-- ============================================================================
-- SET YOUR USER AS ADMIN
-- ============================================================================
-- IMPORTANT: Replace 'your@email.com' with your actual email address

-- Uncomment and run this line after replacing the email:
-- UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Check if role column exists
SELECT 
  column_name, 
  data_type, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name = 'role';

-- View all users and their roles
SELECT 
  id,
  email,
  role,
  created_at
FROM profiles
ORDER BY created_at DESC;

-- ============================================================================
-- INSTRUCTIONS
-- ============================================================================
/*
1. Copy this entire file
2. Go to Supabase Dashboard → SQL Editor
3. Paste and click "Run"
4. After successful run, uncomment the UPDATE line above
5. Replace 'your@email.com' with your actual email
6. Run the UPDATE statement to make yourself admin
7. Refresh your TCP application
8. The Edit button should now appear on reading pages
*/

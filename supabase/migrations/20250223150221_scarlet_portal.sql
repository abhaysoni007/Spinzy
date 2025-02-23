/*
  # Add INSERT policy for profiles table

  1. Changes
    - Add policy to allow authenticated users to insert their own profile

  2. Security
    - Users can only insert a profile with their own user ID
    - Maintains existing RLS policies
*/

-- Drop existing insert policy if it exists
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Create insert policy
CREATE POLICY "Users can insert own profile"
    ON profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);
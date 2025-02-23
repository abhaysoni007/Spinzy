/*
  # Add missing columns to profiles table

  1. Changes
    - Add total_games column if it doesn't exist
    - Add total_dares column if it doesn't exist
    - Add total_truths column if it doesn't exist

  2. Security
    - No changes to security policies
*/

DO $$
BEGIN
    -- Add total_games column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'profiles'
        AND column_name = 'total_games'
    ) THEN
        ALTER TABLE profiles ADD COLUMN total_games integer DEFAULT 0;
    END IF;

    -- Add total_dares column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'profiles'
        AND column_name = 'total_dares'
    ) THEN
        ALTER TABLE profiles ADD COLUMN total_dares integer DEFAULT 0;
    END IF;

    -- Add total_truths column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'profiles'
        AND column_name = 'total_truths'
    ) THEN
        ALTER TABLE profiles ADD COLUMN total_truths integer DEFAULT 0;
    END IF;
END $$;
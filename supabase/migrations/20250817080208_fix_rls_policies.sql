-- Fix RLS policies for social features to work with NextAuth
-- The issue is that auth.uid() doesn't work with NextAuth, we need to disable RLS temporarily
-- or create policies that work with our authentication system

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view all reactions" ON activity_reactions;
DROP POLICY IF EXISTS "Users can manage their own reactions" ON activity_reactions;
DROP POLICY IF EXISTS "Users can view all comments" ON activity_comments;
DROP POLICY IF EXISTS "Users can create comments" ON activity_comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON activity_comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON activity_comments;
DROP POLICY IF EXISTS "Users can view all shares" ON activity_shares;
DROP POLICY IF EXISTS "Users can manage their own shares" ON activity_shares;

-- Disable RLS temporarily since we're handling security at the API level
ALTER TABLE activity_reactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE activity_comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE activity_shares DISABLE ROW LEVEL SECURITY;

-- Add comments explaining the security model
COMMENT ON TABLE activity_reactions IS 'Security handled at API level through NextAuth session validation';
COMMENT ON TABLE activity_comments IS 'Security handled at API level through NextAuth session validation';
COMMENT ON TABLE activity_shares IS 'Security handled at API level through NextAuth session validation'; 
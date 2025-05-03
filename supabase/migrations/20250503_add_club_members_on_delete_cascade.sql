-- Migration: Add ON DELETE CASCADE to club_members.club_id foreign key

-- 1. Drop the existing foreign key constraint on club_id
ALTER TABLE club_members DROP CONSTRAINT IF EXISTS club_members_club_id_fkey;

-- 2. Add a new foreign key constraint with ON DELETE CASCADE
ALTER TABLE club_members
  ADD CONSTRAINT club_members_club_id_fkey
  FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE;

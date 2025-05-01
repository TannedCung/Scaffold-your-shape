-- 1. Drop all FKs referencing profiles(id)
ALTER TABLE clubs DROP CONSTRAINT clubs_creator_id_fkey;
ALTER TABLE club_members DROP CONSTRAINT club_members_user_id_fkey;
ALTER TABLE activities DROP CONSTRAINT activities_user_id_fkey;
ALTER TABLE challenges DROP CONSTRAINT challenges_creator_id_fkey;
ALTER TABLE challenge_participants DROP CONSTRAINT challenge_participants_user_id_fkey;

-- 2. Change types
ALTER TABLE profiles ALTER COLUMN id TYPE text USING id::text;
ALTER TABLE profiles ALTER COLUMN id DROP DEFAULT;
ALTER TABLE clubs ALTER COLUMN creator_id TYPE text USING creator_id::text;
ALTER TABLE club_members ALTER COLUMN user_id TYPE text USING user_id::text;
ALTER TABLE activities ALTER COLUMN user_id TYPE text USING user_id::text;
ALTER TABLE challenges ALTER COLUMN creator_id TYPE text USING creator_id::text;
ALTER TABLE challenge_participants ALTER COLUMN user_id TYPE text USING user_id::text;

-- 3. Recreate FKs
ALTER TABLE clubs
  ADD CONSTRAINT clubs_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES profiles(id);
ALTER TABLE club_members
  ADD CONSTRAINT club_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id);
ALTER TABLE activities
  ADD CONSTRAINT activities_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id);
ALTER TABLE challenges
  ADD CONSTRAINT challenges_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES profiles(id);
ALTER TABLE challenge_participants
  ADD CONSTRAINT challenge_participants_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id);

-- 4. (Optional) Add a comment
COMMENT ON COLUMN profiles.id IS 'Primary key for user profile: now text to support NextAuth/Google IDs';
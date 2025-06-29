-- Function to increment club member count
CREATE OR REPLACE FUNCTION increment_club_member_count(club_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE clubs 
  SET member_count = COALESCE(member_count, 0) + 1,
      updated_at = NOW()
  WHERE id = club_id;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement club member count
CREATE OR REPLACE FUNCTION decrement_club_member_count(club_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE clubs 
  SET member_count = GREATEST(COALESCE(member_count, 0) - 1, 0),
      updated_at = NOW()
  WHERE id = club_id;
END;
$$ LANGUAGE plpgsql;

-- Function to recalculate club member count (for data consistency)
CREATE OR REPLACE FUNCTION recalculate_club_member_count(club_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE clubs 
  SET member_count = (
    SELECT COUNT(*) 
    FROM club_members 
    WHERE club_members.club_id = clubs.id
  ),
  updated_at = NOW()
  WHERE id = club_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger function to automatically update member count when club_members changes
CREATE OR REPLACE FUNCTION update_club_member_count_trigger()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM increment_club_member_count(NEW.club_id);
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM decrement_club_member_count(OLD.club_id);
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic member count updates
DROP TRIGGER IF EXISTS club_member_count_trigger ON club_members;
CREATE TRIGGER club_member_count_trigger
  AFTER INSERT OR DELETE ON club_members
  FOR EACH ROW
  EXECUTE FUNCTION update_club_member_count_trigger();

-- Create club_activity_point_conversion table for club-specific point rates
CREATE TABLE IF NOT EXISTS club_activity_point_conversion (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  unit TEXT NOT NULL,
  rate DECIMAL(10,2) NOT NULL DEFAULT 1.0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure unique combination per club
  UNIQUE(club_id, activity_type, unit)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_club_activity_point_conversion_club_id 
ON club_activity_point_conversion(club_id);

CREATE INDEX IF NOT EXISTS idx_club_activity_point_conversion_activity_type 
ON club_activity_point_conversion(activity_type);

-- Add RLS (Row Level Security) policies
ALTER TABLE club_activity_point_conversion ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read conversion rates for clubs they are members of
CREATE POLICY "Users can read club conversion rates for their clubs"
ON club_activity_point_conversion FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM club_members
    WHERE club_members.club_id = club_activity_point_conversion.club_id
    AND club_members.user_id = auth.uid()::text
  )
  OR
  EXISTS (
    SELECT 1 FROM clubs
    WHERE clubs.id = club_activity_point_conversion.club_id
    AND clubs.creator_id = auth.uid()::text
  )
);

-- Policy: Only club admins and creators can modify conversion rates
CREATE POLICY "Only club admins can modify conversion rates"
ON club_activity_point_conversion FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM club_members
    WHERE club_members.club_id = club_activity_point_conversion.club_id
    AND club_members.user_id = auth.uid()::text
    AND club_members.role = 'admin'
  )
  OR
  EXISTS (
    SELECT 1 FROM clubs
    WHERE clubs.id = club_activity_point_conversion.club_id
    AND clubs.creator_id = auth.uid()::text
  )
);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_club_activity_point_conversion_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_club_activity_point_conversion_updated_at
  BEFORE UPDATE ON club_activity_point_conversion
  FOR EACH ROW
  EXECUTE FUNCTION update_club_activity_point_conversion_updated_at();

-- Create challenge_activity_point_conversion table for challenge-specific point rates
CREATE TABLE IF NOT EXISTS challenge_activity_point_conversion (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  unit TEXT NOT NULL,
  rate DECIMAL(10,2) NOT NULL DEFAULT 1.0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure unique combination per challenge
  UNIQUE(challenge_id, activity_type, unit)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_challenge_activity_point_conversion_challenge_id 
ON challenge_activity_point_conversion(challenge_id);

CREATE INDEX IF NOT EXISTS idx_challenge_activity_point_conversion_activity_type 
ON challenge_activity_point_conversion(activity_type);

-- Add RLS (Row Level Security) policies
ALTER TABLE challenge_activity_point_conversion ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read conversion rates for challenges they participate in
CREATE POLICY "Users can read challenge conversion rates for their challenges" 
ON challenge_activity_point_conversion FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM challenge_participants 
    WHERE challenge_participants.challenge_id = challenge_activity_point_conversion.challenge_id 
    AND challenge_participants.user_id = auth.uid()::text
  )
  OR 
  EXISTS (
    SELECT 1 FROM challenges 
    WHERE challenges.id = challenge_activity_point_conversion.challenge_id 
    AND challenges.creator_id = auth.uid()::text
  )
);

-- Policy: Only challenge creators can modify conversion rates
CREATE POLICY "Only challenge creators can modify conversion rates" 
ON challenge_activity_point_conversion FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM challenges 
    WHERE challenges.id = challenge_activity_point_conversion.challenge_id 
    AND challenges.creator_id = auth.uid()::text
  )
);

-- Add trigger to update updated_at timestamp
CREATE TRIGGER update_challenge_activity_point_conversion_updated_at
  BEFORE UPDATE ON challenge_activity_point_conversion
  FOR EACH ROW
  EXECUTE FUNCTION update_club_activity_point_conversion_updated_at();

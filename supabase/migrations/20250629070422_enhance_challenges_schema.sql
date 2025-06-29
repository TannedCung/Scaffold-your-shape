-- Enhance challenges schema for production readiness
-- Add additional fields for better challenge management

-- Add new fields to challenges table
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS challenge_type TEXT CHECK (challenge_type IN ('individual', 'team', 'club')) DEFAULT 'individual';
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner';
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS reward_type TEXT CHECK (reward_type IN ('badge', 'points', 'certificate', 'custom')) DEFAULT 'badge';
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS reward_value INTEGER DEFAULT 0;
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS max_participants INTEGER;
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS auto_join BOOLEAN DEFAULT false;
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS rules TEXT;
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('draft', 'active', 'completed', 'cancelled')) DEFAULT 'active';
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS club_id UUID REFERENCES clubs(id) ON DELETE SET NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_challenges_status ON challenges(status);
CREATE INDEX IF NOT EXISTS idx_challenges_start_date ON challenges(start_date);
CREATE INDEX IF NOT EXISTS idx_challenges_end_date ON challenges(end_date);
CREATE INDEX IF NOT EXISTS idx_challenges_featured ON challenges(featured);
CREATE INDEX IF NOT EXISTS idx_challenges_club_id ON challenges(club_id);
CREATE INDEX IF NOT EXISTS idx_challenges_activity_type ON challenges(activity_type);
CREATE INDEX IF NOT EXISTS idx_challenges_challenge_type ON challenges(challenge_type);

-- Add new fields to challenge_participants table
ALTER TABLE challenge_participants ADD COLUMN IF NOT EXISTS progress_percentage DECIMAL(5,2) DEFAULT 0.00;
ALTER TABLE challenge_participants ADD COLUMN IF NOT EXISTS last_activity_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE challenge_participants ADD COLUMN IF NOT EXISTS rank INTEGER;
ALTER TABLE challenge_participants ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add indexes for challenge_participants
CREATE INDEX IF NOT EXISTS idx_challenge_participants_challenge_id ON challenge_participants(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_user_id ON challenge_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_completed ON challenge_participants(completed);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_rank ON challenge_participants(rank);

-- Create challenge_leaderboard view for easy ranking
CREATE OR REPLACE VIEW challenge_leaderboard AS
SELECT 
    cp.challenge_id,
    cp.user_id,
    p.name as user_name,
    p.avatar_url,
    cp.current_value,
    cp.progress_percentage,
    cp.completed,
    cp.completed_at,
    cp.joined_at,
    RANK() OVER (PARTITION BY cp.challenge_id ORDER BY cp.current_value DESC, cp.completed_at ASC NULLS LAST) as rank
FROM challenge_participants cp
JOIN profiles p ON cp.user_id = p.id
ORDER BY cp.challenge_id, rank;

-- Create challenge_stats view for challenge analytics
CREATE OR REPLACE VIEW challenge_stats AS
SELECT 
    c.id as challenge_id,
    c.title,
    c.start_date,
    c.end_date,
    c.participant_count,
    c.target_value,
    c.unit,
    COUNT(cp.id) as actual_participants,
    COUNT(CASE WHEN cp.completed = true THEN 1 END) as completed_participants,
    ROUND(AVG(cp.current_value), 2) as avg_progress,
    MAX(cp.current_value) as max_progress,
    ROUND(
        (COUNT(CASE WHEN cp.completed = true THEN 1 END)::DECIMAL / NULLIF(COUNT(cp.id), 0)) * 100, 
        2
    ) as completion_rate
FROM challenges c
LEFT JOIN challenge_participants cp ON c.id = cp.challenge_id
GROUP BY c.id, c.title, c.start_date, c.end_date, c.participant_count, c.target_value, c.unit;

-- Function to update challenge participant count
CREATE OR REPLACE FUNCTION update_challenge_participant_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE challenges 
        SET participant_count = participant_count + 1 
        WHERE id = NEW.challenge_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE challenges 
        SET participant_count = participant_count - 1 
        WHERE id = OLD.challenge_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update participant count
DROP TRIGGER IF EXISTS trigger_update_challenge_participant_count ON challenge_participants;
CREATE TRIGGER trigger_update_challenge_participant_count
    AFTER INSERT OR DELETE ON challenge_participants
    FOR EACH ROW EXECUTE FUNCTION update_challenge_participant_count();

-- Function to update progress percentage
CREATE OR REPLACE FUNCTION update_progress_percentage()
RETURNS TRIGGER AS $$
DECLARE
    target_val INTEGER;
BEGIN
    -- Get target value from challenge
    SELECT target_value INTO target_val 
    FROM challenges 
    WHERE id = NEW.challenge_id;
    
    -- Update progress percentage
    NEW.progress_percentage = LEAST(100.0, (NEW.current_value::DECIMAL / target_val) * 100);
    
    -- Check if completed
    IF NEW.current_value >= target_val AND NEW.completed = false THEN
        NEW.completed = true;
        NEW.completed_at = NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update progress percentage
DROP TRIGGER IF EXISTS trigger_update_progress_percentage ON challenge_participants;
CREATE TRIGGER trigger_update_progress_percentage
    BEFORE INSERT OR UPDATE ON challenge_participants
    FOR EACH ROW EXECUTE FUNCTION update_progress_percentage();

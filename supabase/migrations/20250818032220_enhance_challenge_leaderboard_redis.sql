-- Enhance challenge leaderboard for Redis integration
-- This migration improves the challenge_leaderboard view and adds triggers for automatic cache management

-- Update the challenge_leaderboard view to include all necessary fields
DROP VIEW IF EXISTS challenge_leaderboard;
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
    cp.last_activity_date,
    cp.notes,
    RANK() OVER (PARTITION BY cp.challenge_id ORDER BY cp.current_value DESC, cp.completed_at ASC NULLS LAST) as rank
FROM challenge_participants cp
JOIN profiles p ON cp.user_id = p.id
ORDER BY cp.challenge_id, rank;

-- Add index on last_activity_date for better performance
CREATE INDEX IF NOT EXISTS idx_challenge_participants_last_activity_date ON challenge_participants(last_activity_date);

-- Function to handle Redis cache invalidation (placeholder for future webhook integration)
CREATE OR REPLACE FUNCTION invalidate_challenge_leaderboard_cache()
RETURNS TRIGGER AS $$
BEGIN
    -- This function can be extended to call Redis invalidation webhooks
    -- For now, it just logs the change for monitoring
    RAISE LOG 'Challenge leaderboard cache should be invalidated for challenge: %', 
        COALESCE(NEW.challenge_id, OLD.challenge_id);
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to invalidate cache when challenge participants change
DROP TRIGGER IF EXISTS trigger_invalidate_challenge_leaderboard_cache ON challenge_participants;
CREATE TRIGGER trigger_invalidate_challenge_leaderboard_cache
    AFTER INSERT OR UPDATE OR DELETE ON challenge_participants
    FOR EACH ROW EXECUTE FUNCTION invalidate_challenge_leaderboard_cache();

-- Add a function to get challenge leaderboard with proper ranking
CREATE OR REPLACE FUNCTION get_challenge_leaderboard(
    p_challenge_id UUID,
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    challenge_id UUID,
    user_id UUID,
    user_name TEXT,
    avatar_url TEXT,
    current_value INTEGER,
    progress_percentage DECIMAL(5,2),
    completed BOOLEAN,
    completed_at TIMESTAMP WITH TIME ZONE,
    joined_at TIMESTAMP WITH TIME ZONE,
    last_activity_date TIMESTAMP WITH TIME ZONE,
    rank BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cl.challenge_id,
        cl.user_id,
        cl.user_name,
        cl.avatar_url,
        cl.current_value,
        cl.progress_percentage,
        cl.completed,
        cl.completed_at,
        cl.joined_at,
        cl.last_activity_date,
        cl.rank
    FROM challenge_leaderboard cl
    WHERE cl.challenge_id = p_challenge_id
    ORDER BY cl.rank
    LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- Add RLS policy for the function (if needed)
GRANT EXECUTE ON FUNCTION get_challenge_leaderboard TO authenticated;

-- Create an index on challenge_participants for efficient leaderboard queries
CREATE INDEX IF NOT EXISTS idx_challenge_participants_leaderboard 
ON challenge_participants(challenge_id, current_value DESC, completed_at ASC);

-- Comment explaining Redis integration
COMMENT ON FUNCTION invalidate_challenge_leaderboard_cache() IS 
'Trigger function to handle Redis cache invalidation when challenge participant data changes. 
This can be extended to call external webhooks or Redis invalidation endpoints.';

COMMENT ON VIEW challenge_leaderboard IS 
'Enhanced view for challenge leaderboards with proper ranking and all necessary fields for Redis caching.';

COMMENT ON FUNCTION get_challenge_leaderboard IS 
'Function to get paginated challenge leaderboard data with proper ranking and filtering.'; 
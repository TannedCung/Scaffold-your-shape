-- Add missing Strava fields to activities table
DO $$ 
BEGIN
    -- Add columns from Strava API that are missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'achievement_count') THEN
        ALTER TABLE activities ADD COLUMN achievement_count INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'kudos_count') THEN
        ALTER TABLE activities ADD COLUMN kudos_count INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'comment_count') THEN
        ALTER TABLE activities ADD COLUMN comment_count INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'athlete_count') THEN
        ALTER TABLE activities ADD COLUMN athlete_count INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'photo_count') THEN
        ALTER TABLE activities ADD COLUMN photo_count INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'map') THEN
        ALTER TABLE activities ADD COLUMN map JSONB;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'trainer') THEN
        ALTER TABLE activities ADD COLUMN trainer BOOLEAN;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'commute') THEN
        ALTER TABLE activities ADD COLUMN commute BOOLEAN;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'manual') THEN
        ALTER TABLE activities ADD COLUMN manual BOOLEAN;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'private') THEN
        ALTER TABLE activities ADD COLUMN private BOOLEAN;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'flagged') THEN
        ALTER TABLE activities ADD COLUMN flagged BOOLEAN;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'upload_id') THEN
        ALTER TABLE activities ADD COLUMN upload_id TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'has_heartrate') THEN
        ALTER TABLE activities ADD COLUMN has_heartrate BOOLEAN;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'heartrate_opt_out') THEN
        ALTER TABLE activities ADD COLUMN heartrate_opt_out BOOLEAN;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'display_hide_heartrate_option') THEN
        ALTER TABLE activities ADD COLUMN display_hide_heartrate_option BOOLEAN;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'pr_count') THEN
        ALTER TABLE activities ADD COLUMN pr_count INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'total_photo_count') THEN
        ALTER TABLE activities ADD COLUMN total_photo_count INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'has_kudoed') THEN
        ALTER TABLE activities ADD COLUMN has_kudoed BOOLEAN;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'suffer_score') THEN
        ALTER TABLE activities ADD COLUMN suffer_score INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'device_watts') THEN
        ALTER TABLE activities ADD COLUMN device_watts BOOLEAN;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'has_power_meter') THEN
        ALTER TABLE activities ADD COLUMN has_power_meter BOOLEAN;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'strava_gear_id') THEN
        ALTER TABLE activities ADD COLUMN strava_gear_id TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'calories') THEN
        ALTER TABLE activities ADD COLUMN calories DOUBLE PRECISION;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'perceived_exertion') THEN
        ALTER TABLE activities ADD COLUMN perceived_exertion DOUBLE PRECISION;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'prefer_perceived_exertion') THEN
        ALTER TABLE activities ADD COLUMN prefer_perceived_exertion BOOLEAN;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'segment_leaderboard_opt_out') THEN
        ALTER TABLE activities ADD COLUMN segment_leaderboard_opt_out BOOLEAN;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'device_name') THEN
        ALTER TABLE activities ADD COLUMN device_name TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'timezone') THEN
        ALTER TABLE activities ADD COLUMN timezone TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'activity_type') THEN
        ALTER TABLE activities ADD COLUMN activity_type TEXT;
    END IF;
    
    -- Remove the type alterations from this migration - they will be handled in the next one
END $$;

BEGIN
    -- Add columns from Strava API that are missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'achievement_count') THEN
        ALTER TABLE activities ADD COLUMN achievement_count INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'kudos_count') THEN
        ALTER TABLE activities ADD COLUMN kudos_count INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'comment_count') THEN
        ALTER TABLE activities ADD COLUMN comment_count INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'athlete_count') THEN
        ALTER TABLE activities ADD COLUMN athlete_count INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'photo_count') THEN
        ALTER TABLE activities ADD COLUMN photo_count INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'map') THEN
        ALTER TABLE activities ADD COLUMN map JSONB;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'trainer') THEN
        ALTER TABLE activities ADD COLUMN trainer BOOLEAN;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'commute') THEN
        ALTER TABLE activities ADD COLUMN commute BOOLEAN;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'manual') THEN
        ALTER TABLE activities ADD COLUMN manual BOOLEAN;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'private') THEN
        ALTER TABLE activities ADD COLUMN private BOOLEAN;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'flagged') THEN
        ALTER TABLE activities ADD COLUMN flagged BOOLEAN;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'upload_id') THEN
        ALTER TABLE activities ADD COLUMN upload_id TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'has_heartrate') THEN
        ALTER TABLE activities ADD COLUMN has_heartrate BOOLEAN;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'heartrate_opt_out') THEN
        ALTER TABLE activities ADD COLUMN heartrate_opt_out BOOLEAN;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'display_hide_heartrate_option') THEN
        ALTER TABLE activities ADD COLUMN display_hide_heartrate_option BOOLEAN;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'pr_count') THEN
        ALTER TABLE activities ADD COLUMN pr_count INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'total_photo_count') THEN
        ALTER TABLE activities ADD COLUMN total_photo_count INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'has_kudoed') THEN
        ALTER TABLE activities ADD COLUMN has_kudoed BOOLEAN;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'suffer_score') THEN
        ALTER TABLE activities ADD COLUMN suffer_score INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'device_watts') THEN
        ALTER TABLE activities ADD COLUMN device_watts BOOLEAN;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'has_power_meter') THEN
        ALTER TABLE activities ADD COLUMN has_power_meter BOOLEAN;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'strava_gear_id') THEN
        ALTER TABLE activities ADD COLUMN strava_gear_id TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'calories') THEN
        ALTER TABLE activities ADD COLUMN calories DOUBLE PRECISION;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'perceived_exertion') THEN
        ALTER TABLE activities ADD COLUMN perceived_exertion DOUBLE PRECISION;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'prefer_perceived_exertion') THEN
        ALTER TABLE activities ADD COLUMN prefer_perceived_exertion BOOLEAN;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'segment_leaderboard_opt_out') THEN
        ALTER TABLE activities ADD COLUMN segment_leaderboard_opt_out BOOLEAN;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'device_name') THEN
        ALTER TABLE activities ADD COLUMN device_name TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'timezone') THEN
        ALTER TABLE activities ADD COLUMN timezone TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'activity_type') THEN
        ALTER TABLE activities ADD COLUMN activity_type TEXT;
    END IF;
    
    -- Remove the type alterations from this migration - they will be handled in the next one
END $$;

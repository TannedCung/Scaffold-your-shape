-- First check if strava_id column exists, if not add it
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'strava_id') THEN
        ALTER TABLE activities ADD COLUMN strava_id TEXT;
    END IF;
END $$;

-- Add source and url columns to activities table
ALTER TABLE activities 
ADD COLUMN IF NOT EXISTS source TEXT,
ADD COLUMN IF NOT EXISTS url TEXT;

-- Update existing Strava activities with source and url
UPDATE activities
SET 
  source = 'Strava',
  url = 'https://www.strava.com/activities/' || strava_id
WHERE strava_id IS NOT NULL;

-- Set default source for existing activities without a source
UPDATE activities
SET source = 'TannedandMiked'
WHERE source IS NULL; 
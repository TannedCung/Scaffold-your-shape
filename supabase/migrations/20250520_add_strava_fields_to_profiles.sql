-- Add Strava-related fields to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS strava_id TEXT,
ADD COLUMN IF NOT EXISTS strava_access_token TEXT,
ADD COLUMN IF NOT EXISTS strava_refresh_token TEXT,
ADD COLUMN IF NOT EXISTS strava_token_expires_at BIGINT;

-- Add comment explaining the fields
COMMENT ON COLUMN profiles.strava_id IS 'Strava athlete ID';
COMMENT ON COLUMN profiles.strava_access_token IS 'OAuth access token for Strava API';
COMMENT ON COLUMN profiles.strava_refresh_token IS 'OAuth refresh token for Strava API';
COMMENT ON COLUMN profiles.strava_token_expires_at IS 'Expiration timestamp for Strava access token (Unix timestamp)'; 
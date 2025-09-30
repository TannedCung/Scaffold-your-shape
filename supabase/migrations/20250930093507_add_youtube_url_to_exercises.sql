-- Add YouTube tutorial URL to exercises table
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS youtube_url text;

-- Add comment explaining the field
COMMENT ON COLUMN exercises.youtube_url IS 'YouTube video URL for exercise tutorial and demonstration';

-- Update some existing exercises with example YouTube tutorial links
UPDATE exercises SET youtube_url = 'https://www.youtube.com/watch?v=IB0ssNXUB4g' WHERE slug = 'treadmill-running';
UPDATE exercises SET youtube_url = 'https://www.youtube.com/watch?v=1rcr4a36tV0' WHERE slug = 'stationary-bike-cycling';
UPDATE exercises SET youtube_url = 'https://www.youtube.com/watch?v=4q1l40S8Zqo' WHERE slug = 'rowing-machine';
UPDATE exercises SET youtube_url = 'https://www.youtube.com/watch?v=ultWZbUMPL8' WHERE slug = 'barbell-squats';
UPDATE exercises SET youtube_url = 'https://www.youtube.com/watch?v=rT7DgCr-3pg' WHERE slug = 'bench-press';
UPDATE exercises SET youtube_url = 'https://www.youtube.com/watch?v=op9kVnSso6Q' WHERE slug = 'deadlifts';

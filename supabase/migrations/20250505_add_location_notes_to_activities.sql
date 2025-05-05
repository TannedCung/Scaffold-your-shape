-- Add location and notes columns to activities table
ALTER TABLE activities 
ADD COLUMN IF NOT EXISTS location text,
ADD COLUMN IF NOT EXISTS notes text; 
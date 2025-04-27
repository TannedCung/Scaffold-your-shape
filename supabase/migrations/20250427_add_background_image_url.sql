-- Add background_image_url to clubs and challenges tables
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS background_image_url TEXT;
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS background_image_url TEXT;

-- Migration: Fix numeric types for Strava activities
-- Description: Change integer columns to double precision to handle decimal values from Strava API

-- Convert integer columns to double precision
ALTER TABLE activities
  ALTER COLUMN moving_time TYPE DOUBLE PRECISION USING moving_time::DOUBLE PRECISION,
  ALTER COLUMN elapsed_time TYPE DOUBLE PRECISION USING elapsed_time::DOUBLE PRECISION,
  ALTER COLUMN total_elevation_gain TYPE DOUBLE PRECISION USING total_elevation_gain::DOUBLE PRECISION,
  ALTER COLUMN average_cadence TYPE DOUBLE PRECISION USING average_cadence::DOUBLE PRECISION,
  ALTER COLUMN average_temp TYPE DOUBLE PRECISION USING average_temp::DOUBLE PRECISION,
  ALTER COLUMN average_watts TYPE DOUBLE PRECISION USING average_watts::DOUBLE PRECISION,
  ALTER COLUMN max_watts TYPE DOUBLE PRECISION USING max_watts::DOUBLE PRECISION,
  ALTER COLUMN workout_type TYPE DOUBLE PRECISION USING workout_type::DOUBLE PRECISION;

-- Also fix segmentations table
ALTER TABLE segmentations
  ALTER COLUMN elapsed_time TYPE DOUBLE PRECISION USING elapsed_time::DOUBLE PRECISION,
  ALTER COLUMN moving_time TYPE DOUBLE PRECISION USING moving_time::DOUBLE PRECISION,
  ALTER COLUMN average_cadence TYPE DOUBLE PRECISION USING average_cadence::DOUBLE PRECISION,
  ALTER COLUMN average_watts TYPE DOUBLE PRECISION USING average_watts::DOUBLE PRECISION; 
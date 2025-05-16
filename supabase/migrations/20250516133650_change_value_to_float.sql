-- Change the value column in activities table to double precision (float)
ALTER TABLE activities ALTER COLUMN value TYPE DOUBLE PRECISION USING value::DOUBLE PRECISION;

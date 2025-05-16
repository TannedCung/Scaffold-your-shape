-- Fix migration error by adding missing columns before altering types
DO $$ 
BEGIN
    -- First add any potentially missing numeric columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'weighted_average_watts') THEN
        ALTER TABLE activities ADD COLUMN weighted_average_watts DOUBLE PRECISION;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'kilojoules') THEN
        ALTER TABLE activities ADD COLUMN kilojoules DOUBLE PRECISION;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'average_heartrate') THEN
        ALTER TABLE activities ADD COLUMN average_heartrate DOUBLE PRECISION;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'max_heartrate') THEN
        ALTER TABLE activities ADD COLUMN max_heartrate DOUBLE PRECISION;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'elev_high') THEN
        ALTER TABLE activities ADD COLUMN elev_high DOUBLE PRECISION;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'elev_low') THEN
        ALTER TABLE activities ADD COLUMN elev_low DOUBLE PRECISION;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'max_watts') THEN
        ALTER TABLE activities ADD COLUMN max_watts DOUBLE PRECISION;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'average_watts') THEN
        ALTER TABLE activities ADD COLUMN average_watts DOUBLE PRECISION;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'average_cadence') THEN
        ALTER TABLE activities ADD COLUMN average_cadence DOUBLE PRECISION;
    END IF;
    
    -- Now safely alter any existing numeric columns
    -- This is safer as we'll only attempt to alter columns that exist
    BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'distance') THEN
            ALTER TABLE activities ALTER COLUMN distance TYPE DOUBLE PRECISION USING distance::DOUBLE PRECISION;
        END IF;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Error altering distance column: %', SQLERRM;
    END;
    
    BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'moving_time') THEN
            ALTER TABLE activities ALTER COLUMN moving_time TYPE DOUBLE PRECISION USING moving_time::DOUBLE PRECISION;
        END IF;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Error altering moving_time column: %', SQLERRM;
    END;
    
    BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'elapsed_time') THEN
            ALTER TABLE activities ALTER COLUMN elapsed_time TYPE DOUBLE PRECISION USING elapsed_time::DOUBLE PRECISION;
        END IF;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Error altering elapsed_time column: %', SQLERRM;
    END;
    
    BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'total_elevation_gain') THEN
            ALTER TABLE activities ALTER COLUMN total_elevation_gain TYPE DOUBLE PRECISION USING total_elevation_gain::DOUBLE PRECISION;
        END IF;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Error altering total_elevation_gain column: %', SQLERRM;
    END;
    
    BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'average_speed') THEN
            ALTER TABLE activities ALTER COLUMN average_speed TYPE DOUBLE PRECISION USING average_speed::DOUBLE PRECISION;
        END IF;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Error altering average_speed column: %', SQLERRM;
    END;
    
    BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'max_speed') THEN
            ALTER TABLE activities ALTER COLUMN max_speed TYPE DOUBLE PRECISION USING max_speed::DOUBLE PRECISION;
        END IF;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Error altering max_speed column: %', SQLERRM;
    END;
    
    -- Update segmentations table columns only if they exist
    BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'segmentations' AND column_name = 'distance') THEN
            ALTER TABLE segmentations ALTER COLUMN distance TYPE DOUBLE PRECISION USING distance::DOUBLE PRECISION;
        END IF;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Error altering segmentations.distance column: %', SQLERRM;
    END;
    
    BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'segmentations' AND column_name = 'moving_time') THEN
            ALTER TABLE segmentations ALTER COLUMN moving_time TYPE DOUBLE PRECISION USING moving_time::DOUBLE PRECISION;
        END IF;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Error altering segmentations.moving_time column: %', SQLERRM;
    END;
    
    BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'segmentations' AND column_name = 'elapsed_time') THEN
            ALTER TABLE segmentations ALTER COLUMN elapsed_time TYPE DOUBLE PRECISION USING elapsed_time::DOUBLE PRECISION;
        END IF;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Error altering segmentations.elapsed_time column: %', SQLERRM;
    END;
    
    BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'segmentations' AND column_name = 'average_cadence') THEN
            ALTER TABLE segmentations ALTER COLUMN average_cadence TYPE DOUBLE PRECISION USING average_cadence::DOUBLE PRECISION;
        END IF;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Error altering segmentations.average_cadence column: %', SQLERRM;
    END;
    
    BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'segmentations' AND column_name = 'average_watts') THEN
            ALTER TABLE segmentations ALTER COLUMN average_watts TYPE DOUBLE PRECISION USING average_watts::DOUBLE PRECISION;
        END IF;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Error altering segmentations.average_watts column: %', SQLERRM;
    END;
    
END $$;
DO $$ 
BEGIN
    -- First add any potentially missing numeric columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'weighted_average_watts') THEN
        ALTER TABLE activities ADD COLUMN weighted_average_watts DOUBLE PRECISION;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'kilojoules') THEN
        ALTER TABLE activities ADD COLUMN kilojoules DOUBLE PRECISION;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'average_heartrate') THEN
        ALTER TABLE activities ADD COLUMN average_heartrate DOUBLE PRECISION;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'max_heartrate') THEN
        ALTER TABLE activities ADD COLUMN max_heartrate DOUBLE PRECISION;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'elev_high') THEN
        ALTER TABLE activities ADD COLUMN elev_high DOUBLE PRECISION;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'elev_low') THEN
        ALTER TABLE activities ADD COLUMN elev_low DOUBLE PRECISION;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'max_watts') THEN
        ALTER TABLE activities ADD COLUMN max_watts DOUBLE PRECISION;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'average_watts') THEN
        ALTER TABLE activities ADD COLUMN average_watts DOUBLE PRECISION;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'average_cadence') THEN
        ALTER TABLE activities ADD COLUMN average_cadence DOUBLE PRECISION;
    END IF;
    
    -- Now safely alter any existing numeric columns
    -- This is safer as we'll only attempt to alter columns that exist
    BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'distance') THEN
            ALTER TABLE activities ALTER COLUMN distance TYPE DOUBLE PRECISION USING distance::DOUBLE PRECISION;
        END IF;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Error altering distance column: %', SQLERRM;
    END;
    
    BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'moving_time') THEN
            ALTER TABLE activities ALTER COLUMN moving_time TYPE DOUBLE PRECISION USING moving_time::DOUBLE PRECISION;
        END IF;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Error altering moving_time column: %', SQLERRM;
    END;
    
    BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'elapsed_time') THEN
            ALTER TABLE activities ALTER COLUMN elapsed_time TYPE DOUBLE PRECISION USING elapsed_time::DOUBLE PRECISION;
        END IF;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Error altering elapsed_time column: %', SQLERRM;
    END;
    
    BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'total_elevation_gain') THEN
            ALTER TABLE activities ALTER COLUMN total_elevation_gain TYPE DOUBLE PRECISION USING total_elevation_gain::DOUBLE PRECISION;
        END IF;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Error altering total_elevation_gain column: %', SQLERRM;
    END;
    
    BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'average_speed') THEN
            ALTER TABLE activities ALTER COLUMN average_speed TYPE DOUBLE PRECISION USING average_speed::DOUBLE PRECISION;
        END IF;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Error altering average_speed column: %', SQLERRM;
    END;
    
    BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'max_speed') THEN
            ALTER TABLE activities ALTER COLUMN max_speed TYPE DOUBLE PRECISION USING max_speed::DOUBLE PRECISION;
        END IF;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Error altering max_speed column: %', SQLERRM;
    END;
    
    -- Update segmentations table columns only if they exist
    BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'segmentations' AND column_name = 'distance') THEN
            ALTER TABLE segmentations ALTER COLUMN distance TYPE DOUBLE PRECISION USING distance::DOUBLE PRECISION;
        END IF;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Error altering segmentations.distance column: %', SQLERRM;
    END;
    
    BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'segmentations' AND column_name = 'moving_time') THEN
            ALTER TABLE segmentations ALTER COLUMN moving_time TYPE DOUBLE PRECISION USING moving_time::DOUBLE PRECISION;
        END IF;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Error altering segmentations.moving_time column: %', SQLERRM;
    END;
    
    BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'segmentations' AND column_name = 'elapsed_time') THEN
            ALTER TABLE segmentations ALTER COLUMN elapsed_time TYPE DOUBLE PRECISION USING elapsed_time::DOUBLE PRECISION;
        END IF;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Error altering segmentations.elapsed_time column: %', SQLERRM;
    END;
    
    BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'segmentations' AND column_name = 'average_cadence') THEN
            ALTER TABLE segmentations ALTER COLUMN average_cadence TYPE DOUBLE PRECISION USING average_cadence::DOUBLE PRECISION;
        END IF;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Error altering segmentations.average_cadence column: %', SQLERRM;
    END;
    
    BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'segmentations' AND column_name = 'average_watts') THEN
            ALTER TABLE segmentations ALTER COLUMN average_watts TYPE DOUBLE PRECISION USING average_watts::DOUBLE PRECISION;
        END IF;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Error altering segmentations.average_watts column: %', SQLERRM;
    END;
    
END $$;

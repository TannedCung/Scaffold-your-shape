-- Update exercises table to use detailed muscle anatomy

-- Add comment explaining the detailed muscle group structure
COMMENT ON COLUMN exercises.muscle_groups IS 'Detailed muscle groups targeted by this exercise. Uses specific muscle heads and sections for precise targeting.';

-- Update existing exercises with more detailed muscle groups

-- Cardio exercises
UPDATE exercises SET muscle_groups = ARRAY['quadriceps', 'hamstrings', 'glutes', 'calves', 'cardiovascular'] WHERE slug = 'treadmill-running';
UPDATE exercises SET muscle_groups = ARRAY['quadriceps', 'glutes', 'calves', 'cardiovascular'] WHERE slug = 'stationary-bike-cycling';
UPDATE exercises SET muscle_groups = ARRAY['lats', 'upper-back', 'quadriceps', 'hamstrings', 'glutes', 'arms', 'core', 'cardiovascular'] WHERE slug = 'rowing-machine';

-- Strength - Squats (Quads, Glutes, Hamstrings, Core)
UPDATE exercises SET muscle_groups = ARRAY['rectus-femoris', 'vastus-lateralis', 'vastus-medialis', 'vastus-intermedius', 'gluteus-maximus', 'gluteus-medius', 'hamstrings', 'core'] WHERE slug = 'barbell-squats';
UPDATE exercises SET muscle_groups = ARRAY['rectus-femoris', 'vastus-lateralis', 'vastus-medialis', 'gluteus-maximus', 'core'] WHERE slug = 'dumbbell-squats';
UPDATE exercises SET muscle_groups = ARRAY['rectus-femoris', 'vastus-lateralis', 'vastus-medialis', 'gluteus-maximus', 'core'] WHERE slug = 'goblet-squats';

-- Strength - Bench Press (Chest, Triceps, Shoulders)
UPDATE exercises SET muscle_groups = ARRAY['mid-chest', 'anterior-deltoid', 'triceps-lateral-head', 'triceps-medial-head'] WHERE slug = 'bench-press';
UPDATE exercises SET muscle_groups = ARRAY['upper-chest', 'anterior-deltoid', 'triceps-lateral-head'] WHERE slug = 'incline-dumbbell-press';

-- Strength - Deadlifts (Back, Glutes, Hamstrings, Core)
UPDATE exercises SET muscle_groups = ARRAY['erector-spinae', 'lats', 'trapezius', 'gluteus-maximus', 'biceps-femoris', 'semitendinosus', 'semimembranosus', 'core', 'forearms'] WHERE slug = 'deadlifts';
UPDATE exercises SET muscle_groups = ARRAY['gluteus-maximus', 'biceps-femoris', 'semitendinosus', 'semimembranosus', 'erector-spinae'] WHERE slug = 'romanian-deadlift';

-- Flexibility exercises
UPDATE exercises SET muscle_groups = ARRAY['biceps-femoris', 'semitendinosus', 'semimembranosus', 'erector-spinae'] WHERE slug = 'standing-hamstring-stretch';
UPDATE exercises SET muscle_groups = ARRAY['hip-flexors', 'rectus-femoris', 'core'] WHERE slug = 'hip-flexor-stretch';
UPDATE exercises SET muscle_groups = ARRAY['erector-spinae', 'lats', 'core'] WHERE slug = 'cat-cow-stretch';
UPDATE exercises SET muscle_groups = ARRAY['anterior-deltoid', 'lateral-deltoid', 'posterior-deltoid', 'upper-back'] WHERE slug = 'shoulder-mobility-flow';
UPDATE exercises SET muscle_groups = ARRAY['erector-spinae', 'lats', 'trapezius', 'core'] WHERE slug = 'childs-pose';
UPDATE exercises SET muscle_groups = ARRAY['upper-chest', 'mid-chest', 'anterior-deltoid'] WHERE slug = 'doorway-chest-stretch';
UPDATE exercises SET muscle_groups = ARRAY['gastrocnemius', 'soleus'] WHERE slug = 'ankle-mobility-drill';
UPDATE exercises SET muscle_groups = ARRAY['quadriceps', 'hamstrings', 'glutes', 'calves', 'back', 'arms'] WHERE slug = 'foam-rolling-session';

-- Add comment with muscle group reference
COMMENT ON TABLE exercises IS 'Exercise library with detailed muscle group targeting.

Muscle Groups Reference:
- Chest: upper-chest, mid-chest, lower-chest, serratus-anterior
- Back: trapezius, rhomboids, lats, erector-spinae, teres-major, teres-minor
- Shoulders: anterior-deltoid, lateral-deltoid, posterior-deltoid
- Arms: biceps-long-head, biceps-short-head, brachialis, triceps-long-head, triceps-lateral-head, triceps-medial-head
- Forearms: forearm-flexors, forearm-extensors
- Core: rectus-abdominis, obliques, transverse-abdominis, serratus-anterior
- Legs: rectus-femoris, vastus-lateralis, vastus-medialis, vastus-intermedius
- Hamstrings: biceps-femoris, semitendinosus, semimembranosus
- Glutes: gluteus-maximus, gluteus-medius, gluteus-minimus
- Calves: gastrocnemius, soleus
- General: cardiovascular, hip-flexors, full-body
';

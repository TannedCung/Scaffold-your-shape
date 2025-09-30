-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop old exercises table if it exists with wrong structure
DROP TABLE IF EXISTS exercises CASCADE;

-- Create exercises table for workout guides
CREATE TABLE exercises (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  type text NOT NULL CHECK (type IN ('cardio', 'strength', 'flexibility')),
  category text NOT NULL, -- e.g., 'treadmill', 'cycling', 'rowing', 'squats', 'bench_press', 'deadlifts', 'stretching', 'mobility'
  difficulty text NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  muscle_groups text[] NOT NULL DEFAULT '{}',
  equipment_required text[] NOT NULL DEFAULT '{}',
  description text,
  instructions text[] NOT NULL DEFAULT '{}', -- Step-by-step instructions
  benefits text[] DEFAULT '{}',
  tips text[] DEFAULT '{}',
  common_mistakes text[] DEFAULT '{}',
  variations text[] DEFAULT '{}',
  
  -- Image and media
  image_url text, -- Main demonstration image stored in R2
  video_url text, -- Optional video URL
  animation_url text, -- Optional GIF animation URL stored in R2
  
  -- Metrics
  default_sets integer,
  default_reps integer,
  default_duration integer, -- in seconds for cardio/flexibility
  calories_per_minute numeric(5,2), -- estimated calories burned per minute
  
  -- Additional info
  is_featured boolean DEFAULT false,
  is_published boolean DEFAULT true,
  view_count integer DEFAULT 0,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_exercises_type ON exercises(type);
CREATE INDEX IF NOT EXISTS idx_exercises_category ON exercises(category);
CREATE INDEX IF NOT EXISTS idx_exercises_difficulty ON exercises(difficulty);
CREATE INDEX IF NOT EXISTS idx_exercises_featured ON exercises(is_featured);
CREATE INDEX IF NOT EXISTS idx_exercises_slug ON exercises(slug);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_exercises_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER exercises_updated_at_trigger
  BEFORE UPDATE ON exercises
  FOR EACH ROW
  EXECUTE FUNCTION update_exercises_updated_at();

-- Insert seed data for common exercises

-- CARDIO EXERCISES
INSERT INTO exercises (name, slug, type, category, difficulty, muscle_groups, equipment_required, description, instructions, benefits, tips, common_mistakes, default_duration, calories_per_minute, is_featured) VALUES
('Treadmill Running', 'treadmill-running', 'cardio', 'treadmill', 'beginner', ARRAY['legs', 'cardiovascular'], ARRAY['treadmill'], 'A fundamental cardio exercise performed on a treadmill, perfect for building endurance and burning calories.', 
ARRAY[
  'Step onto the treadmill and place feet on the side rails',
  'Start the machine at a slow walking pace (2-3 mph)',
  'Gradually increase speed to desired running pace (5-8 mph)',
  'Maintain upright posture with core engaged',
  'Keep arms bent at 90 degrees and swing naturally',
  'Land mid-foot and roll through to push off',
  'Gradually decrease speed to cool down before stopping'
],
ARRAY['Improves cardiovascular health', 'Burns calories effectively', 'Low impact on joints compared to outdoor running', 'Convenient for all weather conditions', 'Easy to track distance and pace'],
ARRAY['Start with a 5-minute warm-up at walking pace', 'Keep your gaze forward, not down at the belt', 'Stay in the center of the treadmill', 'Use the handrails only for balance, not support', 'Increase incline for added challenge'],
ARRAY['Holding onto handrails throughout the run', 'Looking down at feet', 'Overstriding', 'Starting too fast without warm-up', 'Poor posture with forward lean'],
30, 10.5, true),

('Stationary Bike Cycling', 'stationary-bike-cycling', 'cardio', 'cycling', 'beginner', ARRAY['legs', 'glutes', 'cardiovascular'], ARRAY['stationary bike'], 'Low-impact cardio workout that strengthens leg muscles while improving cardiovascular endurance.',
ARRAY[
  'Adjust seat height so knee is slightly bent at bottom of pedal stroke',
  'Position seat forward/back so knee is over pedal axle when parallel to ground',
  'Start pedaling at low resistance',
  'Gradually increase resistance and maintain 70-90 RPM',
  'Keep core engaged and back straight',
  'Pedal in smooth, circular motion',
  'Cool down with low resistance for 5 minutes'
],
ARRAY['Low impact on joints', 'Builds leg strength and endurance', 'Excellent calorie burner', 'Improves cardiovascular fitness', 'Can be done while reading or watching TV'],
ARRAY['Adjust bike properly before starting', 'Keep shoulders relaxed', 'Drink water throughout the workout', 'Vary resistance levels for interval training', 'Focus on smooth pedal strokes'],
ARRAY['Seat too high or low', 'Pedaling only with toes', 'Hunching shoulders', 'Gripping handlebars too tightly', 'Using momentum instead of resistance'],
30, 8.5, true),

('Rowing Machine', 'rowing-machine', 'cardio', 'rowing', 'intermediate', ARRAY['back', 'legs', 'arms', 'core', 'cardiovascular'], ARRAY['rowing machine'], 'Full-body cardio workout that engages 85% of muscles while building power and endurance.',
ARRAY[
  'Secure feet in straps with straps over ball of feet',
  'Sit with shins vertical, arms extended, core engaged',
  'Push with legs first, keeping arms straight',
  'Lean back slightly when legs are extended',
  'Pull handle to lower ribs with elbows close to body',
  'Extend arms first on recovery, then lean forward, then bend knees',
  'Maintain smooth, controlled rhythm'
],
ARRAY['Works 85% of body muscles', 'Low impact on joints', 'Excellent cardiovascular workout', 'Builds strength and endurance', 'Burns high calories in short time'],
ARRAY['Sequence: Legs-Core-Arms on drive, Arms-Core-Legs on recovery', 'Keep wrists flat, not bent', 'Drive through heels', 'Aim for 1:2 work-to-rest ratio (fast drive, slow recovery)', 'Maintain 20-30 strokes per minute'],
ARRAY['Pulling with arms first', 'Bending knees too early on recovery', 'Hunching back', 'Gripping handle too tightly', 'Rushing the recovery phase'],
30, 12.5, true);

-- STRENGTH TRAINING EXERCISES
INSERT INTO exercises (name, slug, type, category, difficulty, muscle_groups, equipment_required, description, instructions, benefits, tips, common_mistakes, default_sets, default_reps, calories_per_minute, is_featured) VALUES
('Barbell Squats', 'barbell-squats', 'strength', 'squats', 'intermediate', ARRAY['quadriceps', 'glutes', 'hamstrings', 'core'], ARRAY['barbell', 'squat rack'], 'The king of leg exercises that builds lower body strength and power.',
ARRAY[
  'Position barbell on upper back (not neck)',
  'Grip bar slightly wider than shoulders',
  'Step back from rack with feet shoulder-width apart',
  'Point toes slightly outward',
  'Brace core and keep chest up',
  'Lower by bending knees and hips, keeping knees tracking over toes',
  'Descend until thighs are parallel to ground or below',
  'Drive through heels to return to starting position',
  'Keep spine neutral throughout movement'
],
ARRAY['Builds overall lower body strength', 'Increases muscle mass', 'Improves core stability', 'Boosts metabolism', 'Enhances athletic performance', 'Strengthens bones'],
ARRAY['Keep weight on heels', 'Track knees over toes', 'Take deep breath before descent', 'Look slightly upward', 'Start light and focus on form'],
ARRAY['Knees caving inward', 'Heels lifting off ground', 'Rounding lower back', 'Not going deep enough', 'Bar too high on neck', 'Looking down'],
3, 8, 5.5, true),

('Bench Press', 'bench-press', 'strength', 'bench_press', 'intermediate', ARRAY['chest', 'shoulders', 'triceps'], ARRAY['barbell', 'bench'], 'Essential upper body compound exercise that builds chest, shoulders, and arm strength.',
ARRAY[
  'Lie on bench with eyes under barbell',
  'Plant feet firmly on ground',
  'Grip bar slightly wider than shoulder width',
  'Unrack bar and position over chest',
  'Lower bar to mid-chest with control',
  'Keep elbows at 45-degree angle to body',
  'Press bar up and slightly back to starting position',
  'Keep shoulder blades retracted throughout',
  'Maintain arch in lower back'
],
ARRAY['Builds upper body strength', 'Develops chest muscles', 'Improves pushing power', 'Strengthens stabilizer muscles', 'Increases bone density'],
ARRAY['Keep shoulder blades pinched together', 'Maintain natural arch in back', 'Drive through feet', 'Control the descent', 'Touch chest lightly, do not bounce'],
ARRAY['Flaring elbows out too much', 'Bouncing bar off chest', 'Lifting hips off bench', 'Uneven bar path', 'Not using full range of motion'],
3, 8, 5.0, true),

('Deadlifts', 'deadlifts', 'strength', 'deadlifts', 'advanced', ARRAY['back', 'glutes', 'hamstrings', 'core', 'forearms'], ARRAY['barbell', 'weight plates'], 'The ultimate full-body strength exercise that builds total body power.',
ARRAY[
  'Stand with feet hip-width apart, bar over mid-foot',
  'Bend down and grip bar just outside legs',
  'Lower hips, chest up, shoulders over bar',
  'Take deep breath and brace core',
  'Pull slack out of bar',
  'Drive through heels, extending hips and knees',
  'Keep bar close to body throughout lift',
  'Stand tall at top, squeeze glutes',
  'Lower bar by pushing hips back, then bending knees'
],
ARRAY['Builds total body strength', 'Develops posterior chain', 'Improves posture', 'Increases functional strength', 'Burns high calories', 'Boosts testosterone naturally'],
ARRAY['Bar should travel in straight line', 'Keep shins vertical', 'Lead with chest, not hips', 'Maintain neutral spine', 'Use mixed or hook grip for heavy weights'],
ARRAY['Rounding back', 'Bar drifting away from body', 'Pulling with arms', 'Looking up', 'Starting with hips too high or low', 'Hyperextending at top'],
3, 5, 6.0, true);

-- FLEXIBILITY EXERCISES
INSERT INTO exercises (name, slug, type, category, difficulty, muscle_groups, equipment_required, description, instructions, benefits, tips, common_mistakes, default_sets, default_duration, calories_per_minute, is_featured) VALUES
('Standing Hamstring Stretch', 'standing-hamstring-stretch', 'flexibility', 'stretching', 'beginner', ARRAY['hamstrings', 'lower back'], ARRAY[]::text[], 'Essential stretch for improving hamstring flexibility and reducing lower back tension.',
ARRAY[
  'Stand with feet hip-width apart',
  'Extend one leg forward with heel on ground, toes pointing up',
  'Keep back leg slightly bent',
  'Hinge forward at hips, keeping back straight',
  'Reach hands toward extended foot',
  'Feel stretch in back of thigh',
  'Hold for 30 seconds',
  'Switch legs and repeat'
],
ARRAY['Improves hamstring flexibility', 'Reduces lower back pain', 'Enhances range of motion', 'Prevents injury', 'Improves posture'],
ARRAY['Keep back straight, not rounded', 'Breathe deeply and relax into stretch', 'Do not bounce', 'Stop if you feel pain', 'Perform after workout when muscles are warm'],
ARRAY['Rounding the back', 'Bouncing to go deeper', 'Locking the knees', 'Holding breath', 'Overstretching'],
1, 30, 2.5, true),

('Hip Flexor Stretch', 'hip-flexor-stretch', 'flexibility', 'mobility', 'beginner', ARRAY['hip flexors', 'quadriceps'], ARRAY['mat (optional)'], 'Important stretch for people who sit for long periods, targeting hip flexors and improving mobility.',
ARRAY[
  'Start in kneeling lunge position',
  'Place one knee on ground, other foot forward with knee at 90 degrees',
  'Keep torso upright and core engaged',
  'Gently press hips forward',
  'Raise arm on same side as back knee overhead',
  'Feel stretch in front of hip and thigh',
  'Hold for 30 seconds',
  'Switch sides and repeat'
],
ARRAY['Opens tight hip flexors', 'Improves posture', 'Reduces lower back pain', 'Enhances mobility', 'Counteracts effects of prolonged sitting'],
ARRAY['Keep core engaged to protect lower back', 'Do not arch lower back excessively', 'Press hips forward, not down', 'Use pad under knee for comfort', 'Breathe deeply throughout'],
ARRAY['Arching lower back too much', 'Leaning to the side', 'Not engaging core', 'Putting weight on back knee', 'Holding breath'],
1, 30, 2.5, true),

('Cat-Cow Stretch', 'cat-cow-stretch', 'flexibility', 'mobility', 'beginner', ARRAY['spine', 'core', 'back'], ARRAY['mat'], 'Dynamic spinal mobility exercise that improves flexibility and reduces back stiffness.',
ARRAY[
  'Start on hands and knees in tabletop position',
  'Align wrists under shoulders, knees under hips',
  'Cow: Inhale, drop belly, lift chest and tailbone, look up',
  'Hold for 2-3 seconds',
  'Cat: Exhale, round spine, tuck chin to chest, tuck tailbone',
  'Hold for 2-3 seconds',
  'Continue flowing between positions',
  'Repeat for 10-15 cycles'
],
ARRAY['Increases spinal flexibility', 'Improves posture', 'Relieves back tension', 'Warms up spine', 'Reduces stress', 'Coordinates breath with movement'],
ARRAY['Move slowly and mindfully', 'Coordinate with breath', 'Engage core throughout', 'Keep arms straight', 'Move entire spine, not just lower back'],
ARRAY['Moving too quickly', 'Not breathing properly', 'Only moving lower back', 'Hyperextending neck', 'Locking elbows'],
1, 60, 3.0, true),

('Shoulder Mobility Flow', 'shoulder-mobility-flow', 'flexibility', 'mobility', 'intermediate', ARRAY['shoulders', 'upper back'], ARRAY['resistance band (optional)'], 'Comprehensive shoulder mobility routine that improves range of motion and prevents injury.',
ARRAY[
  'Stand with feet shoulder-width apart',
  'Arm Circles: Extend arms out, make small circles forward for 10 reps',
  'Make circles backward for 10 reps',
  'Shoulder Rolls: Roll shoulders forward 5 times',
  'Roll shoulders backward 5 times',
  'Wall Slides: Stand against wall, slide arms up and down',
  'Band Pull-Aparts: Hold band at chest height, pull apart',
  'Repeat full sequence 2-3 times'
],
ARRAY['Improves shoulder mobility', 'Reduces shoulder pain', 'Prevents rotator cuff injuries', 'Enhances overhead movement', 'Improves posture'],
ARRAY['Keep movements controlled', 'Gradually increase range of motion', 'Focus on areas that feel tight', 'Breathe naturally', 'Can be done daily'],
ARRAY['Moving too fast', 'Forcing painful ranges', 'Shrugging shoulders', 'Not engaging core', 'Holding breath'],
1, 120, 3.5, true);

-- Add more exercises for variety
INSERT INTO exercises (name, slug, type, category, difficulty, muscle_groups, equipment_required, description, instructions, benefits, default_sets, default_reps, default_duration, calories_per_minute) VALUES
('Dumbbell Squats', 'dumbbell-squats', 'strength', 'squats', 'beginner', ARRAY['quadriceps', 'glutes', 'hamstrings'], ARRAY['dumbbells'], 'Beginner-friendly squat variation using dumbbells for resistance.',
ARRAY[
  'Hold dumbbells at sides with arms straight',
  'Stand with feet shoulder-width apart',
  'Keep chest up and core engaged',
  'Lower by bending knees and hips',
  'Go down until thighs parallel to ground',
  'Drive through heels to stand up',
  'Keep dumbbells by sides throughout'
],
ARRAY['Builds leg strength', 'Easier to learn than barbell squats', 'Improves balance', 'Develops core stability'],
3, 12, null, 5.0),

('Goblet Squats', 'goblet-squats', 'strength', 'squats', 'beginner', ARRAY['quadriceps', 'glutes', 'core'], ARRAY['dumbbell', 'kettlebell'], 'Excellent squat variation for learning proper squat form while building leg strength.',
ARRAY[
  'Hold dumbbell or kettlebell at chest height',
  'Cup weight with both hands at bottom',
  'Stand with feet slightly wider than shoulders',
  'Point toes slightly outward',
  'Squat down keeping chest up and elbows inside knees',
  'Go as deep as mobility allows',
  'Drive through heels to stand',
  'Keep weight close to chest throughout'
],
ARRAY['Teaches proper squat mechanics', 'Builds leg and core strength', 'Improves mobility', 'Safe for beginners', 'Easy to perform'],
3, 12, null, 5.0),

('Incline Dumbbell Press', 'incline-dumbbell-press', 'strength', 'bench_press', 'intermediate', ARRAY['upper chest', 'shoulders', 'triceps'], ARRAY['dumbbells', 'incline bench'], 'Targets upper chest muscles for balanced chest development.',
ARRAY[
  'Set bench to 30-45 degree incline',
  'Sit with dumbbells resting on thighs',
  'Lie back and position dumbbells at chest level',
  'Press dumbbells up until arms extended',
  'Keep slight bend in elbows at top',
  'Lower with control to starting position',
  'Maintain stability throughout movement'
],
ARRAY['Develops upper chest', 'Improves shoulder stability', 'Builds pressing strength', 'Reduces shoulder strain compared to flat bench'],
3, 10, null, 5.0),

('Romanian Deadlift', 'romanian-deadlift', 'strength', 'deadlifts', 'intermediate', ARRAY['hamstrings', 'glutes', 'lower back'], ARRAY['barbell', 'dumbbells'], 'Variation that emphasizes hamstrings and glutes with reduced lower back involvement.',
ARRAY[
  'Hold barbell with overhand grip at hip height',
  'Stand with feet hip-width apart',
  'Keep knees slightly bent (soft knees)',
  'Push hips back while lowering bar down shins',
  'Keep back straight and bar close to legs',
  'Lower until feel stretch in hamstrings',
  'Drive hips forward to return to standing',
  'Squeeze glutes at top'
],
ARRAY['Targets hamstrings and glutes', 'Improves hip hinge pattern', 'Builds posterior chain', 'Enhances flexibility', 'Safer for back than conventional deadlifts'],
3, 8, null, 5.5),

('Childs Pose', 'childs-pose', 'flexibility', 'stretching', 'beginner', ARRAY['back', 'hips', 'shoulders'], ARRAY['mat'], 'Restorative yoga pose that stretches the back and promotes relaxation.',
ARRAY[
  'Start on hands and knees',
  'Sit hips back toward heels',
  'Extend arms forward on mat',
  'Rest forehead on ground',
  'Breathe deeply and relax',
  'Hold for 30-60 seconds',
  'Can widen knees for deeper stretch'
],
ARRAY['Stretches back muscles', 'Relieves stress', 'Promotes relaxation', 'Gentle hip stretch', 'Calming for nervous system'],
1, null, 60, 2.0),

('Doorway Chest Stretch', 'doorway-chest-stretch', 'flexibility', 'stretching', 'beginner', ARRAY['chest', 'shoulders'], ARRAY['doorway'], 'Simple yet effective stretch for opening tight chest muscles.',
ARRAY[
  'Stand in doorway',
  'Place forearm on door frame at shoulder height',
  'Elbow should be bent at 90 degrees',
  'Step forward with same-side leg',
  'Lean gently forward until feel stretch in chest',
  'Hold for 30 seconds',
  'Switch sides and repeat',
  'Can adjust arm height for different angles'
],
ARRAY['Opens chest muscles', 'Improves posture', 'Counteracts hunched shoulders', 'Reduces upper back tension', 'Easy to perform anywhere'],
1, null, 30, 2.0),

('Ankle Mobility Drill', 'ankle-mobility-drill', 'flexibility', 'mobility', 'beginner', ARRAY['ankles', 'calves'], ARRAY['wall'], 'Essential drill for improving ankle dorsiflexion and preventing injuries.',
ARRAY[
  'Face wall and stand arm length away from wall',
  'Place hands on wall at shoulder height',
  'Step one foot back',
  'Keep front foot pointing straight at wall',
  'Try to touch knee to wall',
  'Keep heel on ground',
  'If easy, move foot further from wall',
  'Repeat 10 times each side'
],
ARRAY['Improves squat depth', 'Prevents ankle injuries', 'Enhances athletic performance', 'Reduces knee pain', 'Better movement mechanics'],
1, 10, null, 2.5),

('Foam Rolling Session', 'foam-rolling-session', 'flexibility', 'mobility', 'beginner', ARRAY['full body'], ARRAY['foam roller'], 'Self-myofascial release technique that reduces muscle tension and improves recovery.',
ARRAY[
  'Target major muscle groups: calves, quads, IT band, glutes, back',
  'Place foam roller under target muscle',
  'Use body weight to apply pressure',
  'Roll slowly back and forth',
  'Pause on tender spots for 20-30 seconds',
  'Do not roll directly on joints or bones',
  'Spend 30-60 seconds per muscle group',
  'Breathe deeply and relax into it'
],
ARRAY['Reduces muscle soreness', 'Improves flexibility', 'Enhances recovery', 'Increases blood flow', 'Prevents injuries', 'Reduces muscle tension'],
1, null, 300, 3.0);

-- Comment on table
COMMENT ON TABLE exercises IS 'Stores exercise guides for gym workouts including cardio, strength training, and flexibility exercises';

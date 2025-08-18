/**
 * Activity Normalization Constants
 * 
 * This file centralizes all activity type and unit normalization to ensure
 * consistency across the application, APIs, MCP, and leaderboard systems.
 */

import { SportType, ActivityPointConversion } from '@/types';

// Standard activity types (normalized from SportType enum)
export const NORMALIZED_ACTIVITY_TYPES = {
  // Running activities
  RUN: 'run',
  TRAIL_RUN: 'run', // Trail runs are considered as 'run' for points
  VIRTUAL_RUN: 'run',
  TRACK: 'run',
  TREADMILL: 'run',
  
  // Cycling activities  
  RIDE: 'cycle',
  MOUNTAIN_BIKE_RIDE: 'cycle',
  GRAVEL_RIDE: 'cycle',
  VIRTUAL_RIDE: 'cycle',
  E_BIKE_RIDE: 'cycle',
  VELO_MOBILE: 'cycle',
  HANDCYCLE: 'cycle',
  WHEELCHAIR: 'cycle',
  
  // Walking activities
  WALK: 'walk',
  HIKE: 'hike',
  
  // Swimming activities
  SWIM: 'swim',
  OPEN_WATER_SWIM: 'swim',
  
  // Winter sports
  ALPINE_SKI: 'ski',
  BACKCOUNTRY_SKI: 'ski',
  NORDIC_SKI: 'ski',
  SNOWBOARD: 'snowboard',
  ICE_SKATE: 'skate',
  SNOWSHOE: 'snowshoe',
  
  // Water sports
  KAYAKING: 'kayak',
  ROWING: 'row',
  STAND_UP_PADDLING: 'paddle',
  SURFING: 'surf',
  WINDSURF: 'windsurf',
  SAIL: 'sail',
  
  // Gym/Fitness - time-based workouts
  WEIGHT_TRAINING: 'workout',
  WORKOUT: 'workout',
  CROSSFIT: 'workout',
  ELLIPTICAL: 'workout',
  STAIR_STEPPER: 'workout',
  PARALLEL_BARS: 'workout',
  
  // Rep-based exercises - should be measured in repetitions
  PUSHUP: 'pushup',
  SITUP: 'situp',
  PULL_UP: 'pullup',
  
  // Other sports
  YOGA: 'yoga',
  ROCK_CLIMBING: 'climb',
  GOLF: 'golf',
  
  // Misc
  INLINE_SKATE: 'skate',
  SKATEBOARD: 'skate',
  ROLLER_SKI: 'ski'
} as const;

// Standard units (normalized to primary units)
export const STANDARD_UNITS = {
  // Distance units (primary)
  KILOMETERS: 'kilometers',
  METERS: 'meters',
  
  // Time units (primary)
  MINUTES: 'minutes',
  
  // Count units (primary)
  REPS: 'reps',
  CALORIES: 'calories',
} as const;

// STANDARDIZED ACTIVITY TO PRIMARY UNIT MAPPING
// Each activity type has ONE primary unit for consistency
export const ACTIVITY_PRIMARY_UNITS: Record<string, string> = {
  // Distance-based activities - PRIMARY UNIT: kilometers
  'run': 'kilometers',
  'walk': 'kilometers', 
  'cycle': 'kilometers',
  'hike': 'kilometers',
  'ski': 'kilometers',
  'snowboard': 'kilometers',
  'skate': 'kilometers',
  'snowshoe': 'kilometers',
  'kayak': 'kilometers',
  'paddle': 'kilometers',
  'windsurf': 'kilometers',
  'sail': 'kilometers',
  'climb': 'kilometers', // Distance climbed
  
  // Swimming - PRIMARY UNIT: meters (traditional for swimming)
  'swim': 'meters',
  'row': 'meters', // Rowing distance typically in meters
  
  // Time-based activities - PRIMARY UNIT: minutes
  'yoga': 'minutes',
  'workout': 'minutes', // General workout sessions
  'surf': 'minutes', // Surfing sessions
  'golf': 'minutes', // Golf rounds
  
  // Rep-based activities - PRIMARY UNIT: reps
  'pushup': 'reps',
  'situp': 'reps',
  'pullup': 'reps',
} as const;

// UNIT CONVERSION FACTORS TO PRIMARY UNITS
export const UNIT_CONVERSIONS: Record<string, Record<string, number>> = {
  // Distance conversions TO KILOMETERS
  kilometers: {
    'kilometers': 1,
    'km': 1,
    'meters': 0.001, // 1000 meters = 1 km
    'm': 0.001,
    'miles': 1.60934, // 1 mile = 1.60934 km
    'mi': 1.60934,
    'feet': 0.0003048, // 1 foot = 0.0003048 km
    'ft': 0.0003048,
    'yards': 0.0009144, // 1 yard = 0.0009144 km
    'yd': 0.0009144,
  },
  
  // Distance conversions TO METERS  
  meters: {
    'meters': 1,
    'm': 1,
    'kilometers': 1000, // 1 km = 1000 meters
    'km': 1000,
    'miles': 1609.34, // 1 mile = 1609.34 meters
    'mi': 1609.34,
    'feet': 0.3048, // 1 foot = 0.3048 meters
    'ft': 0.3048,
    'yards': 0.9144, // 1 yard = 0.9144 meters
    'yd': 0.9144,
  },
  
  // Time conversions TO MINUTES
  minutes: {
    'minutes': 1,
    'mins': 1,
    'min': 1,
    'hours': 60, // 1 hour = 60 minutes
    'hrs': 60,
    'hr': 60,
    'seconds': 1/60, // 60 seconds = 1 minute
    'secs': 1/60,
    'sec': 1/60,
    'days': 1440, // 1 day = 1440 minutes
    'day': 1440,
    'weeks': 10080, // 1 week = 10080 minutes
    'week': 10080,
  },
  
  // Count conversions (no conversion needed, but included for completeness)
  reps: {
    'reps': 1,
    'repetitions': 1,
    'rep': 1,
    'times': 1,
    'count': 1,
  },
  
  calories: {
    'calories': 1,
    'cal': 1,
    'kcal': 1,
    'kilocalories': 1,
  }
} as const;

/**
 * Get the primary unit for a given activity type
 */
export function getPrimaryUnit(activityType: string): string {
  const normalizedType = normalizeActivityType(activityType);
  return ACTIVITY_PRIMARY_UNITS[normalizedType] || 'minutes'; // Default to minutes
}

/**
 * Convert any unit value to the primary unit for the given activity type
 */
export function convertToPrimaryUnit(
  value: number, 
  inputUnit: string, 
  activityType: string
): { value: number; unit: string } {
  const primaryUnit = getPrimaryUnit(activityType);
  const normalizedInputUnit = inputUnit.toLowerCase().trim();
  
  // Get conversion factor
  const conversionTable = UNIT_CONVERSIONS[primaryUnit];
  if (!conversionTable) {
    console.warn(`No conversion table found for primary unit: ${primaryUnit}`);
    return { value, unit: inputUnit };
  }
  
  const conversionFactor = conversionTable[normalizedInputUnit];
  if (conversionFactor === undefined) {
    console.warn(`No conversion factor found for ${normalizedInputUnit} to ${primaryUnit}`);
    return { value, unit: inputUnit };
  }
  
  const convertedValue = value * conversionFactor;
  return { value: convertedValue, unit: primaryUnit };
}

/**
 * Normalize activity value and unit to standard format
 * This is the main function to use for ALL activity input normalization
 */
export function normalizeActivityInput(
  activityType: string,
  value: number,
  unit: string
): { type: string; value: number; unit: string } {
  const normalizedType = normalizeActivityType(activityType);
  const converted = convertToPrimaryUnit(value, unit, normalizedType);
  
  return {
    type: normalizedType,
    value: converted.value,
    unit: converted.unit
  };
}

/**
 * Validate if a unit is appropriate for an activity type
 */
export function isValidUnitForActivity(activityType: string, unit: string): boolean {
  const primaryUnit = getPrimaryUnit(activityType);
  const conversionTable = UNIT_CONVERSIONS[primaryUnit];
  if (!conversionTable) return false;
  
  const normalizedUnit = unit.toLowerCase().trim();
  return normalizedUnit in conversionTable;
}

/**
 * Get all valid units for a given activity type
 */
export function getValidUnitsForActivity(activityType: string): string[] {
  const primaryUnit = getPrimaryUnit(activityType);
  const conversionTable = UNIT_CONVERSIONS[primaryUnit];
  if (!conversionTable) return [];
  
  return Object.keys(conversionTable);
}

// Standard units (normalized)
export const NORMALIZED_UNITS = {
  // Distance units
  KILOMETERS: 'kilometers',
  METERS: 'meters',
  MILES: 'miles',
  
  // Time units
  MINUTES: 'minutes',
  HOURS: 'hours',
  SECONDS: 'seconds',
  WEEKS: 'weeks',
  DAYS: 'days',
  
  // Count units
  REPS: 'reps',
  CALORIES: 'calories',
  
  // Generic unit
  UNIT: 'unit'
} as const;

// Mapping from SportType enum to normalized activity type
export const SPORT_TYPE_TO_NORMALIZED: Record<SportType, string> = {
  // Running
  [SportType.Run]: NORMALIZED_ACTIVITY_TYPES.RUN,
  [SportType.TrailRun]: NORMALIZED_ACTIVITY_TYPES.TRAIL_RUN,
  [SportType.Treadmill]: NORMALIZED_ACTIVITY_TYPES.TREADMILL,
  [SportType.VirtualRun]: NORMALIZED_ACTIVITY_TYPES.VIRTUAL_RUN,
  [SportType.Track]: NORMALIZED_ACTIVITY_TYPES.TRACK,
  
  // Cycling
  [SportType.Ride]: NORMALIZED_ACTIVITY_TYPES.RIDE,
  [SportType.MountainBikeRide]: NORMALIZED_ACTIVITY_TYPES.MOUNTAIN_BIKE_RIDE,
  [SportType.GravelRide]: NORMALIZED_ACTIVITY_TYPES.GRAVEL_RIDE,
  [SportType.VirtualRide]: NORMALIZED_ACTIVITY_TYPES.VIRTUAL_RIDE,
  [SportType.EBikeRide]: NORMALIZED_ACTIVITY_TYPES.E_BIKE_RIDE,
  [SportType.VeloMobile]: NORMALIZED_ACTIVITY_TYPES.VELO_MOBILE,
  [SportType.Handcycle]: NORMALIZED_ACTIVITY_TYPES.HANDCYCLE,
  [SportType.Wheelchair]: NORMALIZED_ACTIVITY_TYPES.WHEELCHAIR,
  
  // Swimming
  [SportType.Swim]: NORMALIZED_ACTIVITY_TYPES.SWIM,
  [SportType.OpenWaterSwim]: NORMALIZED_ACTIVITY_TYPES.OPEN_WATER_SWIM,
  
  // Walking/Hiking
  [SportType.Walk]: NORMALIZED_ACTIVITY_TYPES.WALK,
  [SportType.Hike]: NORMALIZED_ACTIVITY_TYPES.HIKE,
  
  // Winter Sports
  [SportType.AlpineSki]: NORMALIZED_ACTIVITY_TYPES.ALPINE_SKI,
  [SportType.BackcountrySki]: NORMALIZED_ACTIVITY_TYPES.BACKCOUNTRY_SKI,
  [SportType.NordicSki]: NORMALIZED_ACTIVITY_TYPES.NORDIC_SKI,
  [SportType.Snowboard]: NORMALIZED_ACTIVITY_TYPES.SNOWBOARD,
  [SportType.IceSkate]: NORMALIZED_ACTIVITY_TYPES.ICE_SKATE,
  [SportType.Snowshoe]: NORMALIZED_ACTIVITY_TYPES.SNOWSHOE,
  
  // Water Sports
  [SportType.Kayaking]: NORMALIZED_ACTIVITY_TYPES.KAYAKING,
  [SportType.Rowing]: NORMALIZED_ACTIVITY_TYPES.ROWING,
  [SportType.StandUpPaddling]: NORMALIZED_ACTIVITY_TYPES.STAND_UP_PADDLING,
  [SportType.Surfing]: NORMALIZED_ACTIVITY_TYPES.SURFING,
  [SportType.Windsurf]: NORMALIZED_ACTIVITY_TYPES.WINDSURF,
  [SportType.Sail]: NORMALIZED_ACTIVITY_TYPES.SAIL,
  
  // Gym/Fitness
  [SportType.WeightTraining]: NORMALIZED_ACTIVITY_TYPES.WEIGHT_TRAINING,
  [SportType.Workout]: NORMALIZED_ACTIVITY_TYPES.WORKOUT,
  [SportType.Crossfit]: NORMALIZED_ACTIVITY_TYPES.CROSSFIT,
  [SportType.Elliptical]: NORMALIZED_ACTIVITY_TYPES.ELLIPTICAL,
  [SportType.StairStepper]: NORMALIZED_ACTIVITY_TYPES.STAIR_STEPPER,
  [SportType.Pushup]: NORMALIZED_ACTIVITY_TYPES.PUSHUP,
  [SportType.Situp]: NORMALIZED_ACTIVITY_TYPES.SITUP,
  [SportType.PullUp]: NORMALIZED_ACTIVITY_TYPES.PULL_UP,
  [SportType.ParallelBars]: NORMALIZED_ACTIVITY_TYPES.PARALLEL_BARS,
  
  // Other Sports
  [SportType.Yoga]: NORMALIZED_ACTIVITY_TYPES.YOGA,
  [SportType.RockClimbing]: NORMALIZED_ACTIVITY_TYPES.ROCK_CLIMBING,
  [SportType.Golf]: NORMALIZED_ACTIVITY_TYPES.GOLF,
  
  // Misc
  [SportType.InlineSkate]: NORMALIZED_ACTIVITY_TYPES.INLINE_SKATE,
  [SportType.Skateboard]: NORMALIZED_ACTIVITY_TYPES.SKATEBOARD,
  [SportType.RollerSki]: NORMALIZED_ACTIVITY_TYPES.ROLLER_SKI
};

// Mapping from UI/API unit names to normalized units
export const UNIT_TO_NORMALIZED: Record<string, string> = {
  // Distance variations
  'kilometers': NORMALIZED_UNITS.KILOMETERS,
  'kilometer': NORMALIZED_UNITS.KILOMETERS,
  'km': NORMALIZED_UNITS.KILOMETERS,
  'KM': NORMALIZED_UNITS.KILOMETERS,
  'Kilometers': NORMALIZED_UNITS.KILOMETERS,
  
  'meters': NORMALIZED_UNITS.METERS,
  'meter': NORMALIZED_UNITS.METERS,
  'm': NORMALIZED_UNITS.METERS,
  'M': NORMALIZED_UNITS.METERS,
  'Meters': NORMALIZED_UNITS.METERS,
  
  'miles': NORMALIZED_UNITS.MILES,
  'mile': NORMALIZED_UNITS.MILES,
  'mi': NORMALIZED_UNITS.MILES,
  'MI': NORMALIZED_UNITS.MILES,
  'Miles': NORMALIZED_UNITS.MILES,
  
  // Time variations
  'minutes': NORMALIZED_UNITS.MINUTES,
  'minute': NORMALIZED_UNITS.MINUTES,
  'min': NORMALIZED_UNITS.MINUTES,
  'MIN': NORMALIZED_UNITS.MINUTES,
  'Minutes': NORMALIZED_UNITS.MINUTES,
  
  'hours': NORMALIZED_UNITS.HOURS,
  'hour': NORMALIZED_UNITS.HOURS,
  'hr': NORMALIZED_UNITS.HOURS,
  'HR': NORMALIZED_UNITS.HOURS,
  'Hours': NORMALIZED_UNITS.HOURS,
  
  'seconds': NORMALIZED_UNITS.SECONDS,
  'second': NORMALIZED_UNITS.SECONDS,
  'sec': NORMALIZED_UNITS.SECONDS,
  'SEC': NORMALIZED_UNITS.SECONDS,
  'Seconds': NORMALIZED_UNITS.SECONDS,
  
  'weeks': NORMALIZED_UNITS.WEEKS,
  'week': NORMALIZED_UNITS.WEEKS,
  'WEEK': NORMALIZED_UNITS.WEEKS,
  'Week': NORMALIZED_UNITS.WEEKS,
  'Weeks': NORMALIZED_UNITS.WEEKS,
  
  'days': NORMALIZED_UNITS.DAYS,
  'day': NORMALIZED_UNITS.DAYS,
  'DAY': NORMALIZED_UNITS.DAYS,
  'Day': NORMALIZED_UNITS.DAYS,
  'Days': NORMALIZED_UNITS.DAYS,
  
  // Count variations
  'reps': NORMALIZED_UNITS.REPS,
  'rep': NORMALIZED_UNITS.REPS,
  'REPS': NORMALIZED_UNITS.REPS,
  'Reps': NORMALIZED_UNITS.REPS,
  
  'calories': NORMALIZED_UNITS.CALORIES,
  'calorie': NORMALIZED_UNITS.CALORIES,
  'cal': NORMALIZED_UNITS.CALORIES,
  'CAL': NORMALIZED_UNITS.CALORIES,
  'Calories': NORMALIZED_UNITS.CALORIES,
  
  // Generic
  'unit': NORMALIZED_UNITS.UNIT,
  'Unit': NORMALIZED_UNITS.UNIT,
  'UNIT': NORMALIZED_UNITS.UNIT
};

// Helper functions for normalization
export function normalizeActivityType(sportType: SportType | string): string {
  // If it's a SportType enum value, use the mapping
  if (typeof sportType === 'string' && sportType in SPORT_TYPE_TO_NORMALIZED) {
    return SPORT_TYPE_TO_NORMALIZED[sportType as SportType];
  }
  
  // If it's already a lowercase normalized type, return as-is
  const lowerType = sportType.toString().toLowerCase();
  if ((Object.values(NORMALIZED_ACTIVITY_TYPES) as string[]).includes(lowerType)) {
    return lowerType;
  }
  
  // Fallback: try to find a match in the mapping by value
  for (const [key, value] of Object.entries(SPORT_TYPE_TO_NORMALIZED)) {
    if (key.toLowerCase() === lowerType || value === lowerType) {
      return value;
    }
  }
  
  return NORMALIZED_ACTIVITY_TYPES.WORKOUT;
}

export function normalizeUnit(unit: string): string {
  // Direct lookup in mapping
  if (unit in UNIT_TO_NORMALIZED) {
    return UNIT_TO_NORMALIZED[unit];
  }
  
  // Fallback: try lowercase
  const lowerUnit = unit.toLowerCase();
  if (lowerUnit in UNIT_TO_NORMALIZED) {
    return UNIT_TO_NORMALIZED[lowerUnit];
  }
  
  // If already normalized, return as-is
  if ((Object.values(NORMALIZED_UNITS) as string[]).includes(unit)) {
    return unit;
  }
  
  return NORMALIZED_UNITS.UNIT;
}

// Updated default activity point conversion with normalized values
export const DEFAULT_NORMALIZED_ACTIVITY_POINT_CONVERSION: ActivityPointConversion[] = [
  // Running activities - multiple units
  { activity_type: NORMALIZED_ACTIVITY_TYPES.RUN, unit: NORMALIZED_UNITS.KILOMETERS, rate: 10 },
  { activity_type: NORMALIZED_ACTIVITY_TYPES.RUN, unit: NORMALIZED_UNITS.METERS, rate: 0.01 }, // 0.01 per meter = 10 per km
  { activity_type: NORMALIZED_ACTIVITY_TYPES.RUN, unit: NORMALIZED_UNITS.MILES, rate: 16 }, // ~10 per km * 1.6
  { activity_type: NORMALIZED_ACTIVITY_TYPES.RUN, unit: NORMALIZED_UNITS.MINUTES, rate: 1 }, // Time-based running
  
  // Walking activities - multiple units
  { activity_type: NORMALIZED_ACTIVITY_TYPES.WALK, unit: NORMALIZED_UNITS.KILOMETERS, rate: 5 },
  { activity_type: NORMALIZED_ACTIVITY_TYPES.WALK, unit: NORMALIZED_UNITS.METERS, rate: 0.005 }, // 0.005 per meter = 5 per km
  { activity_type: NORMALIZED_ACTIVITY_TYPES.WALK, unit: NORMALIZED_UNITS.MILES, rate: 8 }, // ~5 per km * 1.6
  { activity_type: NORMALIZED_ACTIVITY_TYPES.WALK, unit: NORMALIZED_UNITS.MINUTES, rate: 0.5 }, // Time-based walking
  
  // Cycling activities - multiple units (using RIDE which maps to 'cycle')
  { activity_type: NORMALIZED_ACTIVITY_TYPES.RIDE, unit: NORMALIZED_UNITS.KILOMETERS, rate: 3 },
  { activity_type: NORMALIZED_ACTIVITY_TYPES.RIDE, unit: NORMALIZED_UNITS.METERS, rate: 0.003 }, // 0.003 per meter = 3 per km
  { activity_type: NORMALIZED_ACTIVITY_TYPES.RIDE, unit: NORMALIZED_UNITS.MILES, rate: 5 }, // ~3 per km * 1.6
  { activity_type: NORMALIZED_ACTIVITY_TYPES.RIDE, unit: NORMALIZED_UNITS.MINUTES, rate: 0.3 }, // Time-based cycling
  
  // Hiking activities - multiple units
  { activity_type: NORMALIZED_ACTIVITY_TYPES.HIKE, unit: NORMALIZED_UNITS.KILOMETERS, rate: 8 },
  { activity_type: NORMALIZED_ACTIVITY_TYPES.HIKE, unit: NORMALIZED_UNITS.METERS, rate: 0.008 }, // 0.008 per meter = 8 per km
  { activity_type: NORMALIZED_ACTIVITY_TYPES.HIKE, unit: NORMALIZED_UNITS.MILES, rate: 13 }, // ~8 per km * 1.6
  { activity_type: NORMALIZED_ACTIVITY_TYPES.HIKE, unit: NORMALIZED_UNITS.MINUTES, rate: 0.8 }, // Time-based hiking
  
  // Swimming activities - meters primary
  { activity_type: NORMALIZED_ACTIVITY_TYPES.SWIM, unit: NORMALIZED_UNITS.METERS, rate: 0.02 }, // 0.02 points per meter = 20 per km
  { activity_type: NORMALIZED_ACTIVITY_TYPES.SWIM, unit: NORMALIZED_UNITS.KILOMETERS, rate: 20 }, // 20 points per km
  { activity_type: NORMALIZED_ACTIVITY_TYPES.SWIM, unit: NORMALIZED_UNITS.MINUTES, rate: 2 }, // Time-based swimming
  
  // Workout activities - time based (general workouts)
  { activity_type: NORMALIZED_ACTIVITY_TYPES.WORKOUT, unit: NORMALIZED_UNITS.MINUTES, rate: 0.5 },
  { activity_type: NORMALIZED_ACTIVITY_TYPES.WORKOUT, unit: NORMALIZED_UNITS.HOURS, rate: 30 }, // 30 points per hour
  { activity_type: NORMALIZED_ACTIVITY_TYPES.WORKOUT, unit: NORMALIZED_UNITS.SECONDS, rate: 0.008 }, // 0.008 per second = 0.5 per minute
  { activity_type: NORMALIZED_ACTIVITY_TYPES.WORKOUT, unit: NORMALIZED_UNITS.DAYS, rate: 720 }, // 720 points per day (30 per hour × 24)
  { activity_type: NORMALIZED_ACTIVITY_TYPES.WORKOUT, unit: NORMALIZED_UNITS.WEEKS, rate: 5040 }, // 5040 points per week (720 per day × 7)
  { activity_type: NORMALIZED_ACTIVITY_TYPES.WORKOUT, unit: NORMALIZED_UNITS.CALORIES, rate: 0.01 }, // 0.01 per calorie
  { activity_type: NORMALIZED_ACTIVITY_TYPES.WORKOUT, unit: NORMALIZED_UNITS.METERS, rate: 0.002 }, // Distance-based workouts (treadmill, etc.)
  { activity_type: NORMALIZED_ACTIVITY_TYPES.WORKOUT, unit: NORMALIZED_UNITS.KILOMETERS, rate: 2 }, // 2 points per km for workout distance
  { activity_type: NORMALIZED_ACTIVITY_TYPES.WORKOUT, unit: NORMALIZED_UNITS.MILES, rate: 3.2 }, // ~2 per km × 1.6
  
  // Rep-based exercises - PRIMARY UNIT: reps
  { activity_type: NORMALIZED_ACTIVITY_TYPES.PUSHUP, unit: NORMALIZED_UNITS.REPS, rate: 0.1 }, // 0.1 points per push-up
  { activity_type: NORMALIZED_ACTIVITY_TYPES.SITUP, unit: NORMALIZED_UNITS.REPS, rate: 0.1 }, // 0.1 points per sit-up  
  { activity_type: NORMALIZED_ACTIVITY_TYPES.PULL_UP, unit: NORMALIZED_UNITS.REPS, rate: 0.2 }, // 0.2 points per pull-up (harder exercise)
  
  // Winter sports - distance and time (using ALPINE_SKI which maps to 'ski')
  { activity_type: NORMALIZED_ACTIVITY_TYPES.ALPINE_SKI, unit: NORMALIZED_UNITS.KILOMETERS, rate: 6 },
  { activity_type: NORMALIZED_ACTIVITY_TYPES.ALPINE_SKI, unit: NORMALIZED_UNITS.METERS, rate: 0.006 },
  { activity_type: NORMALIZED_ACTIVITY_TYPES.ALPINE_SKI, unit: NORMALIZED_UNITS.MINUTES, rate: 0.6 },
  
  { activity_type: NORMALIZED_ACTIVITY_TYPES.SNOWBOARD, unit: NORMALIZED_UNITS.KILOMETERS, rate: 5 },
  { activity_type: NORMALIZED_ACTIVITY_TYPES.SNOWBOARD, unit: NORMALIZED_UNITS.METERS, rate: 0.005 },
  { activity_type: NORMALIZED_ACTIVITY_TYPES.SNOWBOARD, unit: NORMALIZED_UNITS.MINUTES, rate: 0.5 },
  
  { activity_type: NORMALIZED_ACTIVITY_TYPES.ICE_SKATE, unit: NORMALIZED_UNITS.KILOMETERS, rate: 4 },
  { activity_type: NORMALIZED_ACTIVITY_TYPES.ICE_SKATE, unit: NORMALIZED_UNITS.METERS, rate: 0.004 },
  { activity_type: NORMALIZED_ACTIVITY_TYPES.ICE_SKATE, unit: NORMALIZED_UNITS.MINUTES, rate: 0.4 },
  
  { activity_type: NORMALIZED_ACTIVITY_TYPES.SNOWSHOE, unit: NORMALIZED_UNITS.KILOMETERS, rate: 7 },
  { activity_type: NORMALIZED_ACTIVITY_TYPES.SNOWSHOE, unit: NORMALIZED_UNITS.METERS, rate: 0.007 },
  { activity_type: NORMALIZED_ACTIVITY_TYPES.SNOWSHOE, unit: NORMALIZED_UNITS.MINUTES, rate: 0.7 },
  
  // Water sports - distance and time
  { activity_type: NORMALIZED_ACTIVITY_TYPES.KAYAKING, unit: NORMALIZED_UNITS.KILOMETERS, rate: 4 },
  { activity_type: NORMALIZED_ACTIVITY_TYPES.KAYAKING, unit: NORMALIZED_UNITS.METERS, rate: 0.004 },
  { activity_type: NORMALIZED_ACTIVITY_TYPES.KAYAKING, unit: NORMALIZED_UNITS.MINUTES, rate: 0.4 },
  
  { activity_type: NORMALIZED_ACTIVITY_TYPES.ROWING, unit: NORMALIZED_UNITS.METERS, rate: 0.003 },
  { activity_type: NORMALIZED_ACTIVITY_TYPES.ROWING, unit: NORMALIZED_UNITS.KILOMETERS, rate: 3 },
  { activity_type: NORMALIZED_ACTIVITY_TYPES.ROWING, unit: NORMALIZED_UNITS.MINUTES, rate: 0.3 },
  
  { activity_type: NORMALIZED_ACTIVITY_TYPES.STAND_UP_PADDLING, unit: NORMALIZED_UNITS.KILOMETERS, rate: 4 },
  { activity_type: NORMALIZED_ACTIVITY_TYPES.STAND_UP_PADDLING, unit: NORMALIZED_UNITS.METERS, rate: 0.004 },
  { activity_type: NORMALIZED_ACTIVITY_TYPES.STAND_UP_PADDLING, unit: NORMALIZED_UNITS.MINUTES, rate: 0.4 },
  
  { activity_type: NORMALIZED_ACTIVITY_TYPES.SURFING, unit: NORMALIZED_UNITS.MINUTES, rate: 0.8 },
  { activity_type: NORMALIZED_ACTIVITY_TYPES.SURFING, unit: NORMALIZED_UNITS.HOURS, rate: 48 },
  
  { activity_type: NORMALIZED_ACTIVITY_TYPES.WINDSURF, unit: NORMALIZED_UNITS.KILOMETERS, rate: 3 },
  { activity_type: NORMALIZED_ACTIVITY_TYPES.WINDSURF, unit: NORMALIZED_UNITS.MINUTES, rate: 0.3 },
  
  { activity_type: NORMALIZED_ACTIVITY_TYPES.SAIL, unit: NORMALIZED_UNITS.KILOMETERS, rate: 2 },
  { activity_type: NORMALIZED_ACTIVITY_TYPES.SAIL, unit: NORMALIZED_UNITS.MINUTES, rate: 0.2 },
  
  // Other sports - primarily time based
  { activity_type: NORMALIZED_ACTIVITY_TYPES.YOGA, unit: NORMALIZED_UNITS.MINUTES, rate: 0.5 },
  { activity_type: NORMALIZED_ACTIVITY_TYPES.YOGA, unit: NORMALIZED_UNITS.HOURS, rate: 30 },
  
  { activity_type: NORMALIZED_ACTIVITY_TYPES.ROCK_CLIMBING, unit: NORMALIZED_UNITS.MINUTES, rate: 1.2 },
  { activity_type: NORMALIZED_ACTIVITY_TYPES.ROCK_CLIMBING, unit: NORMALIZED_UNITS.HOURS, rate: 72 },
  { activity_type: NORMALIZED_ACTIVITY_TYPES.ROCK_CLIMBING, unit: NORMALIZED_UNITS.METERS, rate: 0.5 }, // Vertical meters
  
  { activity_type: NORMALIZED_ACTIVITY_TYPES.GOLF, unit: NORMALIZED_UNITS.MINUTES, rate: 0.3 },
  { activity_type: NORMALIZED_ACTIVITY_TYPES.GOLF, unit: NORMALIZED_UNITS.HOURS, rate: 18 }
];

// Function to get conversion with normalized lookup
export function findNormalizedConversion(
  conversions: ActivityPointConversion[],
  activityType: string,
  unit: string
): ActivityPointConversion | undefined {
  const normalizedType = normalizeActivityType(activityType);
  const normalizedUnit = normalizeUnit(unit);
  
  return conversions.find(
    c => c.activity_type === normalizedType && c.unit === normalizedUnit
  );
}

// Export all normalized types for type safety
export type NormalizedActivityType = typeof NORMALIZED_ACTIVITY_TYPES[keyof typeof NORMALIZED_ACTIVITY_TYPES];
export type NormalizedUnit = typeof NORMALIZED_UNITS[keyof typeof NORMALIZED_UNITS]; 
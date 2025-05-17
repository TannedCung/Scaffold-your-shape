// User type
// DB shape for User (snake_case)
export interface UserDb {
  id: string;
  email: string;
  name: string;
  avatar_url?: string | null;
  bio?: string | null;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  bio?: string;
  created_at: string;
  updatedAt: string;
}

export function mapUserDbToUser(db: UserDb): User {
  return {
    id: db.id,
    email: db.email,
    name: db.name,
    avatarUrl: db.avatar_url ?? undefined,
    bio: db.bio ?? undefined,
    created_at: db.created_at,
    updatedAt: db.updated_at,
  };
}

// Exercise types
export type ExerciseType = 'strength' | 'cardio' | 'flexibility' | 'balance';
export type ExerciseUnit = 'reps' | 'meters' | 'seconds' | 'minutes' | 'hours';

// DB shape for Exercise (snake_case)
export interface ExerciseDb {
  id: string;
  name: string;
  type: ExerciseType;
  unit: ExerciseUnit;
  muscle_groups: string[];
  description?: string | null;
  image_url?: string | null;
}

export interface Exercise {
  id: string;
  name: string;
  type: ExerciseType;
  unit: ExerciseUnit;
  muscleGroups: string[];
  description?: string;
  imageUrl?: string;
}

export function mapExerciseDbToExercise(db: ExerciseDb): Exercise {
  return {
    id: db.id,
    name: db.name,
    type: db.type,
    unit: db.unit,
    muscleGroups: db.muscle_groups,
    description: db.description ?? undefined,
    imageUrl: db.image_url ?? undefined,
  };
}

// Workout log types
// DB shape for WorkoutLog (snake_case)
export interface WorkoutLogDb {
  id: string;
  user_id: string;
  exercise_id: string;
  value: number;
  unit: ExerciseUnit;
  date: string;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkoutLog {
  id: string;
  userId: string;
  exerciseId: string;
  exercise?: Exercise;
  value: number;
  unit: ExerciseUnit;
  date: string;
  notes?: string;
  created_at: string;
  updatedAt: string;
}

export function mapWorkoutLogDbToWorkoutLog(db: WorkoutLogDb): WorkoutLog {
  return {
    id: db.id,
    userId: db.user_id,
    exerciseId: db.exercise_id,
    value: db.value,
    unit: db.unit,
    date: db.date,
    notes: db.notes ?? undefined,
    created_at: db.created_at,
    updatedAt: db.updated_at,
  };
}

// Outdoor activity types
export type ActivityType = 'run' | 'walk' | 'swim' | 'cycle' | 'hike' | 'other';

// DB shape for Activity (snake_case)
export interface ActivityDb {
  id: string;
  user_id: string;
  type: string;
  name: string;
  date: string;
  value: number;
  unit: string;
  location?: string | null;
  notes?: string | null;
  strava_id?: string | null;
  source?: string | null;
  url?: string | null;
  created_at: string;
  updated_at: string;
  // New Strava fields
  distance?: number | null;
  moving_time?: number | null;
  elapsed_time?: number | null;
  total_elevation_gain?: number | null;
  sport_type?: string | null;
  start_date?: string | null;
  start_latlng?: number[] | null;
  end_latlng?: number[] | null;
  average_speed?: number | null;
  max_speed?: number | null;
  average_cadence?: number | null;
  average_temp?: number | null;
  average_watts?: number | null;
  kilojoules?: number | null;
  max_watts?: number | null;
  elev_high?: number | null;
  elev_low?: number | null;
  workout_type?: number | null;
  description?: string | null;
}

export interface Activity {
  id: string;
  userId: string;
  type: string; // e.g., 'workout', 'run', 'swim', 'bike'
  name: string; // e.g., 'Push-ups', 'Morning Run'
  date: string;
  value: number; // e.g., 50, 5000, 15
  unit: string; // e.g., 'reps', 'meters'
  location?: string; // e.g., 'Gym', 'Park'
  notes?: string; // Additional notes about the activity
  strava_id?: string; // Reference to the Strava activity ID
  source?: string; // e.g., 'Strava', 'TannedandMiked'
  url?: string; // URL to original activity (for external sources)
  created_at: string;
  updatedAt: string;
  timeAgo?: string; // UI-only, not stored in DB
  // New Strava fields
  distance?: number;
  movingTime?: number;
  elapsedTime?: number;
  totalElevationGain?: number;
  sportType?: string;
  startDate?: string;
  startLatlng?: number[];
  endLatlng?: number[];
  averageSpeed?: number;
  maxSpeed?: number;
  averageCadence?: number;
  averageTemp?: number;
  averageWatts?: number;
  kilojoules?: number;
  maxWatts?: number;
  elevHigh?: number;
  elevLow?: number;
  workoutType?: number;
  description?: string;
  map?: Map;
  segmentEfforts?: Segmentation[];
}

export function mapActivityDbToActivity(db: ActivityDb): Activity {
  return {
    id: db.id,
    userId: db.user_id,
    type: db.type,
    name: db.name,
    date: db.date,
    value: db.value,
    unit: db.unit,
    location: db.location ?? undefined,
    notes: db.notes ?? undefined,
    strava_id: db.strava_id ?? undefined,
    source: db.source ?? undefined,
    url: db.url ?? undefined,
    created_at: db.created_at,
    updatedAt: db.updated_at,
    // New Strava fields
    distance: db.distance ?? undefined,
    movingTime: db.moving_time ?? undefined,
    elapsedTime: db.elapsed_time ?? undefined,
    totalElevationGain: db.total_elevation_gain ?? undefined,
    sportType: db.sport_type ?? undefined,
    startDate: db.start_date ?? undefined,
    startLatlng: db.start_latlng ?? undefined,
    endLatlng: db.end_latlng ?? undefined,
    averageSpeed: db.average_speed ?? undefined,
    maxSpeed: db.max_speed ?? undefined,
    averageCadence: db.average_cadence ?? undefined,
    averageTemp: db.average_temp ?? undefined,
    averageWatts: db.average_watts ?? undefined,
    kilojoules: db.kilojoules ?? undefined,
    maxWatts: db.max_watts ?? undefined,
    elevHigh: db.elev_high ?? undefined,
    elevLow: db.elev_low ?? undefined,
    workoutType: db.workout_type ?? undefined,
    description: db.description ?? undefined,
  };
}

// DB shape for OutdoorActivity (snake_case)
export interface OutdoorActivityDb {
  id: string;
  user_id: string;
  type: ActivityType;
  distance: number;
  duration: number;
  date: string;
  location?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface OutdoorActivity {
  id: string;
  userId: string;
  type: ActivityType;
  distance: number; // in meters
  duration: number; // in seconds
  date: string;
  location?: string;
  notes?: string;
  created_at: string;
  updatedAt: string;
}

export function mapOutdoorActivityDbToOutdoorActivity(db: OutdoorActivityDb): OutdoorActivity {
  return {
    id: db.id,
    userId: db.user_id,
    type: db.type,
    distance: db.distance,
    duration: db.duration,
    date: db.date,
    location: db.location ?? undefined,
    notes: db.notes ?? undefined,
    created_at: db.created_at,
    updatedAt: db.updated_at,
  };
}

// Club types
// DB shape for Club (snake_case)
export interface ClubDb {
  id: string;
  name: string;
  description: string;
  creator_id: string | null;
  image_url?: string | null;
  background_image_url?: string | null;
  member_count: number;
  is_private: boolean;
  created_at: string;
  updated_at: string;
}

// App shape for Club (camelCase)
export interface Club {
  id: string;
  name: string;
  description: string;
  creatorId: string | null;
  imageUrl?: string | null;
  backgroundImageUrl?: string | null;
  memberCount: number;
  isPrivate: boolean;
  created_at: string;
  updatedAt: string;
}

// Mapper function to convert DB shape to app shape
export function mapClubDbToClub(db: ClubDb): Club {
  return {
    id: db.id,
    name: db.name,
    description: db.description,
    creatorId: db.creator_id,
    imageUrl: db.image_url,
    backgroundImageUrl: db.background_image_url,
    memberCount: db.member_count,
    isPrivate: db.is_private,
    created_at: db.created_at,
    updatedAt: db.updated_at,
  };
}

// DB shape for ClubMember (snake_case)
export interface ClubMemberDb {
  id: string;
  club_id: string;
  user_id: string;
  role: 'admin' | 'member';
  joined_at: string;
}

export interface ClubMember {
  id: string;
  clubId: string;
  userId: string;
  role: 'admin' | 'member';
  joinedAt: string;
}

export function mapClubMemberDbToClubMember(db: ClubMemberDb): ClubMember {
  return {
    id: db.id,
    clubId: db.club_id,
    userId: db.user_id,
    role: db.role,
    joinedAt: db.joined_at,
  };
}

// Challenge types
// DB shape for Challenge (snake_case)
export interface ChallengeDb {
  id: string;
  title: string;
  description: string;
  creator_id: string;
  exercise_id?: string | null;
  activity_type?: ActivityType | null;
  target_value: number;
  unit: ExerciseUnit;
  start_date: string;
  end_date: string;
  is_public: boolean;
  participant_count: number;
  background_image_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  creatorId: string;
  exerciseId?: string;
  activityType?: ActivityType;
  targetValue: number;
  unit: ExerciseUnit;
  startDate: string;
  endDate: string;
  isPublic: boolean;
  participantCount: number;
  backgroundImageUrl?: string;
  created_at: string;
  updatedAt: string;
}

export function mapChallengeDbToChallenge(db: ChallengeDb): Challenge {
  return {
    id: db.id,
    title: db.title,
    description: db.description,
    creatorId: db.creator_id,
    exerciseId: db.exercise_id ?? undefined,
    activityType: db.activity_type ?? undefined,
    targetValue: db.target_value,
    unit: db.unit,
    startDate: db.start_date,
    endDate: db.end_date,
    isPublic: db.is_public,
    participantCount: db.participant_count,
    backgroundImageUrl: db.background_image_url ?? undefined,
    created_at: db.created_at,
    updatedAt: db.updated_at,
  };
}

// DB shape for ChallengeParticipant (snake_case)
export interface ChallengeParticipantDb {
  id: string;
  challenge_id: string;
  user_id: string;
  current_value: number;
  completed: boolean;
  completed_at?: string | null;
  joined_at: string;
}

export interface ChallengeParticipant {
  id: string;
  challengeId: string;
  userId: string;
  currentValue: number;
  completed: boolean;
  completedAt?: string;
  joinedAt: string;
}

export function mapChallengeParticipantDbToChallengeParticipant(db: ChallengeParticipantDb): ChallengeParticipant {
  return {
    id: db.id,
    challengeId: db.challenge_id,
    userId: db.user_id,
    currentValue: db.current_value,
    completed: db.completed,
    completedAt: db.completed_at ?? undefined,
    joinedAt: db.joined_at,
  };
}

// Profile type
// DB shape for Profile (snake_case)
export interface ProfileDb {
  id: string;
  email: string;
  name: string;
  avatar_url?: string | null;
  bio?: string | null;
  strava_id?: string | null;
  strava_access_token?: string | null;
  strava_refresh_token?: string | null;
  strava_token_expires_at?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface Profile {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  bio?: string;
  strava_id?: string;
  strava_access_token?: string;
  strava_refresh_token?: string;
  strava_token_expires_at?: number;
  created_at?: string;
  updated_at?: string;
}

export function mapProfileDbToProfile(db: ProfileDb): Profile {
  return {
    id: db.id,
    email: db.email,
    name: db.name,
    avatar_url: db.avatar_url ?? undefined,
    bio: db.bio ?? undefined,
    strava_id: db.strava_id ?? undefined,
    strava_access_token: db.strava_access_token ?? undefined,
    strava_refresh_token: db.strava_refresh_token ?? undefined,
    strava_token_expires_at: db.strava_token_expires_at ?? undefined,
    created_at: db.created_at,
    updated_at: db.updated_at,
  };
}

// Stats types
// DB shape for UserStats (snake_case)
export interface UserStatsDb {
  total_workouts: number;
  total_activities: number;
  total_distance: number;
  total_challenges_completed: number;
  top_exercises: {
    exercise_id: string;
    exercise_name: string;
    count: number;
  }[];
}

export interface UserStats {
  totalWorkouts: number;
  totalActivities: number;
  totalDistance: number; // in meters
  totalChallengesCompleted: number;
  topExercises: {
    exerciseId: string;
    exerciseName: string;
    count: number;
  }[];
}

export function mapUserStatsDbToUserStats(db: UserStatsDb): UserStats {
  return {
    totalWorkouts: db.total_workouts,
    totalActivities: db.total_activities,
    totalDistance: db.total_distance,
    totalChallengesCompleted: db.total_challenges_completed,
    topExercises: db.top_exercises.map(e => ({
      exerciseId: e.exercise_id,
      exerciseName: e.exercise_name,
      count: e.count,
    })),
  };
}

export interface ActivityPointConversion {
  activity_type: string;
  unit: string;
  rate: number;
}

export interface ClubPointConversion extends ActivityPointConversion {
  club_id: string;
}

export interface ChallengePointConversion extends ActivityPointConversion {
  challenge_id: string;
}

// New types for Strava Maps
export interface MapDb {
  id: string;
  polyline: string;
  activity_id: string;
  summary_polyline: string;
}

export interface Map {
  id: string;
  polyline: string;
  activityId: string;
  summaryPolyline: string;
}

export function mapMapDbToMap(db: MapDb): Map {
  return {
    id: db.id,
    polyline: db.polyline,
    activityId: db.activity_id,
    summaryPolyline: db.summary_polyline,
  };
}

// New types for Strava Segmentations
export interface SegmentationDb {
  id: string;
  activity_id: string;
  name: string;
  elapsed_time: number;
  moving_time: number;
  start_date: string;
  distance: number;
  average_cadence: number;
  average_watts: number;
  segment: Record<string, unknown>; // JSON object
}

export interface Segmentation {
  id: string;
  activityId: string;
  name: string;
  elapsedTime: number;
  movingTime: number;
  startDate: string;
  startDateLocal: string;
  distance: number;
  averageCadence: number;
  averageWatts: number;
  segment: Record<string, unknown>; // JSON object
}

export function mapSegmentationDbToSegmentation(db: SegmentationDb): Segmentation {
  return {
    id: db.id,
    activityId: db.activity_id,
    name: db.name,
    elapsedTime: db.elapsed_time,
    movingTime: db.moving_time,
    startDate: db.start_date,
    startDateLocal: db.start_date,
    distance: db.distance,
    averageCadence: db.average_cadence,
    averageWatts: db.average_watts,
    segment: db.segment,
  };
}

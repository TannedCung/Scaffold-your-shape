// User type
export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  bio?: string;
  created_at: string;
  updatedAt: string;
}

// Exercise types
export type ExerciseType = 'strength' | 'cardio' | 'flexibility' | 'balance';
export type ExerciseUnit = 'reps' | 'meters' | 'seconds' | 'minutes' | 'hours';

export interface Exercise {
  id: string;
  name: string;
  type: ExerciseType;
  unit: ExerciseUnit;
  muscleGroups: string[];
  description?: string;
  imageUrl?: string;
}

// Workout log types
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

// Outdoor activity types
export type ActivityType = 'run' | 'walk' | 'swim' | 'cycle' | 'hike' | 'other';

export interface Activity {
  id: string;
  userId: string;
  type: string; // e.g., 'workout', 'run', 'swim', 'bike'
  name: string; // e.g., 'Push-ups', 'Morning Run'
  date: string;
  value: number; // e.g., 50, 5000, 15
  unit: string; // e.g., 'reps', 'meters'
  created_at: string;
  updatedAt: string;
  timeAgo?: string; // UI-only, not stored in DB
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

// Club types
export interface Club {
  id: string;
  name: string;
  description: string;
  creatorId: string;
  imageUrl?: string;
  memberCount: number;
  isPrivate: boolean;
  created_at: string;
  updatedAt: string;
}

export interface ClubMember {
  id: string;
  clubId: string;
  userId: string;
  role: 'admin' | 'member';
  joinedAt: string;
}

// Challenge types
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
  created_at: string;
  updatedAt: string;
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

// Profile type
export interface Profile {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  bio?: string;
  created_at?: string;
  updated_at?: string;
}

// Stats types
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

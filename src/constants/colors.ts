/**
 * Unified color constants for consistent theming across the app
 * Colors follow a vintage palette with distinct, muted tones
 * Palette: D6A99D (dusty rose), FBF3D5 (cream), D6DAC8 (sage), 9CAFAA (teal)
 */

import { ExerciseType, ExerciseDifficulty } from '@/types';

/**
 * Vintage color palette - distinct and muted tones
 */
export const VINTAGE_COLORS = {
  dustyRose: '#D6A99D',
  cream: '#FBF3D5',
  sage: '#D6DAC8',
  teal: '#9CAFAA'
} as const;

/**
 * Exercise type colors - vintage palette with maximum contrast
 */
export const EXERCISE_TYPE_COLORS: Record<ExerciseType, string> = {
  strength: '#9CAFAA',    // Teal - strong and steady
  cardio: '#D6A99D',      // Dusty Rose - active and energetic
  flexibility: '#8B9D83',  // Darker Sage - calm and flexible
  balance: '#C4A57B'      // Warm Tan - balanced and grounded
} as const;

/**
 * Exercise difficulty colors - vintage palette with clear progression
 */
export const EXERCISE_DIFFICULTY_COLORS: Record<ExerciseDifficulty, string> = {
  beginner: '#B8C5A6',      // Light Sage - gentle start
  intermediate: '#D6A99D',   // Dusty Rose - growing challenge
  advanced: '#8B7B6F',       // Deep Brown - intense challenge
} as const;

/**
 * Helper function to get text color for better contrast on vintage backgrounds
 */
const getContrastTextColor = (bgColor: string): string => {
  // For these vintage muted colors, dark text works best
  return '#2c3e50'; // Dark gray-blue for good readability
};

/**
 * Helper function to get chip styles for exercise types
 */
export const getExerciseTypeChipStyles = (type: ExerciseType) => ({
  backgroundColor: EXERCISE_TYPE_COLORS[type],
  color: getContrastTextColor(EXERCISE_TYPE_COLORS[type]),
  fontWeight: 600,
  border: `1px solid ${EXERCISE_TYPE_COLORS[type]}`
});

/**
 * Helper function to get chip styles for exercise difficulty
 */
export const getExerciseDifficultyChipStyles = (difficulty: ExerciseDifficulty) => ({
  backgroundColor: EXERCISE_DIFFICULTY_COLORS[difficulty],
  color: getContrastTextColor(EXERCISE_DIFFICULTY_COLORS[difficulty]),
  fontWeight: 600,
  border: `1px solid ${EXERCISE_DIFFICULTY_COLORS[difficulty]}`
});

/**
 * Helper function to get chip styles with transparency (for cards)
 */
export const getExerciseTypeChipStylesWithAlpha = (type: ExerciseType) => ({
  backgroundColor: `${EXERCISE_TYPE_COLORS[type]}B3`,
  color: getContrastTextColor(EXERCISE_TYPE_COLORS[type]),
  fontWeight: 500,
  border: `1px solid ${EXERCISE_TYPE_COLORS[type]}`
});

/**
 * Helper function to get chip styles with transparency (for cards)
 */
export const getExerciseDifficultyChipStylesWithAlpha = (difficulty: ExerciseDifficulty) => ({
  backgroundColor: `${EXERCISE_DIFFICULTY_COLORS[difficulty]}B3`,
  color: getContrastTextColor(EXERCISE_DIFFICULTY_COLORS[difficulty]),
  fontWeight: 500,
  border: `1px solid ${EXERCISE_DIFFICULTY_COLORS[difficulty]}`
});


// Default global activity point conversion table
import { ActivityPointConversion } from '@/types';

export const DEFAULT_ACTIVITY_POINT_CONVERSION: ActivityPointConversion[] = [
  { activity_type: 'run', unit: 'km', rate: 10 },
  { activity_type: 'walk', unit: 'km', rate: 5 },
  { activity_type: 'cycle', unit: 'km', rate: 3 },
  { activity_type: 'swim', unit: 'km', rate: 20 },
  { activity_type: 'workout', unit: 'reps', rate: 0.1 },
  { activity_type: 'hike', unit: 'km', rate: 8 },
  { activity_type: 'other', unit: 'unit', rate: 1 },
]; 
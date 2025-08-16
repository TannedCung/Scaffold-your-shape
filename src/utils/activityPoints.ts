import { Activity } from '@/types';
import { ActivityPointConversion } from '@/types';
import { findNormalizedConversion } from '@/constants/activityNormalization';

export function calculateActivityPoints(
  activity: Activity,
  conversions: ActivityPointConversion[]
): number {
  const conv = findNormalizedConversion(conversions, activity.type, activity.unit);
  if (!conv) return 0;
  return activity.value * conv.rate;
} 
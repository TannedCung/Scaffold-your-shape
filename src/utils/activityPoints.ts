import { Activity } from '@/types';
import { ActivityPointConversion } from '@/types';

export function calculateActivityPoints(
  activity: Activity,
  conversions: ActivityPointConversion[]
): number {
  const conv = conversions.find(
    c => c.activity_type === activity.type && c.unit === activity.unit
  );
  if (!conv) return 0;
  return activity.value * conv.rate;
} 
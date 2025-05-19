import { Profile } from '@/types';
import { profileApi } from '@/lib/api';

export async function fetchProfile(userId: string): Promise<Profile | null> {
  try {
    const { data, error } = await profileApi.get();
    if (error) throw new Error(error);
    return data || null;
  } catch (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
}

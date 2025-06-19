import { Profile } from '@/types';
import { profileApi } from '@/lib/api';

export type { Profile };

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

export async function fetchProfileById(profileId: string): Promise<Profile | null> {
  try {
    const { data, error } = await profileApi.getById(profileId);
    if (error) throw new Error(error);
    return data || null;
  } catch (error) {
    console.error('Error fetching profile by ID:', error);
    return null;
  }
}

export async function updateProfile(profileId: string, updateData: Partial<Profile>): Promise<Profile | null> {
  try {
    const { data, error } = await profileApi.updateById(profileId, updateData);
    if (error) throw new Error(error);
    return data || null;
  } catch (error) {
    console.error('Error updating profile:', error);
    return null;
  }
}

export async function fetchAllProfiles(limit: number = 50): Promise<Profile[]> {
  try {
    const { data, error } = await profileApi.getAll(limit);
    if (error) throw new Error(error);
    return data || [];
  } catch (error) {
    console.error('Error fetching all profiles:', error);
    return [];
  }
}

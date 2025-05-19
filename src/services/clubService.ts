import { mapClubDbToClub, ClubDb, Club } from '@/types';
import { clubApi } from '@/lib/api';

export async function fetchClubs(): Promise<Club[]> {
  try {
    const { data, error } = await clubApi.getAll();
    
    if (error) {
      throw new Error(error);
    }

    return (data || []).map(mapClubDbToClub);
  } catch (error) {
    console.error('Error fetching clubs:', error);
    return [];
  }
}

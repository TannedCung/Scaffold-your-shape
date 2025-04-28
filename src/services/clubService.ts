import { supabase } from '@/lib/supabase';
import { mapClubDbToClub, ClubDb, Club } from '@/types';

export async function fetchClubs(): Promise<Club[]> {
  const { data, error } = await supabase
    .from('clubs')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as ClubDb[] | null)?.map(mapClubDbToClub) || [];
}

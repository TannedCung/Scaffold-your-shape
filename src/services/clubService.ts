import { supabase } from '@/lib/supabase';
import { Club } from '@/types';

export async function fetchClubs(): Promise<Club[]> {
  const { data, error } = await supabase
    .from('clubs')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

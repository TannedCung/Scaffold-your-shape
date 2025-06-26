import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { supabase } from '@/lib/supabase';

interface UserClub {
  id: string;
  name: string;
  description: string;
  image_url: string | null;
  member_count: number;
  role: 'admin' | 'member';
  joined_at: string;
}

export function useUserClubs(userId?: string) {
  const { data: session, status } = useSession();
  const [clubs, setClubs] = useState<UserClub[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const effectiveUserId = userId || session?.user?.id;

  const loadClubs = useCallback(async () => {
    if (status === 'loading' || !effectiveUserId) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: clubsError } = await supabase
        .from('club_members')
        .select(`
          role,
          joined_at,
          clubs!inner (
            id,
            name,
            description,
            image_url,
            member_count
          )
        `)
        .eq('user_id', effectiveUserId);

      if (clubsError) throw clubsError;

      const userClubs: UserClub[] = (data || []).map(item => {
        const club = item.clubs as unknown as {
          id: string;
          name: string;
          description: string;
          image_url: string | null;
          member_count: number;
        };
        
        return {
          id: club.id,
          name: club.name,
          description: club.description,
          image_url: club.image_url,
          member_count: club.member_count,
          role: item.role as 'admin' | 'member',
          joined_at: item.joined_at,
        };
      });

      setClubs(userClubs);
    } catch (err) {
      console.error('Error loading user clubs:', err);
      setError(err instanceof Error ? err.message : 'Failed to load clubs');
    } finally {
      setLoading(false);
    }
  }, [effectiveUserId, status]);

  useEffect(() => {
    loadClubs();
  }, [loadClubs]);

  return { clubs, loading, error, refresh: loadClubs };
} 
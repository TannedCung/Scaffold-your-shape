import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { clubApi } from '@/lib/api';
import { ClubMember } from '@/types';

export function useUserClubs() {
  const { data: session } = useSession();
  const [userClubs, setUserClubs] = useState<ClubMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserClubs = async () => {
      if (!session?.user?.id) {
        setLoading(false);
        return;
      }

      try {
        setError(null);
        // This would need a new API endpoint to get user's club memberships
        const { data, error: apiError } = await clubApi.getMyMemberships();
        
        if (apiError) {
          throw new Error(apiError);
        }

                         // Data is already transformed by the API
        setUserClubs(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load user clubs');
      } finally {
        setLoading(false);
      }
    };

    fetchUserClubs();
  }, [session?.user?.id]);

  return { userClubs, loading, error };
} 
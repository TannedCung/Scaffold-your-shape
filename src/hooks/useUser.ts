'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '@/types';
import { profileApi } from '@/lib/api';

interface UserData {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
}

export function useUser() {
  const { data: session, status } = useSession();
  const [userData, setUserData] = useState<UserData>({
    user: null,
    profile: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (status === 'loading') return;
      
      if (!session?.user?.id) {
        setUserData({
          user: null,
          profile: null,
          loading: false,
          error: null
        });
        return;
      }

      try {
        const { data: profile, error } = await profileApi.get();
        
        if (error) {
          throw new Error(error);
        }

        setUserData({
          user: {
            id: session.user.id,
            email: session.user.email || '',
            app_metadata: {},
            user_metadata: {},
            aud: 'authenticated',
            created_at: ''
          } as unknown as User,
          profile: profile || null,
          loading: false,
          error: null
        });
      } catch (error) {
        setUserData({
          user: null,
          profile: null,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to load user data'
        });
      }
    };

    fetchProfile();
  }, [session, status]);

  return userData;
} 
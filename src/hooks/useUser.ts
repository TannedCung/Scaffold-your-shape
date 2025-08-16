'use client';

import { useSession } from 'next-auth/react';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '@/types';
import { useProfile } from '@/contexts/EnsureProfile';

interface UserData {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
}

export function useUser(): UserData {
  const { data: session, status } = useSession();
  const { profile, loading: profileLoading, error: profileError } = useProfile();

  // Create user object from session if available
  const user: User | null = session?.user?.id ? {
    id: session.user.id,
    email: session.user.email || '',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: ''
  } as unknown as User : null;

  return {
    user,
    profile,
    loading: status === 'loading' || profileLoading,
    error: profileError
  };
} 
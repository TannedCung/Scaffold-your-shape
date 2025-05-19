'use client';

import { useSession } from 'next-auth/react';
import type { User } from '@supabase/supabase-js';

interface UserData {
  user: User | null;
  profile: any | null;
  loading: boolean;
  error: string | null;
}

export function useUser() {
  const { data: session, status } = useSession();

  const userData: UserData = {
    user: session?.user ? {
      id: session.user.id,
      email: session.user.email || '',
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      created_at: ''
    } as unknown as User : null,
    profile: session?.user?.profile || null,
    loading: status === 'loading',
    error: null
  };

  return userData;
} 
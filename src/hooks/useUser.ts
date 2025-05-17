'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '@/types';
import { useSession } from 'next-auth/react';

interface UserData {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
}

export function useUser() {
  const { data: session, status: sessionStatus } = useSession();
  const [userData, setUserData] = useState<UserData>({
    user: null,
    profile: null,
    loading: true,
    error: null
  });

  // Function to fetch profile data from Supabase
  const fetchProfileData = async (userId: string) => {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error fetching profile:', profileError);
        return null;
      }
      
      return profile;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  // Function to check Supabase session
  const checkSupabaseSession = useCallback(async () => {
    // Skip if we already have user data from NextAuth
    if (userData.user && !userData.loading) return;
    
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        throw sessionError;
      }
      
      if (!session?.user) {
        if (sessionStatus === 'unauthenticated') {
          // Only set as not loading if NextAuth is also unauthenticated
          setUserData(prev => ({
            ...prev,
            loading: false
          }));
        }
        return;
      }
      
      const profile = await fetchProfileData(session.user.id);
      
      setUserData({
        user: session.user,
        profile: profile,
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Error checking Supabase session:', error);
      if (sessionStatus === 'unauthenticated') {
        // Only update state if NextAuth is also unauthenticated
        setUserData({
          user: null,
          profile: null,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to load user data'
        });
      }
    }
  }, [userData.user, userData.loading, sessionStatus]);

  // Effect for handling NextAuth session
  useEffect(() => {
    const handleNextAuthSession = async () => {
      // If session is loading, wait
      if (sessionStatus === 'loading') {
        return;
      }
      
      // If we have a NextAuth session
      if (session?.user?.id) {
        try {
          const profile = await fetchProfileData(session.user.id);
          
          // Create a compatible user object from NextAuth session
          const nextAuthUser = {
            id: session.user.id,
            email: session.user.email || '',
            app_metadata: {},
            user_metadata: {},
            aud: 'authenticated',
            created_at: ''
          } as unknown as User;
          
          setUserData({
            user: nextAuthUser,
            profile: profile,
            loading: false,
            error: null
          });
        } catch (error) {
          console.error('Error handling NextAuth session:', error);
          setUserData({
            user: null,
            profile: null,
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to load user data'
          });
        }
      } else if (sessionStatus === 'unauthenticated') {
        // If no NextAuth session, try Supabase
        checkSupabaseSession();
      }
    };
    
    handleNextAuthSession();
  }, [session, sessionStatus, checkSupabaseSession]);

  // Effect for handling Supabase session
  useEffect(() => {
    // Subscribe to Supabase auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Skip if we're using NextAuth
        if (sessionStatus === 'authenticated') return;
        
        if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
          if (session?.user) {
            const profile = await fetchProfileData(session.user.id);
            
            setUserData({
              user: session.user,
              profile: profile,
              loading: false,
              error: null
            });
          }
        } else if (event === 'SIGNED_OUT') {
          // Only update if we're not using NextAuth
          if (sessionStatus === 'unauthenticated') {
            setUserData({
              user: null,
              profile: null,
              loading: false,
              error: null
            });
          }
        }
      }
    );
    
    // Initial check
    checkSupabaseSession();
    
    // Cleanup
    return () => {
      subscription.unsubscribe();
    };
  }, [sessionStatus, checkSupabaseSession]);

  return userData;
} 
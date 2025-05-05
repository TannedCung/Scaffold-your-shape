'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '@/types';

interface UserData {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
}

export function useUser() {
  const [userData, setUserData] = useState<UserData>({
    user: null,
    profile: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    // Get the initial user session
    const initUser = async () => {
      try {
        // Get user session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }
        
        if (!session?.user) {
          setUserData({
            user: null,
            profile: null,
            loading: false,
            error: null
          });
          return;
        }
        
        // Get profile data for user
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (profileError && profileError.code !== 'PGRST116') {
          throw profileError;
        }
        
        setUserData({
          user: session.user,
          profile: profile || null,
          loading: false,
          error: null
        });
      } catch (error) {
        console.error('Error loading user:', error);
        setUserData({
          user: null,
          profile: null,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to load user'
        });
      }
    };

    initUser();
    
    // Subscribe to authentication changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
          if (session?.user) {
            try {
              // Get profile data
              const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();
                
              if (profileError && profileError.code !== 'PGRST116') {
                throw profileError;
              }
              
              setUserData({
                user: session.user,
                profile: profile || null,
                loading: false,
                error: null
              });
            } catch (error) {
              console.error('Error loading profile:', error);
              setUserData({
                user: session.user,
                profile: null,
                loading: false,
                error: error instanceof Error ? error.message : 'Failed to load profile'
              });
            }
          }
        } else if (event === 'SIGNED_OUT') {
          setUserData({
            user: null,
            profile: null,
            loading: false,
            error: null
          });
        }
      }
    );

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return userData;
} 
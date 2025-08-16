import { useSession } from 'next-auth/react';
import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { profileApi } from '@/lib/api';
import { Box, CircularProgress, Typography } from '@mui/material';
import type { Profile } from '@/types';

interface ProfileContextType {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | null>(null);

/**
 * Hook to access the current user's profile
 * 
 * This hook provides access to the authenticated user's profile data
 * and manages the loading/error states. It ensures that profile data
 * is fetched only once and cached for the entire application.
 * 
 * @throws {Error} If used outside of ProfileProvider
 * @returns {ProfileContextType} Profile context with data, loading, error states and refetch function
 */
export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within ProfileProvider');
  }
  return context;
}

// Alias for backward compatibility and cleaner naming
export const useCurrentProfile = useProfile;

interface ProfileProviderProps {
  children: React.ReactNode;
}

/**
 * ProfileProvider - Centralized Profile Management
 * 
 * This component provides a centralized way to manage user profile data
 * throughout the application. It implements the following best practices:
 * 
 * 1. **Request Deduplication**: Uses refs to prevent multiple simultaneous requests
 * 2. **Session-based Fetching**: Only fetches when user is authenticated
 * 3. **Automatic Profile Creation**: Creates a profile if it doesn't exist
 * 4. **Error Handling**: Provides comprehensive error states
 * 5. **Loading States**: Manages loading states properly
 * 6. **Refetch Capability**: Allows manual refetching when needed
 * 7. **SSR Compatible**: Handles server-side rendering gracefully
 * 
 * Usage:
 * ```tsx
 * // Wrap your app with ProfileProvider
 * <ProfileProvider>
 *   <YourApp />
 * </ProfileProvider>
 * 
 * // Use the hook in any component
 * const { profile, loading, error, refetch } = useProfile();
 * ```
 * 
 * @param props.children - Child components that will have access to profile context
 */
export function ProfileProvider({ children }: ProfileProviderProps) {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  
  // Use refs to prevent duplicate requests
  const fetchingRef = useRef(false);
  const hasInitializedRef = useRef(false);

  // Detect client-side mounting
  useEffect(() => {
    setIsClient(true);
  }, []);

  const fetchProfile = useCallback(async () => {
    // Prevent duplicate requests
    if (fetchingRef.current) return;
    
    // Wait for session to load
    if (status === 'loading') return;
    
    // Handle unauthenticated state
    if (status !== 'authenticated' || !session?.user?.id) {
      setProfile(null);
      setLoading(false);
      setError(null);
      hasInitializedRef.current = true;
      return;
    }

    fetchingRef.current = true;
    setError(null);

    try {
      const { data, error: fetchError } = await profileApi.get();
      
      if (fetchError) {
        throw new Error(fetchError);
      }
      
      if (!data) {
        // Profile doesn't exist, create it
        const { error: createError } = await profileApi.update({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.name || '',
          avatar_url: session.user.image || undefined,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        
        if (createError) {
          throw new Error(createError);
        }
        
        // Fetch the newly created profile
        const { data: newProfile, error: newFetchError } = await profileApi.get();
        if (newFetchError) {
          throw new Error(newFetchError);
        }
        
        setProfile(newProfile || null);
        console.log('[ProfileProvider] Profile created successfully');
      } else {
        setProfile(data);
      }
    } catch (err) {
      console.error('[ProfileProvider] Error ensuring profile:', err);
      setError(err instanceof Error ? err.message : 'Error ensuring user profile');
      setProfile(null);
    } finally {
      setLoading(false);
      fetchingRef.current = false;
      hasInitializedRef.current = true;
    }
  }, [session, status]);

  useEffect(() => {
    // Only fetch on client-side
    if (isClient && (!hasInitializedRef.current || !fetchingRef.current)) {
      fetchProfile();
    }
  }, [session, status, fetchProfile, isClient]);

  const refetch = async () => {
    if (status === 'authenticated' && session?.user?.id) {
      setLoading(true);
      fetchingRef.current = false; // Reset to allow refetch
      await fetchProfile();
    }
  };

  const contextValue: ProfileContextType = {
    profile,
    loading,
    error,
    refetch,
  };

  // During SSR or before client hydration, render children without blocking
  if (!isClient) {
    return (
      <ProfileContext.Provider value={contextValue}>
        {children}
      </ProfileContext.Provider>
    );
  }

  // On client-side, show loading/error states if needed
  if (loading && hasInitializedRef.current === false) {
    return (
      <ProfileContext.Provider value={contextValue}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress />
        </Box>
      </ProfileContext.Provider>
    );
  }

  if (error && status === 'authenticated') {
    return (
      <ProfileContext.Provider value={contextValue}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <Typography color="error">{error}</Typography>
        </Box>
      </ProfileContext.Provider>
    );
  }

  return (
    <ProfileContext.Provider value={contextValue}>
      {children}
    </ProfileContext.Provider>
  );
}

// Keep the old name for backward compatibility
export default ProfileProvider;

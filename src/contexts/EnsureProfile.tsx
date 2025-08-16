import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { profileApi } from '@/lib/api';
import { Box, CircularProgress, Typography } from '@mui/material';

export default function EnsureProfile({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function ensureProfile() {
      if (status === 'loading') return;
      
      if (status !== 'authenticated' || !session?.user?.id) {
        setIsLoading(false);
        return;
      }
      
      try {
        const { data, error } = await profileApi.get();
        
        if (error) {
          throw new Error(error);
        }
        
        if (!data) {
          const { error: insertError } = await profileApi.update({
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.name || '',
            avatar_url: session.user.image || undefined,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
          
          if (insertError) {
            throw new Error(insertError);
          }
          
          console.log('[EnsureProfile] Profile created successfully');
        }
      } catch (err) {
        console.error('[EnsureProfile] Error ensuring profile:', err);
        setError(err instanceof Error ? err.message : 'Error ensuring user profile');
      } finally {
        setIsLoading(false);
      }
    }
    
    ensureProfile();
  }, [session, status]);
  
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }
  
  return <>{children}</>;
}

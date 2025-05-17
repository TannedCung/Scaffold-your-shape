import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Box, CircularProgress, Typography } from '@mui/material';

export default function EnsureProfile({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function ensureProfile() {
      // Skip if authentication status is still loading
      if (status === 'loading') return;
      
      // Skip if user is not authenticated
      if (status !== 'authenticated' || !session?.user?.id) {
        setIsLoading(false);
        return;
      }
      
      try {
        
        // Check if profile exists
        const { data, error } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', session.user.id)
          .maybeSingle();
          
        if (error) {
          throw error;
        }
          
        if (!data) {
          
          // Insert new profile
          const { error: insertError } = await supabase.from('profiles').insert([
            {
              id: session.user.id,
              email: session.user.email || '',
              name: session.user.name || '',
              avatar_url: session.user.image || null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ]);
          
          if (insertError) {
            throw insertError;
          }
          
          console.log('[EnsureProfile] Profile created successfully');
        } else {
          console.log('[EnsureProfile] Profile already exists');
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

  if (isLoading && status === 'loading') {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', pt: 4 }}>
        <CircularProgress sx={{ mb: 2 }} />
        <Typography variant="body2" color="text.secondary">Loading your profile...</Typography>
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="error">Error loading profile: {error}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Try refreshing the page. If the problem persists, please contact support.
        </Typography>
      </Box>
    );
  }

  return <>{children}</>;
}

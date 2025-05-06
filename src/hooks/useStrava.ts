'use client';

import { useState, useEffect } from 'react';
import { useUser } from './useUser';
import { useRouter, useSearchParams } from 'next/navigation';
import { getStravaAuthUrl, disconnectFromStrava } from '@/services/stravaClientService';

export function useStrava() {
  const { user, profile, loading: userLoading } = useUser();
  const [connected, setConnected] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check connection status on component mount
  useEffect(() => {
    function checkStravaConnection() {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        // Check if we have strava_id in the profile
        if (profile?.strava_id) {
          setConnected(true);
          setLoading(false);
          return;
        } else {
          setConnected(false);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error checking Strava connection:', err);
        setError('Failed to check Strava connection');
        setLoading(false);
      }
    }

    if (!userLoading) {
      checkStravaConnection();
    }

    // Check for Strava callback errors or success
    const stravaError = searchParams?.get('strava_error');
    const stravaConnected = searchParams?.get('strava_connected');

    if (stravaError) {
      setError(`Strava connection error: ${stravaError}`);
    } else if (stravaConnected === 'true') {
      setConnected(true);
      setError(null);
    }
  }, [user?.id, profile?.strava_id, userLoading, searchParams]);

  // Initialize connect flow
  const connectToStrava = () => {
    try {
      const authUrl = getStravaAuthUrl();
      window.location.href = authUrl;
    } catch (err) {
      console.error('Error starting Strava connection:', err);
      setError('Failed to start Strava connection');
    }
  };

  // Disconnect from Strava
  const handleDisconnectFromStrava = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const result = await disconnectFromStrava();

      if (result.success) {
        setConnected(false);
        setError(null);
        // Reload to ensure UI reflects the changes
        router.refresh();
      } else {
        setError('Failed to disconnect from Strava');
      }
    } catch (err) {
      console.error('Error disconnecting from Strava:', err);
      setError('Failed to disconnect from Strava');
    } finally {
      setLoading(false);
    }
  };

  return {
    connected,
    loading: loading || userLoading,
    error,
    connectToStrava,
    disconnectFromStrava: handleDisconnectFromStrava,
  };
} 
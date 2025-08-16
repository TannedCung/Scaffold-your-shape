'use server';

import { Profile } from '@/types';
import { profileApi } from '@/lib/api';
import { getSession } from 'next-auth/react';

// Strava API endpoints
const STRAVA_AUTH_URL = 'https://www.strava.com/oauth/authorize';
const STRAVA_TOKEN_URL = 'https://www.strava.com/oauth/token';
const STRAVA_API_URL = 'https://www.strava.com/api/v3';

// Scopes needed for our application
const STRAVA_SCOPES = ['read', 'activity:read', 'activity:read_all'];

/**
 * Get the Strava authorization URL for OAuth flow
 */
export async function getStravaAuthUrl() {
  const params = new URLSearchParams({
    client_id: process.env.STRAVA_CLIENT_ID || '',
    redirect_uri: process.env.STRAVA_REDIRECT_URI || '',
    response_type: 'code',
    approval_prompt: 'auto',
    scope: STRAVA_SCOPES.join(','),
  });

  return `${STRAVA_AUTH_URL}?${params.toString()}`;
}

/**
 * Exchange authorization code for access and refresh tokens
 */
export async function exchangeStravaCode(code: string) {
  try {
    const response = await fetch(STRAVA_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.STRAVA_CLIENT_ID,
        client_secret: process.env.STRAVA_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
      }),
    });

    if (!response.ok) {
      throw new Error(`Error exchanging code: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error exchanging Strava code:', error);
    throw error;
  }
}

/**
 * Refresh the Strava access token if it's expired
 */
export async function refreshStravaToken(userId: string, refreshToken: string) {
  try {
    const response = await fetch(STRAVA_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.STRAVA_CLIENT_ID,
        client_secret: process.env.STRAVA_CLIENT_SECRET,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      throw new Error(`Error refreshing token: ${response.statusText}`);
    }

    const tokenData = await response.json();

    // Update the tokens in the database
    await profileApi.update({
      strava_access_token: tokenData.access_token,
      strava_refresh_token: tokenData.refresh_token,
      strava_token_expires_at: tokenData.expires_at,
      updated_at: new Date().toISOString(),
    });

    return tokenData;
  } catch (error) {
    console.error('Error refreshing Strava token:', error);
    throw error;
  }
}

/**
 * Get a valid Strava access token, refreshing if necessary
 */
export async function getValidStravaToken(profile: Profile) {
  if (!profile.strava_refresh_token) {
    throw new Error('User not connected to Strava');
  }

  const now = Math.floor(Date.now() / 1000);
  const isExpired = !profile.strava_token_expires_at || profile.strava_token_expires_at < now + 60;

  if (isExpired) {
    const newTokens = await refreshStravaToken(profile.id, profile.strava_refresh_token);
    return newTokens.access_token;
  }

  return profile.strava_access_token;
}

/**
 * Connect a user's profile to Strava
 */
export async function connectProfileToStrava(cookie: string, stravaCode: string) {
  try {
    const tokenData = await exchangeStravaCode(stravaCode);
    const { error } = await profileApi.update({
      strava_id: tokenData.athlete.id.toString(),
      strava_access_token: tokenData.access_token,
      strava_refresh_token: tokenData.refresh_token,
      strava_token_expires_at: tokenData.expires_at,
      updated_at: new Date().toISOString(),
    }, cookie);

    if (error) throw new Error(error);

    return { success: true };
  } catch (error) {
    console.error('Error connecting profile to Strava:', error);
    return { success: false, error };
  }
}

/**
 * Disconnect a user's profile from Strava
 */
export async function disconnectProfileFromStrava(cookie: string) {
  try {
    const { data: profile, error: fetchError } = await profileApi.get(cookie);

    if (fetchError) throw new Error(fetchError);

    if (profile?.strava_access_token) {
      try {
        await fetch(`${STRAVA_API_URL}/oauth/deauthorize`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${profile.strava_access_token}`,
          },
        });
      } catch (deauthError) {
        console.error('Error deauthorizing from Strava:', deauthError);
      }
    }
    const { error: updateError } = await profileApi.update({
      strava_id: undefined,
      strava_access_token: undefined,
      strava_refresh_token: undefined,
      strava_token_expires_at: undefined,
      updated_at: new Date().toISOString(),
    }, cookie);

    if (updateError) throw new Error(updateError);

    return { success: true };
  } catch (error) {
    console.error('Error disconnecting profile from Strava:', error);
    return { success: false, error };
  }
}

/**
 * Get athlete information from Strava
 */
export async function getStravaAthlete(profile: Profile) {
  try {
    const accessToken = await getValidStravaToken(profile);

    const response = await fetch(`${STRAVA_API_URL}/athlete`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Error fetching athlete: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching Strava athlete:', error);
    throw error;
  }
}

/**
 * Get athlete activities from Strava
 */
export async function getStravaActivities(profile: Profile, params: { 
  page?: number;
  per_page?: number;
  before?: number;
  after?: number;
} = {}) {
  try {
    const accessToken = await getValidStravaToken(profile);

    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.per_page) queryParams.append('per_page', params.per_page.toString());
    if (params.before) queryParams.append('before', params.before.toString());
    if (params.after) queryParams.append('after', params.after.toString());

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    
    const url = `${STRAVA_API_URL}/athlete/activities${queryString}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Strava API error:", response.status, errorText);
      throw new Error(`Error fetching activities: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.error('Error fetching Strava activities:', error);
    throw error;
  }
}

/**
 * Check if a user is connected to Strava
 */
export async function isConnectedToStrava(userId: string): Promise<boolean> {
  try {
    const { data, error } = await profileApi.get();

    if (error) throw new Error(error);

    return !!(data?.strava_id && data?.strava_refresh_token);
  } catch (error) {
    console.error('Error checking Strava connection:', error);
    return false;
  }
}

// Map Strava activity types to our system's types
async function mapStravaType(stravaType: string): Promise<string> {
  const typeMap: Record<string, string> = {
    'Run': 'run',
    'Walk': 'walk',
    'Hike': 'hike',
    'Ride': 'cycle',
    'Swim': 'swim',
    'WeightTraining': 'workout',
    'Workout': 'workout',
    'Yoga': 'workout',
    'CrossFit': 'workout',
  };

  return typeMap[stravaType] || 'run';
}
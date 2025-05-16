'use client';

// Strava API endpoints
const STRAVA_AUTH_URL = 'https://www.strava.com/oauth/authorize';

// Scopes needed for our application
const STRAVA_SCOPES = ['read', 'activity:read', 'activity:read_all'];

/**
 * Get the Strava authorization URL for OAuth flow
 */
export function getStravaAuthUrl() {
  const params = new URLSearchParams({
    client_id: process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID || '',
    redirect_uri: `${window.location.origin}/api/auth/strava/callback`,
    response_type: 'code',
    approval_prompt: 'auto',
    scope: STRAVA_SCOPES.join(','),
  });

  return `${STRAVA_AUTH_URL}?${params.toString()}`;
}

/**
 * Disconnect from Strava
 */
export async function disconnectFromStrava() {
  try {
    const response = await fetch('/api/auth/strava/disconnect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return await response.json();
  } catch (error) {
    console.error('Error disconnecting from Strava:', error);
    throw error;
  }
}

/**
 * Import activities from Strava
 */
export async function importActivitiesFromStrava(options: { 
  per_page?: number; 
  page?: number;
  before?: number;
  after?: number;
} = {}) {
  console.log('Importing activities from Strava with options:', options);
  try {
    // Make sure we only send non-undefined values to avoid errors in parsing
    const params: Record<string, number> = {
      per_page: options.per_page || 30,
      page: options.page || 1
    };
    
    // Only add before/after if they are defined
    if (options.before !== undefined) {
      params.before = options.before;
    }
    
    if (options.after !== undefined) {
      params.after = options.after;
    }
    
    console.log('Sending params to API:', params);
    
    const response = await fetch('/api/strava/import-activities', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response from import API:', response.status, errorText);
      throw new Error(`Import API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Import API response:', data);
    return data;
  } catch (error) {
    console.error('Error importing activities from Strava:', error);
    throw error;
  }
}
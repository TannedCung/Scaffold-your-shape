import { Profile, Activity, ActivityPointConversion, Club, Challenge, ActivityWithDetails, ChallengeDb, ClubDb } from '@/types';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'An error occurred' };
    }

    return { data };
  } catch (error) {
    return { error: 'Network error' };
  }
}

// Profile API functions
export const profileApi = {
  get: () => fetchApi<Profile>('/api/profiles'),
  update: (data: Partial<Profile>) => 
    fetchApi<Profile>('/api/profiles', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

// Activity API functions
export const activityApi = {
  getAll: () => fetchApi<Activity[]>('/api/activities'),
  getWithDetails: () => fetchApi<ActivityWithDetails[]>('/api/activities/with-details'),
  getById: (id: string) => fetchApi<ActivityWithDetails>(`/api/activities/${id}`),
  create: (data: Partial<Activity>) => fetchApi<Activity>('/api/activities', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: Partial<Activity>) => fetchApi<Activity>(`/api/activities/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => fetchApi<void>(`/api/activities/${id}`, {
    method: 'DELETE',
  }),
  batchDelete: (ids: string[]) => fetchApi<void>('/api/activities/batch', {
    method: 'DELETE',
    body: JSON.stringify({ ids }),
  }),
  getStats: (userId: string) => fetchApi<{
    total: number;
    byType: Record<string, number>;
    recentStreak: number;
  }>(`/api/activities/stats?userId=${userId}`),
};

// Activity Point Conversion API functions
export const activityPointApi = {
  getConversions: () => fetchApi<ActivityPointConversion[]>('/api/activity-points/conversion'),
  getClubConversions: (clubId: string) => fetchApi<ActivityPointConversion[]>(`/api/activity-points/club/${clubId}`),
  getChallengeConversions: (challengeId: string) => fetchApi<ActivityPointConversion[]>(`/api/activity-points/challenge/${challengeId}`),
  upsertConversions: (rates: ActivityPointConversion[]) => fetchApi<void>('/api/activity-points/conversion', {
    method: 'PUT',
    body: JSON.stringify(rates),
  }),
  upsertClubConversions: (clubId: string, rates: ActivityPointConversion[]) => fetchApi<void>(`/api/activity-points/club/${clubId}`, {
    method: 'PUT',
    body: JSON.stringify(rates),
  }),
  upsertChallengeConversions: (challengeId: string, rates: ActivityPointConversion[]) => fetchApi<void>(`/api/activity-points/challenge/${challengeId}`, {
    method: 'PUT',
    body: JSON.stringify(rates),
  }),
};

// Club API functions
export const clubApi = {
  getAll: () => fetchApi<ClubDb[]>('/api/clubs'),
  getById: (id: string) => fetchApi<Club>(`/api/clubs/${id}`),
  create: (data: Partial<Club>) => 
    fetchApi<Club>('/api/clubs', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<Club>) => 
    fetchApi<Club>(`/api/clubs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) => 
    fetchApi<{ success: boolean }>(`/api/clubs/${id}`, {
      method: 'DELETE',
    }),
};

// Challenge API functions
export const challengeApi = {
  getAll: () => fetchApi<ChallengeDb[]>('/api/challenges'),
  getById: (id: string) => fetchApi<Challenge>(`/api/challenges/${id}`),
  create: (data: Partial<Challenge>) => 
    fetchApi<Challenge>('/api/challenges', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<Challenge>) => 
    fetchApi<Challenge>(`/api/challenges/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) => 
    fetchApi<{ success: boolean }>(`/api/challenges/${id}`, {
      method: 'DELETE',
    }),
}; 
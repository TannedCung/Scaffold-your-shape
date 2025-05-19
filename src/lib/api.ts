import { Profile, Activity, ActivityPointConversion, Club, Challenge, ActivityWithDetails } from '@/types';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`/api/${endpoint}`, {
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
  get: () => fetchApi<Profile>('profiles'),
  update: (data: Partial<Profile>) => 
    fetchApi<Profile>('profiles', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

// Activity API functions
export const activityApi = {
  getAll: () => fetchApi<Activity[]>('activities'),
  getWithDetails: () => fetchApi<ActivityWithDetails[]>('activities/with-details'),
  getById: (id: string) => fetchApi<ActivityWithDetails>(`activities/${id}`),
  create: (data: Partial<Activity>) => 
    fetchApi<Activity>('activities', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<Activity>) => 
    fetchApi<Activity>(`activities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) => 
    fetchApi<{ success: boolean }>(`activities/${id}`, {
      method: 'DELETE',
    }),
};

// Activity Point Conversion API functions
export const activityPointApi = {
  getConversions: () => fetchApi<ActivityPointConversion[]>('activity-points/conversion'),
};

// Club API functions
export const clubApi = {
  getAll: () => fetchApi<Club[]>('clubs'),
  getById: (id: string) => fetchApi<Club>(`clubs/${id}`),
  create: (data: Partial<Club>) => 
    fetchApi<Club>('clubs', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<Club>) => 
    fetchApi<Club>(`clubs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) => 
    fetchApi<{ success: boolean }>(`clubs/${id}`, {
      method: 'DELETE',
    }),
};

// Challenge API functions
export const challengeApi = {
  getAll: () => fetchApi<Challenge[]>('challenges'),
  getById: (id: string) => fetchApi<Challenge>(`challenges/${id}`),
  create: (data: Partial<Challenge>) => 
    fetchApi<Challenge>('challenges', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<Challenge>) => 
    fetchApi<Challenge>(`challenges/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) => 
    fetchApi<{ success: boolean }>(`challenges/${id}`, {
      method: 'DELETE',
    }),
}; 
import { Profile, Activity, ActivityPointConversion, Club, Challenge, ActivityWithDetails, ChallengeDb, ClubDb, ChallengeParticipant, ChallengeLeaderboard, ClubMember, LeaderboardResult } from '@/types';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {},
  extra?: { cookie?: string; token?: string }
): Promise<ApiResponse<T>> {
  // If running on the server, use an absolute URL
  let url = endpoint;
  if (typeof window === 'undefined') {
    const base =
      process.env.NEXTAUTH_URL ||
      process.env.NEXT_PUBLIC_BASE_URL ||
      'http://localhost:3005';
    url = endpoint.startsWith('http') ? endpoint : `${base}${endpoint}`;
  }

  // Ensure headers is always a plain object
  const baseHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const mergedHeaders: Record<string, string> = Object.assign(
    {},
    baseHeaders,
    typeof options.headers === 'object' && options.headers !== null && !Array.isArray(options.headers) ? options.headers : {},
    extra?.cookie ? { cookie: extra.cookie } : {},
    extra?.token ? { Authorization: `Bearer ${extra.token}` } : {}
  );

  try {
    const response = await fetch(url, {
      ...options,
      headers: mergedHeaders,
      credentials: 'include',
    });

    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      console.error('Error parsing JSON:', jsonError);
      return { error: 'Invalid server response' };
    }

    if (!response.ok) {
      console.error('API error:', data);
      return { error: data.error || 'An error occurred' };
    }

    return { data };
  } catch (error) {
    console.error('fetchApi network error:', error);
    return { error: 'Network error' };
  }
}

// Profile API functions
export const profileApi = {
  get: (cookie?: string) => fetchApi<Profile>('/api/profiles', {}, { cookie }),
  getById: (id: string, cookie?: string) => fetchApi<Profile>(`/api/profiles/${id}`, {}, { cookie }),
  getAll: (limit?: number, cookie?: string) => {
    const url = limit ? `/api/profiles?limit=${limit}` : '/api/profiles/all';
    return fetchApi<Profile[]>(url, {}, { cookie });
  },
  update: (data: Partial<Profile>, cookie?: string) => 
    fetchApi<Profile>('/api/profiles', {
      method: 'PUT',
      body: JSON.stringify(data),
    }, { cookie }),
  updateById: (id: string, data: Partial<Profile>, cookie?: string) => 
    fetchApi<Profile>(`/api/profiles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, { cookie }),
};

// Activity API functions
export const activityApi = {
  getAll: (limit?: number) => {
    const url = limit ? `/api/activities?limit=${limit}` : '/api/activities';
    return fetchApi<Activity[]>(url);
  },
  search: (query: string, limit?: number) => {
    const params = new URLSearchParams({ query });
    if (limit) params.append('limit', limit.toString());
    return fetchApi<Activity[]>(`/api/activities/search?${params}`);
  },
  getWithDetails: () => fetchApi<ActivityWithDetails[]>('/api/activities/with-details'),
  getById: (id: string) => fetchApi<ActivityWithDetails>(`/api/activities/${id}`),
  create: (data: Partial<Activity>) => fetchApi<Activity>('/api/activities', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: Partial<Activity>) => fetchApi<Activity>(`/api/activities/${id}`, {
    method: 'PATCH',
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
  join: (id: string) => 
    fetchApi<{ success: boolean }>(`/api/clubs/${id}/join`, {
      method: 'POST',
    }),
  leave: (id: string) => 
    fetchApi<{ success: boolean }>(`/api/clubs/${id}/join`, {
      method: 'DELETE',
    }),
  updateMemberRole: (clubId: string, memberId: string, role: 'admin' | 'member') => 
    fetchApi<{ success: boolean }>(`/api/clubs/${clubId}/members/${memberId}`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    }),
  removeMember: (clubId: string, memberId: string) => 
    fetchApi<{ success: boolean }>(`/api/clubs/${clubId}/members/${memberId}`, {
      method: 'DELETE',
    }),
  getMembers: (id: string, params?: { limit?: number; offset?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.offset) searchParams.set('offset', params.offset.toString());
    
    const url = `/api/clubs/${id}/members${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    return fetchApi<ClubMember[]>(url);
  },
  getMyMemberships: () => 
    fetchApi<ClubMember[]>('/api/clubs/my-memberships'),
};

// Challenge API functions
export const challengeApi = {
  getAll: (params?: {
    status?: string;
    featured?: boolean;
    type?: string;
    clubId?: string;
    limit?: number;
    offset?: number;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.featured !== undefined) searchParams.set('featured', params.featured.toString());
    if (params?.type) searchParams.set('type', params.type);
    if (params?.clubId) searchParams.set('clubId', params.clubId);
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.offset) searchParams.set('offset', params.offset.toString());
    
    const url = `/api/challenges${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    return fetchApi<ChallengeDb[]>(url);
  },
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
  getLeaderboard: (id: string, params?: { limit?: number; offset?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.offset) searchParams.set('offset', params.offset.toString());
    
    const url = `/api/challenges/${id}/leaderboard${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    return fetchApi<ChallengeLeaderboard[]>(url);
  },
  join: (id: string) => 
    fetchApi<{ success: boolean }>(`/api/challenges/${id}/join`, {
      method: 'POST',
    }),
  leave: (id: string) => 
    fetchApi<{ success: boolean }>(`/api/challenges/${id}/join`, {
      method: 'DELETE',
    }),
  updateProgress: (id: string, data: { currentValue: number; notes?: string }) => 
    fetchApi<{ success: boolean }>(`/api/challenges/${id}/progress`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  getMyParticipations: () => 
    fetchApi<ChallengeParticipant[]>('/api/challenges/my-participations'),
};

// Leaderboard API functions
export const leaderboardApi = {
  getClubLeaderboard: (clubId: string, params?: { 
    activityType?: string; 
    limit?: number; 
    offset?: number; 
    rebuild?: boolean; 
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.activityType) searchParams.set('activityType', params.activityType);
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.offset) searchParams.set('offset', params.offset.toString());
    if (params?.rebuild) searchParams.set('rebuild', 'true');
    
    const url = `/api/clubs/${clubId}/leaderboard${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    return fetchApi<LeaderboardResult>(url);
  },
  rebuildClubLeaderboard: (clubId: string, activityType: string) => 
    fetchApi<{ success: boolean }>(`/api/clubs/${clubId}/leaderboard`, {
      method: 'POST',
      body: JSON.stringify({ activityType }),
    }),
}; 
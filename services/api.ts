import {
  Profile,
  Court,
  CourtReview,
  Match,
  EloAdjustmentResult,
  LeaderboardEntry,
  Booking,
  UserRole,
} from '../src/types.ts';

const API_BASE_URL =
  (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL) || '';

let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (typeof window !== 'undefined' && window.localStorage) {
    if (token) {
      window.localStorage.setItem('pickleplay_token', token);
    } else {
      window.localStorage.removeItem('pickleplay_token');
    }
  }
};

export const getStoredAuthToken = (): string | null => {
  if (authToken) return authToken;
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage.getItem('pickleplay_token');
  }
  return null;
};

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `HTTP error ${response.status}: ${response.statusText}`);
  }

  return data as T;
}

export const api = {
  auth: {
    login: async (email?: string, role?: UserRole) => {
      const res = await request<{ success: boolean; token: string; user: Profile }>(
        '/api/auth/login',
        {
          method: 'POST',
          body: JSON.stringify({ email, role }),
        }
      );
      setAuthToken(res.token);
      return res;
    },
    register: async (params: { full_name: string; email: string; role: UserRole; dupr_id?: string }) => {
      const res = await request<{ success: boolean; token: string; user: Profile }>(
        '/api/auth/register',
        {
          method: 'POST',
          body: JSON.stringify(params),
        }
      );
      setAuthToken(res.token);
      return res;
    },
    getMe: async () => {
      return request<{ success: boolean; user: Profile }>('/api/auth/me');
    },
    updateProfile: async (params: { full_name?: string; email?: string; phone?: string }) => {
      return request<{ success: boolean; user: Profile }>('/api/auth/profile', {
        method: 'PATCH',
        body: JSON.stringify(params),
      });
    },
    getDemoUsers: async () => {
      return request<{ success: boolean; data: Profile[] }>('/api/auth/demo-users');
    },
  },
  courts: {
    getCourts: async () => {
      return request<{ success: boolean; count: number; data: Court[] }>('/api/courts');
    },
    getCourtById: async (id: string) => {
      return request<{ success: boolean; data: Court & { availableSlots: any[] } }>(`/api/courts/${id}`);
    },
    addReview: async (courtId: string, params: {
      rating: number;
      comment: string;
      tags?: string[];
      user_name?: string;
      user_avatar?: string;
      user_role?: string;
      user_id?: string;
    }) => {
      return request<{ success: boolean; review: CourtReview; court: Court }>(
        `/api/courts/${courtId}/reviews`,
        {
          method: 'POST',
          body: JSON.stringify(params),
        }
      );
    },
  },
  matches: {
    getMatches: async (status?: string) => {
      const query = status ? `?status=${status}` : '';
      return request<{ success: boolean; count: number; data: Match[] }>(`/api/matches${query}`);
    },
    getMatchById: async (id: string) => {
      return request<{ success: boolean; data: Match }>(`/api/matches/${id}`);
    },
    createMatch: async (params: {
      courtId: string;
      gameType: 'singles' | 'doubles';
      minRating: number;
      maxRating: number;
      scheduledAt?: string;
    }) => {
      return request<{ success: boolean; data: Match }>('/api/matches', {
        method: 'POST',
        body: JSON.stringify(params),
      });
    },
    joinMatch: async (matchId: string) => {
      return request<{ success: boolean; message: string; data: Match }>(`/api/matches/${matchId}/join`, {
        method: 'POST',
      });
    },
  },
  scores: {
    /**
     * CRITICAL ADMIN-ONLY ENDPOINT
     * Only users with role = 'court_admin' can submit scores!
     */
    submitScore: async (matchId: string, teamAScore: number, teamBScore: number) => {
      return request<{
        success: boolean;
        message: string;
        match: Match;
        eloResult: EloAdjustmentResult;
      }>('/api/scores/submit', {
        method: 'POST',
        body: JSON.stringify({ matchId, teamAScore, teamBScore }),
      });
    },
    updateLiveScore: async (matchId: string, teamAScore: number, teamBScore: number) => {
      return request<{ success: boolean; match: Match }>('/api/scores/live-update', {
        method: 'POST',
        body: JSON.stringify({ matchId, teamAScore, teamBScore }),
      });
    },
  },
  leaderboard: {
    getLeaderboard: async (tier?: string, search?: string) => {
      const params = new URLSearchParams();
      if (tier && tier !== 'all') params.append('tier', tier);
      if (search) params.append('search', search);
      const query = params.toString() ? `?${params.toString()}` : '';
      return request<{
        success: boolean;
        total: number;
        tierFilter: string;
        tierBreakdown: Record<string, number>;
        data: LeaderboardEntry[];
      }>(`/api/leaderboard${query}`);
    },
  },
  payments: {
    createPaymentIntent: async (params: {
      courtId: string;
      bookingTime?: string;
      durationHours?: number;
      courtNumber?: number;
    }) => {
      return request<{
        success: boolean;
        clientSecret: string;
        paymentIntentId: string;
        totalAmount: number;
        currency: string;
        booking: Booking;
      }>('/api/payments/create-payment-intent', {
        method: 'POST',
        body: JSON.stringify(params),
      });
    },
    confirmPayment: async (bookingId: string, paymentIntentId: string) => {
      return request<{
        success: boolean;
        message: string;
        bookingId: string;
        status: string;
      }>('/api/payments/confirm', {
        method: 'POST',
        body: JSON.stringify({ bookingId, paymentIntentId }),
      });
    },
  },
  dupr: {
    syncDupr: async (duprId?: string) => {
      return request<{
        success: boolean;
        message: string;
        duprId: string;
        skillRating: number;
        reliabilityScore: string;
        lastVerifiedAt: string;
        profile: Profile;
      }>('/api/dupr/sync', {
        method: 'POST',
        body: JSON.stringify({ duprId }),
      });
    },
  },
};

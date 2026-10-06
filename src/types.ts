export type UserRole = 'player' | 'court_admin';

export type RankTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'Pickle Master';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  role: UserRole;
  rank_points: number;
  rank_tier: RankTier;
  total_xp: number;
  wins: number;
  losses: number;
  dupr_id?: string;
  skill_rating: number; // 1.00 - 5.50
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CourtReview {
  id: string;
  court_id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  user_role?: string;
  rating: number; // 1 to 5
  comment: string;
  tags?: string[];
  created_at: string;
}

export interface Court {
  id: string;
  name: string;
  owner_id: string;
  address: string;
  total_courts: number;
  is_indoor: boolean;
  hourly_rate: number;
  surface_type: string;
  amenities: string[];
  image_url: string;
  average_rating?: number;
  reviews_count?: number;
  reviews?: CourtReview[];
  created_at?: string;
}

export interface Booking {
  id: string;
  user_id: string;
  court_id: string;
  court_number: number;
  booking_time: string;
  duration_hours: number;
  total_amount: number;
  stripe_payment_intent_id?: string;
  payment_status: 'pending' | 'succeeded' | 'failed' | 'refunded';
  created_at?: string;
}

export type MatchStatus = 'open' | 'in_progress' | 'completed' | 'cancelled';
export type GameType = 'singles' | 'doubles';
export type TeamLetter = 'A' | 'B';

export interface MatchPlayer {
  id: string;
  match_id: string;
  player_id: string;
  team: TeamLetter;
  rating_before?: number;
  rating_after?: number;
  xp_earned?: number;
  player?: Profile;
}

export interface Match {
  id: string;
  host_id: string;
  court_id: string;
  scheduled_at: string;
  game_type: GameType;
  min_rating: number;
  max_rating: number;
  status: MatchStatus;
  winner_team?: TeamLetter | null;
  team_a_score: number;
  team_b_score: number;
  scored_by_admin_id?: string | null;
  completed_at?: string | null;
  created_at?: string;
  court?: Court;
  players?: MatchPlayer[];
  scorer_admin?: Profile;
}

export interface PlayerRatingAdjustment {
  playerId: string;
  fullName: string;
  avatarUrl?: string;
  team: TeamLetter;
  ratingBefore: number;
  ratingAfter: number;
  ratingDelta: number;
  tierBefore: RankTier;
  tierAfter: RankTier;
  promoted: boolean;
  demoted: boolean;
  xpEarned: number;
  totalXp: number;
  skillRatingBefore: number;
  skillRatingAfter: number;
  duprSynced: boolean;
}

export interface EloAdjustmentResult {
  winnerTeam: TeamLetter;
  teamAScore: number;
  teamBScore: number;
  margin: number;
  expectedA: number;
  expectedB: number;
  kFactor: number;
  adjustments: PlayerRatingAdjustment[];
  scoredByAdminId: string;
}

export interface LeaderboardEntry extends Profile {
  ladder_rank: number;
  win_rate: number;
  total_matches: number;
  recent_form: ('W' | 'L')[];
}

import { Profile, Court, Match, Booking, LeaderboardEntry, MatchPlayer } from '../src/types.ts';

// Initial Mock Profiles
let profiles: Profile[] = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    full_name: 'Coach Marcus Sterling',
    email: 'marcus@pickleplay.com',
    role: 'court_admin',
    rank_points: 2240,
    rank_tier: 'Diamond',
    total_xp: 8400,
    wins: 78,
    losses: 14,
    dupr_id: 'DUPR-99214',
    skill_rating: 4.85,
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80',
    created_at: new Date(Date.now() - 90 * 86400000).toISOString(),
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    full_name: 'Taylor Vance',
    email: 'taylor@pickleplay.com',
    role: 'player',
    rank_points: 1680,
    rank_tier: 'Gold',
    total_xp: 4250,
    wins: 42,
    losses: 19,
    dupr_id: 'DUPR-54812',
    skill_rating: 4.15,
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80',
    created_at: new Date(Date.now() - 45 * 86400000).toISOString(),
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    full_name: 'Jordan Cruz',
    email: 'jordan@pickleplay.com',
    role: 'player',
    rank_points: 1940,
    rank_tier: 'Platinum',
    total_xp: 6120,
    wins: 58,
    losses: 22,
    dupr_id: 'DUPR-38190',
    skill_rating: 4.45,
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&h=200&q=80',
    created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
  },
  {
    id: '00000000-0000-0000-0000-000000000004',
    full_name: 'Elena Rostova',
    email: 'elena@pickleplay.com',
    role: 'player',
    rank_points: 2490,
    rank_tier: 'Pickle Master',
    total_xp: 11300,
    wins: 94,
    losses: 11,
    dupr_id: 'DUPR-10294',
    skill_rating: 5.15,
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&h=200&q=80',
    created_at: new Date(Date.now() - 120 * 86400000).toISOString(),
  },
  {
    id: '00000000-0000-0000-0000-000000000005',
    full_name: 'Devon Hayes',
    email: 'devon@pickleplay.com',
    role: 'player',
    rank_points: 1340,
    rank_tier: 'Silver',
    total_xp: 2100,
    wins: 24,
    losses: 21,
    dupr_id: 'DUPR-77319',
    skill_rating: 3.65,
    avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&h=200&q=80',
    created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
  },
  {
    id: '00000000-0000-0000-0000-000000000006',
    full_name: 'Maya Lin',
    email: 'maya@pickleplay.com',
    role: 'player',
    rank_points: 1560,
    rank_tier: 'Gold',
    total_xp: 3890,
    wins: 36,
    losses: 18,
    dupr_id: 'DUPR-62401',
    skill_rating: 3.95,
    avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&h=200&q=80',
    created_at: new Date(Date.now() - 35 * 86400000).toISOString(),
  },
  {
    id: '00000000-0000-0000-0000-000000000007',
    full_name: 'Sam "Spin" Kowalski',
    email: 'sam@pickleplay.com',
    role: 'player',
    rank_points: 2180,
    rank_tier: 'Diamond',
    total_xp: 7950,
    wins: 72,
    losses: 28,
    dupr_id: 'DUPR-44129',
    skill_rating: 4.70,
    avatar_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&h=200&q=80',
    created_at: new Date(Date.now() - 80 * 86400000).toISOString(),
  },
  {
    id: '00000000-0000-0000-0000-000000000008',
    full_name: 'Chloe Bennett',
    email: 'chloe@pickleplay.com',
    role: 'player',
    rank_points: 1120,
    rank_tier: 'Bronze',
    total_xp: 1450,
    wins: 14,
    losses: 18,
    dupr_id: 'DUPR-88412',
    skill_rating: 3.10,
    avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&h=200&q=80',
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
  },
];

// Initial Courts (Tagum City, Davao del Norte, Philippines)
let courts: Court[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'City Pickle Grounds (CPG) - Tagum',
    owner_id: '00000000-0000-0000-0000-000000000001',
    address: 'National Highway, Brgy. Mankilam, Tagum City, Davao del Norte, Philippines',
    total_courts: 6,
    is_indoor: true,
    hourly_rate: 350.0,
    surface_type: 'International Tournament Cushion Acrylic',
    amenities: ['24/7 Night Floodlights', 'DUPR Verified Cameras', 'Pro Shop & Rental Paddles', 'Hydration Bar', 'Locker Suites'],
    image_url: '/src/assets/images/pickleball_court_hero_1790512672504.jpg',
    created_at: new Date(Date.now() - 100 * 86400000).toISOString(),
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'M Central Pickleball Club',
    owner_id: '00000000-0000-0000-0000-000000000001',
    address: 'Doña Regina Dalisay Avenue, Tagum City, Davao del Norte, Philippines',
    total_courts: 4,
    is_indoor: false,
    hourly_rate: 280.0,
    surface_type: 'All-Weather Championship Acrylic',
    amenities: ['Open Until 2:00 AM', 'Spectator Bleachers', 'Referees on Duty', 'Player Lounge Cafe'],
    image_url: '/src/assets/images/court_venue_metro_1790512684659.jpg',
    created_at: new Date(Date.now() - 85 * 86400000).toISOString(),
  },
  {
    id: '33333333-3333-3333-3333-333333333330',
    name: 'Picklezone Tagum & Indoor Arena',
    owner_id: '00000000-0000-0000-0000-000000000001',
    address: 'Purok 4, Brgy. Magugpo East, Tagum City, Davao del Norte, Philippines',
    total_courts: 4,
    is_indoor: true,
    hourly_rate: 320.0,
    surface_type: 'High-Grip Indoor Hardcourt',
    amenities: ['Full Weather Cover', 'Official Electronic Scoreboards', 'Equipment Rentals', 'Locker Rooms'],
    image_url: '/src/assets/images/pickleball_court_hero_1790512672504.jpg',
    created_at: new Date(Date.now() - 40 * 86400000).toISOString(),
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    name: 'The Palm Court & Sports Club',
    owner_id: '00000000-0000-0000-0000-000000000001',
    address: 'Union Village, Purok Caimito, Tagum City, Davao del Norte, Philippines',
    total_courts: 4,
    is_indoor: false,
    hourly_rate: 250.0,
    surface_type: 'Tournament Blue/Lime',
    amenities: ['Tagum League Home Ground', 'Scenic Palm Canopy', 'Coaching Clinics', 'Referee Station'],
    image_url: '/src/assets/images/court_venue_metro_1790512684659.jpg',
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
];

// Initial Matches
let matches: Match[] = [
  {
    id: '33333333-3333-3333-3333-333333333331',
    host_id: '00000000-0000-0000-0000-000000000002',
    court_id: '11111111-1111-1111-1111-111111111111',
    scheduled_at: new Date(Date.now() - 18 * 60000).toISOString(),
    game_type: 'doubles',
    min_rating: 3.5,
    max_rating: 5.0,
    status: 'in_progress',
    team_a_score: 9,
    team_b_score: 8,
    scored_by_admin_id: null,
    winner_team: null,
    created_at: new Date(Date.now() - 40 * 60000).toISOString(),
    court: courts[0],
    players: [
      {
        id: 'mp-1',
        match_id: '33333333-3333-3333-3333-333333333331',
        player_id: '00000000-0000-0000-0000-000000000002',
        team: 'A',
        player: profiles[1], // Taylor Vance
      },
      {
        id: 'mp-2',
        match_id: '33333333-3333-3333-3333-333333333331',
        player_id: '00000000-0000-0000-0000-000000000005',
        team: 'A',
        player: profiles[4], // Devon Hayes
      },
      {
        id: 'mp-3',
        match_id: '33333333-3333-3333-3333-333333333331',
        player_id: '00000000-0000-0000-0000-000000000003',
        team: 'B',
        player: profiles[2], // Jordan Cruz
      },
      {
        id: 'mp-4',
        match_id: '33333333-3333-3333-3333-333333333331',
        player_id: '00000000-0000-0000-0000-000000000004',
        team: 'B',
        player: profiles[3], // Elena Rostova
      },
    ],
  },
  {
    id: '33333333-3333-3333-3333-333333333332',
    host_id: '00000000-0000-0000-0000-000000000007',
    court_id: '11111111-1111-1111-1111-111111111111',
    scheduled_at: new Date(Date.now() - 10 * 60000).toISOString(),
    game_type: 'singles',
    min_rating: 3.8,
    max_rating: 4.8,
    status: 'in_progress',
    team_a_score: 7,
    team_b_score: 5,
    scored_by_admin_id: null,
    winner_team: null,
    created_at: new Date(Date.now() - 25 * 60000).toISOString(),
    court: courts[0],
    players: [
      {
        id: 'mp-5',
        match_id: '33333333-3333-3333-3333-333333333332',
        player_id: '00000000-0000-0000-0000-000000000007',
        team: 'A',
        player: profiles[6], // Sam Kowalski
      },
      {
        id: 'mp-6',
        match_id: '33333333-3333-3333-3333-333333333332',
        player_id: '00000000-0000-0000-0000-000000000006',
        team: 'B',
        player: profiles[5], // Maya Lin
      },
    ],
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    host_id: '00000000-0000-0000-0000-000000000003',
    court_id: '22222222-2222-2222-2222-222222222222',
    scheduled_at: new Date(Date.now() + 60 * 60000).toISOString(),
    game_type: 'doubles',
    min_rating: 3.5,
    max_rating: 4.5,
    status: 'open',
    team_a_score: 0,
    team_b_score: 0,
    scored_by_admin_id: null,
    winner_team: null,
    created_at: new Date(Date.now() - 15 * 60000).toISOString(),
    court: courts[1],
    players: [
      {
        id: 'mp-7',
        match_id: '33333333-3333-3333-3333-333333333333',
        player_id: '00000000-0000-0000-0000-000000000003',
        team: 'A',
        player: profiles[2], // Jordan Cruz
      },
      {
        id: 'mp-8',
        match_id: '33333333-3333-3333-3333-333333333333',
        player_id: '00000000-0000-0000-0000-000000000002',
        team: 'A',
        player: profiles[1], // Taylor Vance
      },
      {
        id: 'mp-9',
        match_id: '33333333-3333-3333-3333-333333333333',
        player_id: '00000000-0000-0000-0000-000000000008',
        team: 'B',
        player: profiles[7], // Chloe Bennett
      },
    ],
  },
  {
    id: '33333333-3333-3333-3333-333333333334',
    host_id: '00000000-0000-0000-0000-000000000004',
    court_id: '11111111-1111-1111-1111-111111111111',
    scheduled_at: new Date(Date.now() - 180 * 60000).toISOString(),
    game_type: 'doubles',
    min_rating: 4.0,
    max_rating: 5.5,
    status: 'completed',
    team_a_score: 11,
    team_b_score: 6,
    scored_by_admin_id: '00000000-0000-0000-0000-000000000001',
    winner_team: 'A',
    completed_at: new Date(Date.now() - 150 * 60000).toISOString(),
    created_at: new Date(Date.now() - 210 * 60000).toISOString(),
    court: courts[0],
    players: [
      {
        id: 'mp-10',
        match_id: '33333333-3333-3333-3333-333333333334',
        player_id: '00000000-0000-0000-0000-000000000004',
        team: 'A',
        player: profiles[3],
        rating_before: 2465,
        rating_after: 2490,
        xp_earned: 210,
      },
      {
        id: 'mp-11',
        match_id: '33333333-3333-3333-3333-333333333334',
        player_id: '00000000-0000-0000-0000-000000000007',
        team: 'A',
        player: profiles[6],
        rating_before: 2155,
        rating_after: 2180,
        xp_earned: 195,
      },
      {
        id: 'mp-12',
        match_id: '33333333-3333-3333-3333-333333333334',
        player_id: '00000000-0000-0000-0000-000000000003',
        team: 'B',
        player: profiles[2],
        rating_before: 1962,
        rating_after: 1940,
        xp_earned: 75,
      },
      {
        id: 'mp-13',
        match_id: '33333333-3333-3333-3333-333333333334',
        player_id: '00000000-0000-0000-0000-000000000002',
        team: 'B',
        player: profiles[1],
        rating_before: 1700,
        rating_after: 1680,
        xp_earned: 78,
      },
    ],
  },
];

// Bookings
let bookings: Booking[] = [
  {
    id: 'b-01',
    user_id: '00000000-0000-0000-0000-000000000002',
    court_id: '11111111-1111-1111-1111-111111111111',
    court_number: 1,
    booking_time: new Date(Date.now() + 2 * 86400000).toISOString(),
    duration_hours: 2,
    total_amount: 90.0,
    stripe_payment_intent_id: 'pi_test_01928301823',
    payment_status: 'succeeded',
    created_at: new Date(Date.now() - 5 * 3600000).toISOString(),
  },
];

export function getAllProfiles(): Profile[] {
  return [...profiles];
}

export function getProfileById(id: string): Profile | undefined {
  return profiles.find((p) => p.id === id);
}

export function updateProfile(id: string, updates: Partial<Profile>): Profile | undefined {
  const index = profiles.findIndex((p) => p.id === id);
  if (index === -1) return undefined;
  profiles[index] = {
    ...profiles[index],
    ...updates,
    updated_at: new Date().toISOString(),
  };
  return profiles[index];
}

export function createProfile(profile: Profile): Profile {
  profiles.push(profile);
  return profile;
}

export function getAllCourts(): Court[] {
  return [...courts];
}

export function getCourtById(id: string): Court | undefined {
  return courts.find((c) => c.id === id);
}

export function getAllMatches(): Match[] {
  return matches.map((m) => ({
    ...m,
    court: courts.find((c) => c.id === m.court_id),
    scorer_admin: m.scored_by_admin_id ? profiles.find((p) => p.id === m.scored_by_admin_id) : undefined,
  }));
}

export function getMatchById(id: string): Match | undefined {
  const match = matches.find((m) => m.id === id);
  if (!match) return undefined;
  return {
    ...match,
    court: courts.find((c) => c.id === match.court_id),
    scorer_admin: match.scored_by_admin_id ? profiles.find((p) => p.id === match.scored_by_admin_id) : undefined,
  };
}

export function updateMatch(id: string, updates: Partial<Match>): Match | undefined {
  const index = matches.findIndex((m) => m.id === id);
  if (index === -1) return undefined;
  matches[index] = {
    ...matches[index],
    ...updates,
  };
  return matches[index];
}

export function createMatch(newMatch: Match): Match {
  matches.unshift(newMatch);
  return newMatch;
}

export function createBooking(newBooking: Booking): Booking {
  bookings.unshift(newBooking);
  return newBooking;
}

export function getBookingsForUser(userId: string): Booking[] {
  return bookings.filter((b) => b.user_id === userId);
}

export function getLeaderboard(tierFilter?: string): LeaderboardEntry[] {
  // Only players appear on the competitive player ladder
  let playerList = profiles.filter((p) => p.role === 'player');

  if (tierFilter && tierFilter !== 'all') {
    playerList = playerList.filter((p) => p.rank_tier.toLowerCase() === tierFilter.toLowerCase());
  }

  // Sort strictly by rank_points descending
  playerList.sort((a, b) => b.rank_points - a.rank_points);

  return playerList.map((p, index) => {
    const total = p.wins + p.losses;
    const winRate = total > 0 ? Math.round((p.wins / total) * 100) : 0;
    // Generate realistic form
    const recentForm: ('W' | 'L')[] = [];
    const winsCount = Math.min(5, Math.round((p.wins / Math.max(1, total)) * 5));
    for (let i = 0; i < 5; i++) {
      recentForm.push(i < winsCount ? 'W' : 'L');
    }

    return {
      ...p,
      ladder_rank: index + 1,
      total_matches: total,
      win_rate: winRate,
      recent_form: recentForm,
    };
  });
}

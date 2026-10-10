import type { Profile, Court, Match, Booking, LeaderboardEntry, MatchPlayer, CourtReview, Tournament, TournamentRound, BracketMatch, TournamentPlayer } from '../src/types.ts';

// Initial Mock Profiles
let profiles: Profile[] = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    full_name: 'Coach Marcus Sterling',
    email: 'marcus@pickleplay.com',
    role: 'court_admin',
    rank_points: 0,
    rank_tier: 'Bronze',
    total_xp: 0,
    wins: 0,
    losses: 0,
    dupr_id: 'REF-99214',
    skill_rating: 0,
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80',
    created_at: new Date(Date.now() - 90 * 86400000).toISOString(),
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    full_name: 'Frannnxx',
    email: 'franx000002@gmail.com',
    role: 'player',
    rank_points: 1680,
    rank_tier: 'Gold',
    total_xp: 4250,
    wins: 42,
    losses: 19,
    dupr_id: 'DUPR-54812',
    skill_rating: 4.15,
    avatar_url: '/src/assets/images/frannnxx_avatar_1791277042121.jpg',
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
  {
    id: '55555555-5555-5555-5555-555555555555',
    name: 'Spin & Smash Pickleball Pavilion',
    owner_id: '00000000-0000-0000-0000-000000000001',
    address: 'Visayan Village, National Highway, Tagum City, Davao del Norte, Philippines',
    total_courts: 6,
    is_indoor: true,
    hourly_rate: 320.0,
    surface_type: 'Pro-Glide Olympic Cushion Acrylic',
    amenities: [
      'Prime National Highway Accessibility',
      'Air-Cooled Player Pavilion & Lounge',
      'Full LED Night Floodlights',
      'DUPR Certified Camera Courts',
      'Pro Equipment Shop & Paddle Rental',
      'Hydration & Juice Bar',
    ],
    image_url: '/src/assets/images/court_venue_metro_1790512684659.jpg',
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
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
  {
    id: '33333333-3333-3333-3333-333333333335',
    host_id: '00000000-0000-0000-0000-000000000002',
    court_id: '11111111-1111-1111-1111-111111111111',
    scheduled_at: new Date(Date.now() - 24 * 3600000).toISOString(),
    game_type: 'singles',
    min_rating: 3.5,
    max_rating: 5.0,
    status: 'completed',
    team_a_score: 11,
    team_b_score: 7,
    scored_by_admin_id: '00000000-0000-0000-0000-000000000001',
    winner_team: 'A',
    completed_at: new Date(Date.now() - 23 * 3600000).toISOString(),
    created_at: new Date(Date.now() - 25 * 3600000).toISOString(),
    court: courts[0],
    players: [
      {
        id: 'mp-14',
        match_id: '33333333-3333-3333-3333-333333333335',
        player_id: '00000000-0000-0000-0000-000000000002',
        team: 'A',
        player: profiles[1], // Taylor Vance
        rating_before: 1656,
        rating_after: 1680,
        xp_earned: 220,
      },
      {
        id: 'mp-15',
        match_id: '33333333-3333-3333-3333-333333333335',
        player_id: '00000000-0000-0000-0000-000000000003',
        team: 'B',
        player: profiles[2], // Jordan Cruz
        rating_before: 1964,
        rating_after: 1940,
        xp_earned: 80,
      },
    ],
  },
  {
    id: '33333333-3333-3333-3333-333333333336',
    host_id: '00000000-0000-0000-0000-000000000002',
    court_id: '22222222-2222-2222-2222-222222222222',
    scheduled_at: new Date(Date.now() - 72 * 3600000).toISOString(),
    game_type: 'doubles',
    min_rating: 3.5,
    max_rating: 4.5,
    status: 'completed',
    team_a_score: 11,
    team_b_score: 9,
    scored_by_admin_id: '00000000-0000-0000-0000-000000000001',
    winner_team: 'A',
    completed_at: new Date(Date.now() - 71 * 3600000).toISOString(),
    created_at: new Date(Date.now() - 73 * 3600000).toISOString(),
    court: courts[1],
    players: [
      {
        id: 'mp-16',
        match_id: '33333333-3333-3333-3333-333333333336',
        player_id: '00000000-0000-0000-0000-000000000002',
        team: 'A',
        player: profiles[1], // Taylor Vance
        rating_before: 1638,
        rating_after: 1656,
        xp_earned: 190,
      },
      {
        id: 'mp-17',
        match_id: '33333333-3333-3333-3333-333333333336',
        player_id: '00000000-0000-0000-0000-000000000008',
        team: 'A',
        player: profiles[7], // Chloe Bennett
        rating_before: 1475,
        rating_after: 1493,
        xp_earned: 185,
      },
      {
        id: 'mp-18',
        match_id: '33333333-3333-3333-3333-333333333336',
        player_id: '00000000-0000-0000-0000-000000000005',
        team: 'B',
        player: profiles[4], // Devon Hayes
        rating_before: 1820,
        rating_after: 1802,
        xp_earned: 90,
      },
      {
        id: 'mp-19',
        match_id: '33333333-3333-3333-3333-333333333336',
        player_id: '00000000-0000-0000-0000-000000000007',
        team: 'B',
        player: profiles[6], // Sam Kowalski
        rating_before: 2198,
        rating_after: 2180,
        xp_earned: 85,
      },
    ],
  },
  {
    id: '33333333-3333-3333-3333-333333333337',
    host_id: '00000000-0000-0000-0000-000000000006',
    court_id: '11111111-1111-1111-1111-111111111111',
    scheduled_at: new Date(Date.now() - 120 * 3600000).toISOString(),
    game_type: 'singles',
    min_rating: 3.5,
    max_rating: 4.8,
    status: 'completed',
    team_a_score: 9,
    team_b_score: 11,
    scored_by_admin_id: '00000000-0000-0000-0000-000000000001',
    winner_team: 'B',
    completed_at: new Date(Date.now() - 119 * 3600000).toISOString(),
    created_at: new Date(Date.now() - 121 * 3600000).toISOString(),
    court: courts[0],
    players: [
      {
        id: 'mp-20',
        match_id: '33333333-3333-3333-3333-333333333337',
        player_id: '00000000-0000-0000-0000-000000000002',
        team: 'A',
        player: profiles[1], // Taylor Vance
        rating_before: 1653,
        rating_after: 1638,
        xp_earned: 70,
      },
      {
        id: 'mp-21',
        match_id: '33333333-3333-3333-3333-333333333337',
        player_id: '00000000-0000-0000-0000-000000000006',
        team: 'B',
        player: profiles[5], // Maya Lin
        rating_before: 1535,
        rating_after: 1550,
        xp_earned: 200,
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

// Court Reviews Store (1 to 5 Stars & Management Feedback)
let courtReviews: CourtReview[] = [
  {
    id: 'rev-01',
    court_id: '11111111-1111-1111-1111-111111111111',
    user_id: '00000000-0000-0000-0000-000000000004',
    user_name: 'Elena Rostova',
    user_avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&h=200&q=80',
    user_role: 'Pickle Master (ELO 2,490)',
    rating: 5,
    comment: 'Exceptional tournament cushions! Night lighting gives zero glare and the management turned on Court 3 immediately upon our arrival. 10/10 venue.',
    tags: ['Court Surface & Grip', 'Night Lighting', 'Management & Staff'],
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'rev-02',
    court_id: '11111111-1111-1111-1111-111111111111',
    user_id: '00000000-0000-0000-0000-000000000003',
    user_name: 'Jordan Cruz',
    user_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&h=200&q=80',
    user_role: 'Platinum Athlete (ELO 1,940)',
    rating: 5,
    comment: 'The DUPR cameras are top-notch and court staff helped us verify net tension before our ladder match. Best facility in Tagum City!',
    tags: ['Net Quality', 'Management & Staff'],
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'rev-03',
    court_id: '22222222-2222-2222-2222-222222222222',
    user_id: '00000000-0000-0000-0000-000000000006',
    user_name: 'Maya Lin',
    user_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&h=200&q=80',
    user_role: 'Gold Player (ELO 1,550)',
    rating: 4,
    comment: 'Great outdoor atmosphere on Doña Regina Avenue. Very accommodating staff at the cafe. Courts are well maintained and clean.',
    tags: ['Court Surface & Grip', 'Amenities'],
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'rev-04',
    court_id: '33333333-3333-3333-3333-333333333330',
    user_id: '00000000-0000-0000-0000-000000000005',
    user_name: 'Devon Hayes',
    user_avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&h=200&q=80',
    user_role: 'Gold Player (ELO 1,802)',
    rating: 5,
    comment: 'Indoor coverage saved our tournament session during afternoon rain. Electronic scoreboards and locker rooms are very clean.',
    tags: ['Cleanliness & Restrooms', 'Management & Staff'],
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: 'rev-05',
    court_id: '44444444-4444-4444-4444-444444444444',
    user_id: '00000000-0000-0000-0000-000000000007',
    user_name: 'Sam Kowalski',
    user_avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&h=200&q=80',
    user_role: 'Diamond Player (ELO 2,180)',
    rating: 4,
    comment: 'Scenic palm setting in Purok Caimito with good natural breeze. Net tension is accurate and referee booth is convenient.',
    tags: ['Net Quality', 'Amenities'],
    created_at: new Date(Date.now() - 6 * 86400000).toISOString(),
  },
  {
    id: 'rev-06',
    court_id: '55555555-5555-5555-5555-555555555555',
    user_id: '00000000-0000-0000-0000-000000000002',
    user_name: 'Frannnxx',
    user_avatar: '/src/assets/images/frannnxx_avatar_1791277042121.jpg',
    user_role: 'Gold Player (ELO 1,680)',
    rating: 5,
    comment: 'Super convenient location along National Highway in Visayan Village! Spacious covered pavilion keeps courts cool and comfortable, and the Pro-Glide surface has fantastic grip.',
    tags: ['Court Surface & Grip', 'Management & Staff', 'Night Lighting'],
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'rev-07',
    court_id: '55555555-5555-5555-5555-555555555555',
    user_id: '00000000-0000-0000-0000-000000000004',
    user_name: 'Elena Rostova',
    user_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&h=200&q=80',
    user_role: 'Pickle Master (ELO 2,490)',
    rating: 5,
    comment: 'Top caliber pavilion with official tournament nets and elevated spectator viewing. Great venue for regional ladder showdowns and evening doubles in Tagum.',
    tags: ['Net Quality & Tension', 'Spectator Bleachers'],
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
];

export function getReviewsForCourt(courtId: string): CourtReview[] {
  return courtReviews.filter((r) => r.court_id === courtId);
}

export function addCourtReview(review: CourtReview): CourtReview {
  courtReviews.unshift(review);
  return review;
}

export function getAllCourts(): Court[] {
  return courts.map((c) => {
    const revs = courtReviews.filter((r) => r.court_id === c.id);
    const avg = revs.length > 0
      ? Number((revs.reduce((acc, r) => acc + r.rating, 0) / revs.length).toFixed(1))
      : 4.8;
    return {
      ...c,
      reviews_count: revs.length,
      average_rating: avg,
      reviews: revs,
    };
  });
}

export function getCourtById(id: string): Court | undefined {
  const c = courts.find((court) => court.id === id);
  if (!c) return undefined;
  const revs = courtReviews.filter((r) => r.court_id === c.id);
  const avg = revs.length > 0
    ? Number((revs.reduce((acc, r) => acc + r.rating, 0) / revs.length).toFixed(1))
    : 4.8;
  return {
    ...c,
    reviews_count: revs.length,
    average_rating: avg,
    reviews: revs,
  };
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

// Live Court Activity & Today's Attendance State
let todayExtraWalkInPlayers = 6;
let liveCourtFeed = [
  {
    id: 'f-0',
    time: 'Just now',
    courtName: 'Spin & Smash Pickleball Pavilion',
    type: 'status',
    text: 'Grand opening match session active on National Highway, Visayan Village. Court 6 open for instant reservations.',
    badge: 'Pavilion Live',
  },
  {
    id: 'f-1',
    time: '4m ago',
    courtName: 'City Pickle Grounds (CPG)',
    type: 'match',
    text: 'Match Finalized: Taylor Vance & Frannnxx secured 11-8 victory on Court 1',
    badge: 'Score 11-8',
  },
  {
    id: 'f-2',
    time: '14m ago',
    courtName: 'City Pickle Grounds (CPG)',
    type: 'referee',
    text: 'Official Referee Marcus Sterling verified electronic scoresheet and adjusted ladder ELO',
    badge: 'REF-99214',
  },
  {
    id: 'f-3',
    time: '26m ago',
    courtName: 'M Central Pickleball Club',
    type: 'checkin',
    text: '4 new players checked in for Evening Doubles Ladder Duel on Court 2',
    badge: '+4 Players',
  },
  {
    id: 'f-4',
    time: '42m ago',
    courtName: 'Picklezone Tagum Indoor',
    type: 'status',
    text: 'Youth & Masters Training Clinic completed on Courts 1-3. All courts transitioning to open games',
    badge: '14 Athletes',
  },
  {
    id: 'f-5',
    time: '1h ago',
    courtName: 'Tagum Circuit',
    type: 'lighting',
    text: 'Night floodlights powered on across all Tagum City outdoor venues. Surface condition: Dry & Fast',
    badge: 'Night Play Active',
  },
];

export function getCourtActivityToday() {
  const cpgCourt = courts.find((c) => c.id === '11111111-1111-1111-1111-111111111111');
  const mCentral = courts.find((c) => c.id === '22222222-2222-2222-2222-222222222222');
  const picklezone = courts.find((c) => c.id === '33333333-3333-3333-3333-333333333330');
  const palmCourt = courts.find((c) => c.id === '44444444-4444-4444-4444-444444444444');
  const spinSmashCourt = courts.find((c) => c.id === '55555555-5555-5555-5555-555555555555');

  const facilities = [
    {
      id: cpgCourt?.id || 'cpg-1',
      name: 'City Pickle Grounds (CPG) - Tagum',
      shortName: 'CPG Mankilam',
      address: 'National Highway, Brgy. Mankilam, Tagum City',
      image_url: cpgCourt?.image_url || '/src/assets/images/pickleball_court_hero_1790512672504.jpg',
      total_courts: 6,
      active_courts: 4,
      players_today: 26 + Math.floor(todayExtraWalkInPlayers * 0.5),
      status_label: 'Peak Evening Play',
      lighting_status: '24/7 Floodlights Active',
      surface_type: 'International Tournament Cushion Acrylic',
      court_slots: [
        {
          courtNumber: 1,
          status: 'occupied',
          title: 'Doubles Championship Ladder',
          players: 'Frannnxx & Taylor Vance vs Devon & Sam',
          score: '11-8 (Finalized)',
          referee: 'Marcus Sterling (Active)',
        },
        {
          courtNumber: 2,
          status: 'occupied',
          title: 'Official Rated Match (Warmup)',
          players: 'Maya Lin & Partner vs Challenge Duo',
          score: '3-2 (Game 1)',
          referee: 'Certified Scorer',
        },
        {
          courtNumber: 3,
          status: 'occupied',
          title: 'Open Public Practice & Drill Session',
          players: 'Tagum Pickleball Academy',
          score: 'Continuous Rally',
          referee: 'Academy Coach',
        },
        {
          courtNumber: 4,
          status: 'occupied',
          title: 'Recreational Doubles',
          players: '4 Checked-in Athletes',
          score: '8-6',
          referee: 'Self-Officiated',
        },
        {
          courtNumber: 5,
          status: 'available',
          title: 'Open for Walk-ins & Instant Play',
          players: 'Free / Next Rotation',
          score: 'Ready',
          referee: 'None',
        },
        {
          courtNumber: 6,
          status: 'reserved',
          title: 'Stripe Instant Reservation',
          players: 'Booked for 06:30 PM (Prime)',
          score: 'Scheduled',
          referee: 'Assigned',
        },
      ],
      recentUpdate: 'Court 1 referee score finalized by Marcus Sterling. Court 5 ready for immediate walk-in play.',
    },
    {
      id: mCentral?.id || 'mc-1',
      name: 'M Central Pickleball Club',
      shortName: 'M Central',
      address: 'Doña Regina Dalisay Ave, Tagum City',
      image_url: mCentral?.image_url || '/src/assets/images/court_venue_metro_1790512684659.jpg',
      total_courts: 4,
      active_courts: 3,
      players_today: 16 + Math.floor(todayExtraWalkInPlayers * 0.3),
      status_label: 'Open Until 2:00 AM',
      lighting_status: 'High-Lux Arena Lighting ON',
      surface_type: 'All-Weather Championship Acrylic',
      court_slots: [
        {
          courtNumber: 1,
          status: 'occupied',
          title: 'Night Club Round Robin',
          players: 'Tagum Metro Club Regulars',
          score: '10-7',
          referee: 'Club Official',
        },
        {
          courtNumber: 2,
          status: 'occupied',
          title: 'Singles Rating Duel',
          players: 'Silver vs Gold Contenders',
          score: '9-9 (Tiebreak)',
          referee: 'Neutral Ref',
        },
        {
          courtNumber: 3,
          status: 'occupied',
          title: 'Evening Clinic & Serve Practice',
          players: 'Beginner to Intermediate Cohort',
          score: 'Drill Set',
          referee: 'Instructor',
        },
        {
          courtNumber: 4,
          status: 'available',
          title: 'Walk-in Court Available',
          players: 'Open for Walk-ins',
          score: 'Ready',
          referee: 'None',
        },
      ],
      recentUpdate: 'Spectator bleachers full for night play. Court 4 available for walk-in doubles.',
    },
    {
      id: picklezone?.id || 'pz-1',
      name: 'Picklezone Tagum & Indoor Arena',
      shortName: 'Picklezone Arena',
      address: 'Purok 4, Brgy. Magugpo East, Tagum City',
      image_url: picklezone?.image_url || '/src/assets/images/pickleball_court_hero_1790512672504.jpg',
      total_courts: 4,
      active_courts: 4,
      players_today: 14 + Math.floor(todayExtraWalkInPlayers * 0.2),
      status_label: 'Indoor Full Capacity',
      lighting_status: 'Indoor LED Climate Controlled',
      surface_type: 'High-Grip Indoor Hardcourt',
      court_slots: [
        {
          courtNumber: 1,
          status: 'occupied',
          title: 'Junior League Training',
          players: 'Tagum Youth Squad',
          score: 'Drills',
          referee: 'Coach Neil',
        },
        {
          courtNumber: 2,
          status: 'occupied',
          title: 'Masters Invitational',
          players: 'Pickle Master Division Contenders',
          score: 'Set 2',
          referee: 'Senior Official',
        },
        {
          courtNumber: 3,
          status: 'occupied',
          title: 'Corporate League Match',
          players: 'Davao Del Norte Corporate League',
          score: '11-4',
          referee: 'Official Scorer',
        },
        {
          courtNumber: 4,
          status: 'occupied',
          title: 'DUPR Rated Singles',
          players: 'Registered Tournament Entrants',
          score: 'Match Point',
          referee: 'Certified Ref',
        },
      ],
      recentUpdate: 'Rainproof indoor courts running at full capacity. Next open rotation at 7:30 PM.',
    },
    {
      id: spinSmashCourt?.id || '55555555-5555-5555-5555-555555555555',
      name: 'Spin & Smash Pickleball Pavilion',
      shortName: 'Spin & Smash Pavilion',
      address: 'Visayan Village, National Highway, Tagum City',
      image_url: spinSmashCourt?.image_url || '/src/assets/images/court_venue_metro_1790512684659.jpg',
      total_courts: 6,
      active_courts: 5,
      players_today: 22 + Math.floor(todayExtraWalkInPlayers * 0.4),
      status_label: 'Prime Highway Hub',
      lighting_status: 'Full LED Night Floodlights ON',
      surface_type: 'Pro-Glide Olympic Cushion Acrylic',
      court_slots: [
        {
          courtNumber: 1,
          status: 'occupied',
          title: 'Spin & Smash Grand Open Warmup',
          players: 'Frannnxx & Sam "Spin" vs Challengers',
          score: '9-7 (Game 1)',
          referee: 'Certified Official',
        },
        {
          courtNumber: 2,
          status: 'occupied',
          title: 'Visayan Village Doubles Ladder',
          players: 'Jordan Cruz & Partner vs Contenders',
          score: '11-6',
          referee: 'Head Scorer',
        },
        {
          courtNumber: 3,
          status: 'occupied',
          title: 'DUPR Rated Singles Duel',
          players: 'Gold Tier Athletes',
          score: '8-8',
          referee: 'Official Scorer',
        },
        {
          courtNumber: 4,
          status: 'occupied',
          title: 'Open Clinic & High-Velocity Drills',
          players: 'Pavilion Training Group',
          score: 'Rallies',
          referee: 'Pavilion Coach',
        },
        {
          courtNumber: 5,
          status: 'occupied',
          title: 'Evening Match Play',
          players: '4 Checked-in Players',
          score: '10-4',
          referee: 'Assigned',
        },
        {
          courtNumber: 6,
          status: 'available',
          title: 'Instant Online Reservation / Walk-in',
          players: 'Open for Booking',
          score: 'Ready',
          referee: 'None',
        },
      ],
      recentUpdate: 'Spin & Smash Pavilion open along Visayan Village National Highway. Courts 1-5 active, Court 6 ready for instant reservation.',
    },
  ];

  const totalPlayersToday = facilities.reduce((sum, f) => sum + f.players_today, 0);
  const totalCourts = facilities.reduce((sum, f) => sum + f.total_courts, 0);
  const totalActiveCourts = facilities.reduce((sum, f) => sum + f.active_courts, 0);
  const totalMatchesToday = matches.length + 8; // combined simulated completed daily fixtures

  return {
    totalPlayersToday,
    totalMatchesToday,
    totalCourts,
    totalActiveCourts,
    occupancyPercentage: Math.round((totalActiveCourts / totalCourts) * 100),
    activeRefereesCount: 2,
    facilities,
    feed: liveCourtFeed,
    updatedAt: new Date().toISOString(),
  };
}

export function updateCourtActivity(params: {
  message?: string;
  courtId?: string;
  addedPlayers?: number;
  statusText?: string;
  postedBy?: string;
}) {
  if (params.addedPlayers && params.addedPlayers > 0) {
    todayExtraWalkInPlayers += params.addedPlayers;
  }

  if (params.message) {
    const targetCourt = courts.find((c) => c.id === params.courtId) || courts[0];
    liveCourtFeed.unshift({
      id: `f-${Date.now()}`,
      time: 'Just now',
      courtName: targetCourt ? targetCourt.name : 'Tagum Pickleball Circuit',
      type: 'status',
      text: `${params.postedBy || 'Court Official'}: ${params.message}`,
      badge: params.statusText || 'Live Update',
    });
    // keep feed trimmed
    if (liveCourtFeed.length > 20) {
      liveCourtFeed = liveCourtFeed.slice(0, 20);
    }
  }

  return getCourtActivityToday();
}

// ==========================================
// TOURNAMENTS & BRACKETS STORE
// ==========================================

export function buildSingleEliminationBracket(
  participants: TournamentPlayer[],
  tournamentId: string,
  courtName: string = 'Court 1'
): TournamentRound[] {
  // Sort participants by skill rating descending to assign seeds
  const sorted = [...participants].sort((a, b) => b.skill_rating - a.skill_rating);
  const seeded = sorted.map((p, idx) => ({ ...p, seed: idx + 1 }));

  // Ensure 8 slots for standard 8-player bracket
  const filledSlots: (TournamentPlayer | null)[] = [...seeded];
  while (filledSlots.length < 8) {
    const nextIdx = filledSlots.length + 1;
    // Find an available profile not yet in filledSlots
    const existingIds = new Set(filledSlots.filter(Boolean).map((p) => p!.player_id));
    const availProfile = profiles.find((p) => p.role === 'player' && !existingIds.has(p.id));
    if (availProfile) {
      filledSlots.push({
        id: `tp-auto-${availProfile.id}-${tournamentId}`,
        player_id: availProfile.id,
        seed: nextIdx,
        full_name: availProfile.full_name,
        avatar_url: availProfile.avatar_url,
        skill_rating: availProfile.skill_rating,
        rank_tier: availProfile.rank_tier,
        dupr_id: availProfile.dupr_id,
        registered_at: new Date().toISOString(),
      });
    } else {
      filledSlots.push({
        id: `tp-bye-${nextIdx}`,
        player_id: `bye-${nextIdx}`,
        seed: nextIdx,
        full_name: `Contender #${nextIdx}`,
        skill_rating: 3.5,
        rank_tier: 'Silver',
        registered_at: new Date().toISOString(),
      });
    }
  }

  // 1. Championship Final Match
  const finalMatchId = `${tournamentId}-m-final`;
  const finalMatch: BracketMatch = {
    id: finalMatchId,
    round_index: 2,
    round_name: 'Championship Final',
    match_number: 7,
    next_match_id: null,
    next_slot: null,
    player1: null,
    player2: null,
    score1: null,
    score2: null,
    winner_id: null,
    status: 'pending',
    court_name: `${courtName} - Championship Court`,
    scheduled_time: 'Sunday 4:00 PM',
  };

  // 2. Semifinals
  const sf1Id = `${tournamentId}-m-sf1`;
  const sf2Id = `${tournamentId}-m-sf2`;

  const sf1: BracketMatch = {
    id: sf1Id,
    round_index: 1,
    round_name: 'Semifinals',
    match_number: 5,
    next_match_id: finalMatchId,
    next_slot: 'player1',
    player1: null,
    player2: null,
    score1: null,
    score2: null,
    winner_id: null,
    status: 'pending',
    court_name: `${courtName} - Court 1`,
    scheduled_time: 'Sunday 1:30 PM',
  };

  const sf2: BracketMatch = {
    id: sf2Id,
    round_index: 1,
    round_name: 'Semifinals',
    match_number: 6,
    next_match_id: finalMatchId,
    next_slot: 'player2',
    player1: null,
    player2: null,
    score1: null,
    score2: null,
    winner_id: null,
    status: 'pending',
    court_name: `${courtName} - Court 2`,
    scheduled_time: 'Sunday 2:45 PM',
  };

  // 3. Quarterfinals (Seed pairings: 1v8, 4v5, 2v7, 3v6)
  const qf1: BracketMatch = {
    id: `${tournamentId}-m-qf1`,
    round_index: 0,
    round_name: 'Quarterfinals',
    match_number: 1,
    next_match_id: sf1Id,
    next_slot: 'player1',
    player1: filledSlots[0], // Seed 1
    player2: filledSlots[7], // Seed 8
    score1: null,
    score2: null,
    winner_id: null,
    status: 'pending',
    court_name: `${courtName} - Court 1`,
    scheduled_time: 'Saturday 9:00 AM',
  };

  const qf2: BracketMatch = {
    id: `${tournamentId}-m-qf2`,
    round_index: 0,
    round_name: 'Quarterfinals',
    match_number: 2,
    next_match_id: sf1Id,
    next_slot: 'player2',
    player1: filledSlots[3], // Seed 4
    player2: filledSlots[4], // Seed 5
    score1: null,
    score2: null,
    winner_id: null,
    status: 'pending',
    court_name: `${courtName} - Court 2`,
    scheduled_time: 'Saturday 10:15 AM',
  };

  const qf3: BracketMatch = {
    id: `${tournamentId}-m-qf3`,
    round_index: 0,
    round_name: 'Quarterfinals',
    match_number: 3,
    next_match_id: sf2Id,
    next_slot: 'player1',
    player1: filledSlots[1], // Seed 2
    player2: filledSlots[6], // Seed 7
    score1: null,
    score2: null,
    winner_id: null,
    status: 'pending',
    court_name: `${courtName} - Court 3`,
    scheduled_time: 'Saturday 11:30 AM',
  };

  const qf4: BracketMatch = {
    id: `${tournamentId}-m-qf4`,
    round_index: 0,
    round_name: 'Quarterfinals',
    match_number: 4,
    next_match_id: sf2Id,
    next_slot: 'player2',
    player1: filledSlots[2], // Seed 3
    player2: filledSlots[5], // Seed 6
    score1: null,
    score2: null,
    winner_id: null,
    status: 'pending',
    court_name: `${courtName} - Court 4`,
    scheduled_time: 'Saturday 12:45 PM',
  };

  return [
    {
      round_index: 0,
      round_name: 'Quarterfinals',
      matches: [qf1, qf2, qf3, qf4],
    },
    {
      round_index: 1,
      round_name: 'Semifinals',
      matches: [sf1, sf2],
    },
    {
      round_index: 2,
      round_name: 'Championship Final',
      matches: [finalMatch],
    },
  ];
}

// Initial Mock Tournaments
let tournaments: Tournament[] = [
  {
    id: 'tourn-1',
    title: 'Tagum Open Pickleball Championship 2026',
    description: 'Premier official sanctioned championship ladder tournament for Davao del Norte players. DUPR points verified and certified by regional referees.',
    category: "Men's Singles",
    skill_level: 'Open Division (All)',
    format: 'Single Elimination (8 Players)',
    max_participants: 8,
    venue_name: 'Tagum Central Pickleball Complex',
    venue_address: 'Pioneer Ave, Magugpo Poblacion, Tagum City',
    start_date: '2026-10-10T09:00:00Z',
    end_date: '2026-10-12T18:00:00Z',
    registration_deadline: '2026-10-09T23:59:59Z',
    entry_fee: 350,
    prize_pool: 15000,
    banner_image_url: '/src/assets/images/tagum_championship_trophy_1791477380864.jpg',
    status: 'active',
    created_by_admin_id: '00000000-0000-0000-0000-000000000001',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    participants: [
      {
        id: 'tp-1-04',
        player_id: '00000000-0000-0000-0000-000000000004',
        seed: 1,
        full_name: 'Elena Rostova',
        avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&h=200&q=80',
        skill_rating: 5.15,
        rank_tier: 'Pickle Master',
        dupr_id: 'DUPR-10294',
        registered_at: '2026-10-05T10:00:00Z',
      },
      {
        id: 'tp-1-07',
        player_id: '00000000-0000-0000-0000-000000000007',
        seed: 2,
        full_name: 'Sam "Spin" Kowalski',
        avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&h=200&q=80',
        skill_rating: 4.80,
        rank_tier: 'Diamond',
        dupr_id: 'DUPR-49120',
        registered_at: '2026-10-05T11:15:00Z',
      },
      {
        id: 'tp-1-03',
        player_id: '00000000-0000-0000-0000-000000000003',
        seed: 3,
        full_name: 'Jordan Cruz',
        avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&h=200&q=80',
        skill_rating: 4.45,
        rank_tier: 'Platinum',
        dupr_id: 'DUPR-38190',
        registered_at: '2026-10-05T12:00:00Z',
      },
      {
        id: 'tp-1-02',
        player_id: '00000000-0000-0000-0000-000000000002',
        seed: 4,
        full_name: 'Frannnxx',
        avatar_url: '/src/assets/images/frannnxx_avatar_1791277042121.jpg',
        skill_rating: 4.15,
        rank_tier: 'Gold',
        dupr_id: 'DUPR-54812',
        registered_at: '2026-10-05T13:30:00Z',
      },
      {
        id: 'tp-1-06',
        player_id: '00000000-0000-0000-0000-000000000006',
        seed: 5,
        full_name: 'Maya Lin',
        avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&h=200&q=80',
        skill_rating: 3.95,
        rank_tier: 'Gold',
        dupr_id: 'DUPR-62401',
        registered_at: '2026-10-05T14:45:00Z',
      },
      {
        id: 'tp-1-05',
        player_id: '00000000-0000-0000-0000-000000000005',
        seed: 6,
        full_name: 'Devon Hayes',
        avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&h=200&q=80',
        skill_rating: 3.65,
        rank_tier: 'Silver',
        dupr_id: 'DUPR-77319',
        registered_at: '2026-10-05T15:20:00Z',
      },
      {
        id: 'tp-1-08',
        player_id: '00000000-0000-0000-0000-000000000008',
        seed: 7,
        full_name: 'Carlos "Ace" Dela Cruz',
        avatar_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&h=200&q=80',
        skill_rating: 3.40,
        rank_tier: 'Bronze',
        dupr_id: 'DUPR-81920',
        registered_at: '2026-10-05T16:00:00Z',
      },
      {
        id: 'tp-1-09',
        player_id: '00000000-0000-0000-0000-000000000009',
        seed: 8,
        full_name: 'Kenneth "Smash" Tan',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80',
        skill_rating: 3.20,
        rank_tier: 'Bronze',
        dupr_id: 'DUPR-92011',
        registered_at: '2026-10-05T16:30:00Z',
      },
    ],
    rounds: [
      {
        round_index: 0,
        round_name: 'Quarterfinals',
        matches: [
          {
            id: 'tourn-1-m-qf1',
            round_index: 0,
            round_name: 'Quarterfinals',
            match_number: 1,
            next_match_id: 'tourn-1-m-sf1',
            next_slot: 'player1',
            player1: {
              id: 'tp-1-04',
              player_id: '00000000-0000-0000-0000-000000000004',
              seed: 1,
              full_name: 'Elena Rostova',
              avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&h=200&q=80',
              skill_rating: 5.15,
              rank_tier: 'Pickle Master',
              dupr_id: 'DUPR-10294',
              registered_at: '2026-10-05T10:00:00Z',
            },
            player2: {
              id: 'tp-1-09',
              player_id: '00000000-0000-0000-0000-000000000009',
              seed: 8,
              full_name: 'Kenneth "Smash" Tan',
              avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80',
              skill_rating: 3.20,
              rank_tier: 'Bronze',
              dupr_id: 'DUPR-92011',
              registered_at: '2026-10-05T16:30:00Z',
            },
            score1: 11,
            score2: 4,
            winner_id: '00000000-0000-0000-0000-000000000004',
            status: 'completed',
            court_name: 'Court 1',
            scheduled_time: 'Saturday 9:00 AM',
          },
          {
            id: 'tourn-1-m-qf2',
            round_index: 0,
            round_name: 'Quarterfinals',
            match_number: 2,
            next_match_id: 'tourn-1-m-sf1',
            next_slot: 'player2',
            player1: {
              id: 'tp-1-02',
              player_id: '00000000-0000-0000-0000-000000000002',
              seed: 4,
              full_name: 'Frannnxx',
              avatar_url: '/src/assets/images/frannnxx_avatar_1791277042121.jpg',
              skill_rating: 4.15,
              rank_tier: 'Gold',
              dupr_id: 'DUPR-54812',
              registered_at: '2026-10-05T13:30:00Z',
            },
            player2: {
              id: 'tp-1-06',
              player_id: '00000000-0000-0000-0000-000000000006',
              seed: 5,
              full_name: 'Maya Lin',
              avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&h=200&q=80',
              skill_rating: 3.95,
              rank_tier: 'Gold',
              dupr_id: 'DUPR-62401',
              registered_at: '2026-10-05T14:45:00Z',
            },
            score1: 11,
            score2: 7,
            winner_id: '00000000-0000-0000-0000-000000000002',
            status: 'completed',
            court_name: 'Court 2',
            scheduled_time: 'Saturday 10:15 AM',
          },
          {
            id: 'tourn-1-m-qf3',
            round_index: 0,
            round_name: 'Quarterfinals',
            match_number: 3,
            next_match_id: 'tourn-1-m-sf2',
            next_slot: 'player1',
            player1: {
              id: 'tp-1-07',
              player_id: '00000000-0000-0000-0000-000000000007',
              seed: 2,
              full_name: 'Sam "Spin" Kowalski',
              avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&h=200&q=80',
              skill_rating: 4.80,
              rank_tier: 'Diamond',
              dupr_id: 'DUPR-49120',
              registered_at: '2026-10-05T11:15:00Z',
            },
            player2: {
              id: 'tp-1-08',
              player_id: '00000000-0000-0000-0000-000000000008',
              seed: 7,
              full_name: 'Carlos "Ace" Dela Cruz',
              avatar_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&h=200&q=80',
              skill_rating: 3.40,
              rank_tier: 'Bronze',
              dupr_id: 'DUPR-81920',
              registered_at: '2026-10-05T16:00:00Z',
            },
            score1: 11,
            score2: 5,
            winner_id: '00000000-0000-0000-0000-000000000007',
            status: 'completed',
            court_name: 'Court 3',
            scheduled_time: 'Saturday 11:30 AM',
          },
          {
            id: 'tourn-1-m-qf4',
            round_index: 0,
            round_name: 'Quarterfinals',
            match_number: 4,
            next_match_id: 'tourn-1-m-sf2',
            next_slot: 'player2',
            player1: {
              id: 'tp-1-03',
              player_id: '00000000-0000-0000-0000-000000000003',
              seed: 3,
              full_name: 'Jordan Cruz',
              avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&h=200&q=80',
              skill_rating: 4.45,
              rank_tier: 'Platinum',
              dupr_id: 'DUPR-38190',
              registered_at: '2026-10-05T12:00:00Z',
            },
            player2: {
              id: 'tp-1-05',
              player_id: '00000000-0000-0000-0000-000000000005',
              seed: 6,
              full_name: 'Devon Hayes',
              avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&h=200&q=80',
              skill_rating: 3.65,
              rank_tier: 'Silver',
              dupr_id: 'DUPR-77319',
              registered_at: '2026-10-05T15:20:00Z',
            },
            score1: 11,
            score2: 8,
            winner_id: '00000000-0000-0000-0000-000000000003',
            status: 'completed',
            court_name: 'Court 4',
            scheduled_time: 'Saturday 12:45 PM',
          },
        ],
      },
      {
        round_index: 1,
        round_name: 'Semifinals',
        matches: [
          {
            id: 'tourn-1-m-sf1',
            round_index: 1,
            round_name: 'Semifinals',
            match_number: 5,
            next_match_id: 'tourn-1-m-final',
            next_slot: 'player1',
            player1: {
              id: 'tp-1-04',
              player_id: '00000000-0000-0000-0000-000000000004',
              seed: 1,
              full_name: 'Elena Rostova',
              avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&h=200&q=80',
              skill_rating: 5.15,
              rank_tier: 'Pickle Master',
              dupr_id: 'DUPR-10294',
              registered_at: '2026-10-05T10:00:00Z',
            },
            player2: {
              id: 'tp-1-02',
              player_id: '00000000-0000-0000-0000-000000000002',
              seed: 4,
              full_name: 'Frannnxx',
              avatar_url: '/src/assets/images/frannnxx_avatar_1791277042121.jpg',
              skill_rating: 4.15,
              rank_tier: 'Gold',
              dupr_id: 'DUPR-54812',
              registered_at: '2026-10-05T13:30:00Z',
            },
            score1: 8,
            score2: 9,
            winner_id: null,
            status: 'in_progress',
            court_name: 'Court 1 - Show Court',
            scheduled_time: 'Sunday 1:30 PM (Live Now)',
          },
          {
            id: 'tourn-1-m-sf2',
            round_index: 1,
            round_name: 'Semifinals',
            match_number: 6,
            next_match_id: 'tourn-1-m-final',
            next_slot: 'player2',
            player1: {
              id: 'tp-1-07',
              player_id: '00000000-0000-0000-0000-000000000007',
              seed: 2,
              full_name: 'Sam "Spin" Kowalski',
              avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&h=200&q=80',
              skill_rating: 4.80,
              rank_tier: 'Diamond',
              dupr_id: 'DUPR-49120',
              registered_at: '2026-10-05T11:15:00Z',
            },
            player2: {
              id: 'tp-1-03',
              player_id: '00000000-0000-0000-0000-000000000003',
              seed: 3,
              full_name: 'Jordan Cruz',
              avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&h=200&q=80',
              skill_rating: 4.45,
              rank_tier: 'Platinum',
              dupr_id: 'DUPR-38190',
              registered_at: '2026-10-05T12:00:00Z',
            },
            score1: null,
            score2: null,
            winner_id: null,
            status: 'pending',
            court_name: 'Court 2',
            scheduled_time: 'Sunday 2:45 PM',
          },
        ],
      },
      {
        round_index: 2,
        round_name: 'Championship Final',
        matches: [
          {
            id: 'tourn-1-m-final',
            round_index: 2,
            round_name: 'Championship Final',
            match_number: 7,
            next_match_id: null,
            next_slot: null,
            player1: null,
            player2: null,
            score1: null,
            score2: null,
            winner_id: null,
            status: 'pending',
            court_name: 'Tagum Center Arena - Grandstand',
            scheduled_time: 'Sunday 4:30 PM',
          },
        ],
      },
    ],
  },
  {
    id: 'tourn-2',
    title: 'Davao del Norte Masters Invitational',
    description: 'Exclusive 8-player bracket showdown featuring top rated athletes. Winners receive certified master ranking points, trophy, and cash prize.',
    category: 'Open Doubles',
    skill_level: 'Advanced (4.0 - 4.5)',
    format: 'Single Elimination (8 Players)',
    max_participants: 8,
    venue_name: 'Picklezone Tagum & Indoor Arena',
    venue_address: 'Purok 4, Brgy. Magugpo East, Tagum City',
    start_date: '2026-10-18T10:00:00Z',
    end_date: '2026-10-19T19:00:00Z',
    registration_deadline: '2026-10-17T20:00:00Z',
    entry_fee: 500,
    prize_pool: 25000,
    banner_image_url: '/src/assets/images/pickle_master_trophy_1790512697080.jpg',
    status: 'registration_open',
    created_by_admin_id: '00000000-0000-0000-0000-000000000001',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    participants: [
      {
        id: 'tp-2-03',
        player_id: '00000000-0000-0000-0000-000000000003',
        seed: 1,
        full_name: 'Jordan Cruz',
        avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&h=200&q=80',
        skill_rating: 4.45,
        rank_tier: 'Platinum',
        dupr_id: 'DUPR-38190',
        registered_at: '2026-10-06T09:00:00Z',
      },
      {
        id: 'tp-2-06',
        player_id: '00000000-0000-0000-0000-000000000006',
        seed: 2,
        full_name: 'Maya Lin',
        avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&h=200&q=80',
        skill_rating: 3.95,
        rank_tier: 'Gold',
        dupr_id: 'DUPR-62401',
        registered_at: '2026-10-06T10:30:00Z',
      },
      {
        id: 'tp-2-05',
        player_id: '00000000-0000-0000-0000-000000000005',
        seed: 3,
        full_name: 'Devon Hayes',
        avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&h=200&q=80',
        skill_rating: 3.65,
        rank_tier: 'Silver',
        dupr_id: 'DUPR-77319',
        registered_at: '2026-10-06T11:45:00Z',
      },
      {
        id: 'tp-2-07',
        player_id: '00000000-0000-0000-0000-000000000007',
        seed: 4,
        full_name: 'Sam "Spin" Kowalski',
        avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&h=200&q=80',
        skill_rating: 4.80,
        rank_tier: 'Diamond',
        dupr_id: 'DUPR-49120',
        registered_at: '2026-10-06T14:15:00Z',
      },
    ],
    rounds: [],
  },
  {
    id: 'tourn-3',
    title: 'Tagum Rotary Club Charity Slam',
    description: 'Community doubles and mixed open ladder tournament benefiting youth athletics in Davao del Norte. Welcoming intermediate and ladder climbers.',
    category: 'Mixed Doubles',
    skill_level: 'Intermediate (3.0 - 3.5)',
    format: 'Single Elimination (8 Players)',
    max_participants: 8,
    venue_name: 'Rotary Park Pickleball Hub',
    venue_address: 'Rotary Park Sports Complex, Tagum City',
    start_date: '2026-10-25T08:30:00Z',
    end_date: '2026-10-26T17:00:00Z',
    registration_deadline: '2026-10-24T18:00:00Z',
    entry_fee: 250,
    prize_pool: 12000,
    banner_image_url: '/src/assets/images/tagum_pickleball_club_1790516250921.jpg',
    status: 'registration_open',
    created_by_admin_id: '00000000-0000-0000-0000-000000000001',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    participants: [
      {
        id: 'tp-3-06',
        player_id: '00000000-0000-0000-0000-000000000006',
        seed: 1,
        full_name: 'Maya Lin',
        avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&h=200&q=80',
        skill_rating: 3.95,
        rank_tier: 'Gold',
        dupr_id: 'DUPR-62401',
        registered_at: '2026-10-07T09:15:00Z',
      },
      {
        id: 'tp-3-05',
        player_id: '00000000-0000-0000-0000-000000000005',
        seed: 2,
        full_name: 'Devon Hayes',
        avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&h=200&q=80',
        skill_rating: 3.65,
        rank_tier: 'Silver',
        dupr_id: 'DUPR-77319',
        registered_at: '2026-10-07T11:20:00Z',
      },
    ],
    rounds: [],
  },
  {
    id: 'tourn-4',
    title: 'Mindanao Pro Masters Series I',
    description: 'Inaugural certified Season 1 tournament concluded with thrilling tiebreak sets. Champion and Runner-up officially recorded.',
    category: "Men's Singles",
    skill_level: 'Pro Masters (4.5+)',
    format: 'Single Elimination (8 Players)',
    max_participants: 8,
    venue_name: 'Tagum Central Pickleball Complex',
    venue_address: 'Pioneer Ave, Magugpo Poblacion, Tagum City',
    start_date: '2026-09-20T09:00:00Z',
    end_date: '2026-09-22T18:00:00Z',
    registration_deadline: '2026-09-19T23:59:59Z',
    entry_fee: 600,
    prize_pool: 35000,
    banner_image_url: '/src/assets/images/pickleball_match_smash_1790518380509.jpg',
    status: 'completed',
    created_by_admin_id: '00000000-0000-0000-0000-000000000001',
    created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
    participants: [],
    rounds: [],
    champion: {
      id: 'tp-4-04',
      player_id: '00000000-0000-0000-0000-000000000004',
      seed: 1,
      full_name: 'Elena Rostova',
      avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&h=200&q=80',
      skill_rating: 5.15,
      rank_tier: 'Pickle Master',
      dupr_id: 'DUPR-10294',
      registered_at: '2026-09-18T10:00:00Z',
    },
    runner_up: {
      id: 'tp-4-03',
      player_id: '00000000-0000-0000-0000-000000000003',
      seed: 2,
      full_name: 'Jordan Cruz',
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&h=200&q=80',
      skill_rating: 4.45,
      rank_tier: 'Platinum',
      dupr_id: 'DUPR-38190',
      registered_at: '2026-09-18T11:00:00Z',
    },
  },
  {
    id: 'tourn-spin-smash',
    title: 'Spin & Smash Pavilion Grand Open 2026',
    description: 'Premier inaugural championship tournament celebrating the grand opening of Spin & Smash Pickleball Pavilion along National Highway, Visayan Village. DUPR points verified by certified regional officials.',
    category: 'Open Doubles',
    skill_level: 'All Skill Levels (Open)',
    format: 'Single Elimination (8 Players)',
    max_participants: 8,
    venue_name: 'Spin & Smash Pickleball Pavilion',
    venue_address: 'Visayan Village, National Highway, Tagum City',
    start_date: '2026-10-22T08:00:00Z',
    end_date: '2026-10-24T18:00:00Z',
    registration_deadline: '2026-10-21T23:59:59Z',
    entry_fee: 350,
    prize_pool: 20000,
    banner_image_url: '/src/assets/images/court_venue_metro_1790512684659.jpg',
    status: 'registration_open',
    created_by_admin_id: '00000000-0000-0000-0000-000000000001',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    participants: [
      {
        id: 'tp-ss-02',
        player_id: '00000000-0000-0000-0000-000000000002',
        seed: 1,
        full_name: 'Frannnxx',
        avatar_url: '/src/assets/images/frannnxx_avatar_1791277042121.jpg',
        skill_rating: 4.15,
        rank_tier: 'Gold',
        dupr_id: 'DUPR-54812',
        registered_at: '2026-10-08T10:00:00Z',
      },
      {
        id: 'tp-ss-07',
        player_id: '00000000-0000-0000-0000-000000000007',
        seed: 2,
        full_name: 'Sam "Spin" Kowalski',
        avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&h=200&q=80',
        skill_rating: 4.80,
        rank_tier: 'Diamond',
        dupr_id: 'DUPR-49120',
        registered_at: '2026-10-08T11:30:00Z',
      },
      {
        id: 'tp-ss-03',
        player_id: '00000000-0000-0000-0000-000000000003',
        seed: 3,
        full_name: 'Jordan Cruz',
        avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&h=200&q=80',
        skill_rating: 4.45,
        rank_tier: 'Platinum',
        dupr_id: 'DUPR-38190',
        registered_at: '2026-10-08T14:15:00Z',
      },
    ],
    rounds: [],
  },
];

export function getAllTournaments(): Tournament[] {
  return tournaments;
}

export function getTournamentById(id: string): Tournament | undefined {
  return tournaments.find((t) => t.id === id);
}

export function createTournament(
  data: Partial<Tournament>,
  createdByAdminId: string
): Tournament {
  const newId = `tourn-${Date.now()}`;
  const venue = data.venue_name || 'Tagum Central Pickleball Complex';
  const newTournament: Tournament = {
    id: newId,
    title: data.title || 'Official Tagum Tournament',
    description: data.description || 'Sanctioned competitive pickleball tournament in Tagum City.',
    category: data.category || "Men's Singles",
    skill_level: data.skill_level || 'Open Division (All)',
    format: data.format || 'Single Elimination (8 Players)',
    max_participants: data.max_participants || 8,
    venue_name: venue,
    venue_address: data.venue_address || 'Pioneer Ave, Magugpo Poblacion, Tagum City',
    start_date: data.start_date || new Date(Date.now() + 7 * 86400000).toISOString(),
    end_date: data.end_date || new Date(Date.now() + 9 * 86400000).toISOString(),
    registration_deadline: data.registration_deadline || new Date(Date.now() + 6 * 86400000).toISOString(),
    entry_fee: data.entry_fee ?? 350,
    prize_pool: data.prize_pool ?? 15000,
    banner_image_url: data.banner_image_url || '/src/assets/images/tagum_championship_trophy_1791477380864.jpg',
    status: 'registration_open',
    created_by_admin_id: createdByAdminId,
    created_at: new Date().toISOString(),
    participants: [],
    rounds: [],
  };

  tournaments.unshift(newTournament);

  // Add notification to live court feed
  liveCourtFeed.unshift({
    id: `f-${Date.now()}`,
    time: 'Just now',
    courtName: venue,
    type: 'status',
    text: `New Tournament Announced: "${newTournament.title}" (Prize Pool: ₱${newTournament.prize_pool.toLocaleString()}). Player registration is now open!`,
    badge: 'Tournament Open',
  });

  return newTournament;
}

export function joinTournament(
  tournamentId: string,
  playerId: string
): { success: boolean; tournament: Tournament; message?: string } {
  const tournament = tournaments.find((t) => t.id === tournamentId);
  if (!tournament) {
    throw new Error('Tournament not found');
  }

  if (tournament.status !== 'registration_open') {
    throw new Error('Tournament is no longer accepting registrations');
  }

  const existing = tournament.participants.find((p) => p.player_id === playerId);
  if (existing) {
    return { success: true, tournament, message: 'Already registered' };
  }

  if (tournament.participants.length >= tournament.max_participants) {
    throw new Error('Tournament roster is full');
  }

  const playerProfile = profiles.find((p) => p.id === playerId);
  if (!playerProfile) {
    throw new Error('Player profile not found');
  }

  const newParticipant: TournamentPlayer = {
    id: `tp-${tournamentId}-${playerId}`,
    player_id: playerProfile.id,
    seed: tournament.participants.length + 1,
    full_name: playerProfile.full_name,
    avatar_url: playerProfile.avatar_url,
    skill_rating: playerProfile.skill_rating,
    rank_tier: playerProfile.rank_tier,
    dupr_id: playerProfile.dupr_id,
    registered_at: new Date().toISOString(),
  };

  tournament.participants.push(newParticipant);

  // If tournament is now full, notify in feed
  if (tournament.participants.length === tournament.max_participants) {
    liveCourtFeed.unshift({
      id: `f-${Date.now()}`,
      time: 'Just now',
      courtName: tournament.venue_name,
      type: 'status',
      text: `Tournament Roster Full: "${tournament.title}" has reached ${tournament.max_participants} entrants. Admin can now generate brackets!`,
      badge: 'Roster Full',
    });
  }

  return { success: true, tournament, message: 'Successfully joined tournament' };
}

export function leaveTournament(
  tournamentId: string,
  playerId: string
): { success: boolean; tournament: Tournament; message?: string } {
  const tournament = tournaments.find((t) => t.id === tournamentId);
  if (!tournament) {
    throw new Error('Tournament not found');
  }

  if (tournament.status !== 'registration_open') {
    throw new Error('Cannot withdraw after tournament bracket has commenced');
  }

  tournament.participants = tournament.participants.filter((p) => p.player_id !== playerId);
  // Recalculate seed positions
  tournament.participants.forEach((p, idx) => {
    p.seed = idx + 1;
  });

  return { success: true, tournament, message: 'Withdrew from tournament' };
}

export function generateTournamentBracket(
  tournamentId: string
): { success: boolean; tournament: Tournament; message?: string } {
  const tournament = tournaments.find((t) => t.id === tournamentId);
  if (!tournament) {
    throw new Error('Tournament not found');
  }

  const rounds = buildSingleEliminationBracket(tournament.participants, tournament.id, tournament.venue_name);
  tournament.rounds = rounds;
  tournament.status = 'active';

  liveCourtFeed.unshift({
    id: `f-${Date.now()}`,
    time: 'Just now',
    courtName: tournament.venue_name,
    type: 'status',
    text: `Brackets Published: Single elimination bracket for "${tournament.title}" has been seeded and published! Matches are now underway.`,
    badge: 'Bracket Live',
  });

  return { success: true, tournament, message: 'Bracket generated and tournament activated' };
}

export function updateBracketMatchScore(
  tournamentId: string,
  matchId: string,
  params: {
    score1?: number;
    score2?: number;
    winnerId?: string;
    status?: 'pending' | 'in_progress' | 'completed';
  }
): { success: boolean; tournament: Tournament; updatedMatch?: BracketMatch } {
  const tournament = tournaments.find((t) => t.id === tournamentId);
  if (!tournament) {
    throw new Error('Tournament not found');
  }

  let foundMatch: BracketMatch | undefined;
  for (const round of tournament.rounds) {
    for (const match of round.matches) {
      if (match.id === matchId) {
        foundMatch = match;
        break;
      }
    }
    if (foundMatch) break;
  }

  if (!foundMatch) {
    throw new Error('Match not found in tournament bracket');
  }

  if (params.score1 !== undefined) foundMatch.score1 = params.score1;
  if (params.score2 !== undefined) foundMatch.score2 = params.score2;
  if (params.status !== undefined) foundMatch.status = params.status;

  // Determine winner if completed or winnerId explicitly set
  if (params.winnerId) {
    foundMatch.winner_id = params.winnerId;
    foundMatch.status = 'completed';
  } else if (
    params.status === 'completed' &&
    typeof foundMatch.score1 === 'number' &&
    typeof foundMatch.score2 === 'number'
  ) {
    if (foundMatch.score1 > foundMatch.score2 && foundMatch.player1) {
      foundMatch.winner_id = foundMatch.player1.player_id;
    } else if (foundMatch.score2 > foundMatch.score1 && foundMatch.player2) {
      foundMatch.winner_id = foundMatch.player2.player_id;
    }
  }

  // If match has a winner and feeds into a next match, advance winner
  if (foundMatch.status === 'completed' && foundMatch.winner_id && foundMatch.next_match_id) {
    const winningPlayer =
      foundMatch.player1?.player_id === foundMatch.winner_id
        ? foundMatch.player1
        : foundMatch.player2?.player_id === foundMatch.winner_id
        ? foundMatch.player2
        : null;

    if (winningPlayer) {
      // Find the next match
      for (const round of tournament.rounds) {
        for (const nextMatch of round.matches) {
          if (nextMatch.id === foundMatch.next_match_id) {
            if (foundMatch.next_slot === 'player1') {
              nextMatch.player1 = winningPlayer;
            } else if (foundMatch.next_slot === 'player2') {
              nextMatch.player2 = winningPlayer;
            }
            if (nextMatch.player1 && nextMatch.player2 && nextMatch.status === 'pending') {
              nextMatch.status = 'in_progress';
            }
            break;
          }
        }
      }
    }
  }

  // Check if final match was won
  const finalRound = tournament.rounds[tournament.rounds.length - 1];
  if (finalRound && finalRound.matches.length === 1) {
    const finalMatch = finalRound.matches[0];
    if (finalMatch.id === matchId && finalMatch.status === 'completed' && finalMatch.winner_id) {
      const champ =
        finalMatch.player1?.player_id === finalMatch.winner_id
          ? finalMatch.player1
          : finalMatch.player2;
      const runner =
        finalMatch.player1?.player_id === finalMatch.winner_id
          ? finalMatch.player2
          : finalMatch.player1;

      tournament.champion = champ;
      tournament.runner_up = runner;
      tournament.status = 'completed';

      liveCourtFeed.unshift({
        id: `f-${Date.now()}`,
        time: 'Just now',
        courtName: tournament.venue_name,
        type: 'status',
        text: `🏆 Tournament Champion Crowned! ${champ?.full_name} has won the "${tournament.title}"! (Prize: ₱${tournament.prize_pool.toLocaleString()})`,
        badge: 'Champion Crowned',
      });
    }
  }

  return { success: true, tournament, updatedMatch: foundMatch };
}

export function completeTournament(
  tournamentId: string,
  championId: string
): { success: boolean; tournament: Tournament } {
  const tournament = tournaments.find((t) => t.id === tournamentId);
  if (!tournament) {
    throw new Error('Tournament not found');
  }

  const champ = tournament.participants.find((p) => p.player_id === championId);
  tournament.champion = champ || null;
  tournament.status = 'completed';

  return { success: true, tournament };
}

export function deleteTournament(tournamentId: string): { success: boolean } {
  tournaments = tournaments.filter((t) => t.id !== tournamentId);
  return { success: true };
}

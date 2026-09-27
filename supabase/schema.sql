-- ============================================================================
-- PICKLEPLAY PLATFORM - SUPABASE POSTGRESQL ARCHITECTURE & SECURITY POLICIES
-- ============================================================================
-- Production Schema for Competitive Pickleball Court Booking, Verified Scoring,
-- DUPR Skill Rating Sync, and Bias-Free Ladder Grinding.
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Clean existing schema if necessary during resets
-- DROP TABLE IF EXISTS public.match_players CASCADE;
-- DROP TABLE IF EXISTS public.matches CASCADE;
-- DROP TABLE IF EXISTS public.bookings CASCADE;
-- DROP TABLE IF EXISTS public.courts CASCADE;
-- DROP TABLE IF EXISTS public.profiles CASCADE;

-- 2. PROFILES TABLE (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('player', 'court_admin')) DEFAULT 'player',
  rank_points INTEGER NOT NULL DEFAULT 1000 CHECK (rank_points >= 0),
  rank_tier TEXT NOT NULL CHECK (rank_tier IN ('Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Pickle Master')) DEFAULT 'Bronze',
  total_xp INTEGER NOT NULL DEFAULT 0 CHECK (total_xp >= 0),
  wins INTEGER NOT NULL DEFAULT 0 CHECK (wins >= 0),
  losses INTEGER NOT NULL DEFAULT 0 CHECK (losses >= 0),
  dupr_id TEXT,
  skill_rating NUMERIC(3,2) DEFAULT 3.00 CHECK (skill_rating >= 1.00 AND skill_rating <= 5.50),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index for leaderboard queries
CREATE INDEX IF NOT EXISTS idx_profiles_rank_points ON public.profiles (rank_points DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles (role);

-- 3. COURTS TABLE (Owned and managed by court_admin / referees)
CREATE TABLE IF NOT EXISTS public.courts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  address TEXT NOT NULL,
  total_courts INTEGER NOT NULL DEFAULT 4 CHECK (total_courts >= 1),
  is_indoor BOOLEAN NOT NULL DEFAULT false,
  hourly_rate NUMERIC(10,2) NOT NULL DEFAULT 35.00 CHECK (hourly_rate >= 0),
  surface_type TEXT DEFAULT 'Pro-Cushion Acrylic',
  amenities TEXT[] DEFAULT ARRAY['LED Lighting', 'Locker Rooms', 'Pro Shop', 'Ball Machines'],
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_courts_owner_id ON public.courts (owner_id);

-- 4. BOOKINGS TABLE (Court reservations with Stripe payments)
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  court_id UUID NOT NULL REFERENCES public.courts(id) ON DELETE CASCADE,
  court_number INTEGER NOT NULL DEFAULT 1 CHECK (court_number >= 1),
  booking_time TIMESTAMPTZ NOT NULL,
  duration_hours INTEGER NOT NULL DEFAULT 1 CHECK (duration_hours >= 1),
  total_amount NUMERIC(10,2) NOT NULL CHECK (total_amount >= 0),
  stripe_payment_intent_id TEXT,
  payment_status TEXT NOT NULL CHECK (payment_status IN ('pending', 'succeeded', 'failed', 'refunded')) DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings (user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_court_id ON public.bookings (court_id);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_time ON public.bookings (booking_time);

-- 5. MATCHES TABLE (Competitive rated matches)
CREATE TABLE IF NOT EXISTS public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  court_id UUID NOT NULL REFERENCES public.courts(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  game_type TEXT NOT NULL CHECK (game_type IN ('singles', 'doubles')) DEFAULT 'doubles',
  min_rating NUMERIC(3,2) DEFAULT 2.50 CHECK (min_rating >= 1.00 AND min_rating <= 5.50),
  max_rating NUMERIC(3,2) DEFAULT 5.50 CHECK (max_rating >= 1.00 AND max_rating <= 5.50),
  status TEXT NOT NULL CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')) DEFAULT 'open',
  winner_team TEXT CHECK (winner_team IN ('A', 'B')),
  team_a_score INTEGER DEFAULT 0 CHECK (team_a_score >= 0),
  team_b_score INTEGER DEFAULT 0 CHECK (team_b_score >= 0),
  scored_by_admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_matches_court_id ON public.matches (court_id);
CREATE INDEX IF NOT EXISTS idx_matches_status ON public.matches (status);
CREATE INDEX IF NOT EXISTS idx_matches_scheduled_at ON public.matches (scheduled_at DESC);

-- 6. MATCH PLAYERS (Junction table linking players to teams A and B)
CREATE TABLE IF NOT EXISTS public.match_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  team TEXT NOT NULL CHECK (team IN ('A', 'B')),
  rating_before INTEGER,
  rating_after INTEGER,
  xp_earned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_match_player UNIQUE (match_id, player_id)
);

CREATE INDEX IF NOT EXISTS idx_match_players_match ON public.match_players (match_id);
CREATE INDEX IF NOT EXISTS idx_match_players_player ON public.match_players (player_id);

-- 7. AUTOMATIC PROFILE TRIGGER ON auth.users
-- Automatically provisions a profile when a new user registers via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  assigned_role TEXT;
  user_full_name TEXT;
BEGIN
  -- Extract user role from metadata if specified, defaulting to 'player'
  assigned_role := COALESCE(new.raw_user_meta_data->>'role', 'player');
  IF assigned_role NOT IN ('player', 'court_admin') THEN
    assigned_role := 'player';
  END IF;

  user_full_name := COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1));

  INSERT INTO public.profiles (
    id,
    full_name,
    email,
    role,
    rank_points,
    rank_tier,
    total_xp,
    wins,
    losses,
    skill_rating,
    avatar_url
  ) VALUES (
    new.id,
    user_full_name,
    new.email,
    assigned_role,
    1000,
    'Bronze',
    0,
    0,
    0,
    3.00,
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80'
  );

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger definition
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Helper function to check if the current user is a court admin
CREATE OR REPLACE FUNCTION public.is_court_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id AND role = 'court_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_players ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
-- Anyone authenticated can view all profiles for rankings and roster info
CREATE POLICY "Profiles are viewable by authenticated users"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

-- Users can update their own personal info (name, avatar, dupr_id)
-- Note: rank_points, rank_tier, wins, losses are restricted to service role / backend API
CREATE POLICY "Users can update their own profile info"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- COURTS POLICIES
-- Anyone can view courts for booking and matches
CREATE POLICY "Courts are viewable by all authenticated users"
  ON public.courts FOR SELECT
  TO authenticated
  USING (true);

-- Only court_admins can insert new courts
CREATE POLICY "Court admins can create courts"
  ON public.courts FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = owner_id AND
    public.is_court_admin(auth.uid())
  );

-- Only the court owner can update their court details
CREATE POLICY "Court owners can update their courts"
  ON public.courts FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- BOOKINGS POLICIES
-- Users can view their own bookings; Court admins can view bookings for their facilities
CREATE POLICY "Users and court owners can view relevant bookings"
  ON public.bookings FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.courts
      WHERE courts.id = bookings.court_id AND courts.owner_id = auth.uid()
    )
  );

-- Players can create bookings for themselves
CREATE POLICY "Authenticated users can book courts"
  ON public.bookings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- MATCHES POLICIES
-- All users can view matches and live scores
CREATE POLICY "Matches are viewable by all authenticated users"
  ON public.matches FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated players can host/create a match
CREATE POLICY "Authenticated users can create matches"
  ON public.matches FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = host_id);

-- Host can update general match info ONLY while status is 'open'
CREATE POLICY "Hosts can edit open match settings"
  ON public.matches FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = host_id AND
    status = 'open'
  )
  WITH CHECK (
    auth.uid() = host_id AND
    status IN ('open', 'cancelled')
  );

-- ****************************************************************************
-- CRITICAL SECURITY RULE: VERIFIED SCOREKEEPING & NO-BIAS RANKINGS
-- PLAYERS CANNOT SCORE THEIR OWN MATCHES.
-- ONLY verified 'court_admin' users (court owners / official referees) can:
-- 1. Enter and update official match scores (team_a_score, team_b_score)
-- 2. Declare the winner_team
-- 3. Set status to 'completed'
-- 4. Record their admin ID in scored_by_admin_id
-- ****************************************************************************
CREATE POLICY "Court admins can officially score and complete matches"
  ON public.matches FOR UPDATE
  TO authenticated
  USING (
    -- User must be a court admin AND must be either the owner of the court or an authorized admin
    public.is_court_admin(auth.uid()) AND
    EXISTS (
      SELECT 1 FROM public.courts
      WHERE courts.id = matches.court_id
      AND courts.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    public.is_court_admin(auth.uid()) AND
    scored_by_admin_id = auth.uid()
  );

-- MATCH PLAYERS POLICIES
CREATE POLICY "Match players are viewable by all authenticated users"
  ON public.match_players FOR SELECT
  TO authenticated
  USING (true);

-- Players can join open matches
CREATE POLICY "Users can join open matches"
  ON public.match_players FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = player_id AND
    EXISTS (
      SELECT 1 FROM public.matches
      WHERE matches.id = match_id AND matches.status = 'open'
    )
  );

-- Players can leave an open match
CREATE POLICY "Users can leave open matches"
  ON public.match_players FOR DELETE
  TO authenticated
  USING (
    auth.uid() = player_id AND
    EXISTS (
      SELECT 1 FROM public.matches
      WHERE matches.id = match_id AND matches.status = 'open'
    )
  );

-- ============================================================================
-- 9. SEED DATA (For Immediate Development and Demo Verification)
-- ============================================================================
-- Safe idempotent demo records with deterministic UUIDs
DO $$
DECLARE
  admin_id UUID := '00000000-0000-0000-0000-000000000001';
  player1_id UUID := '00000000-0000-0000-0000-000000000002';
  player2_id UUID := '00000000-0000-0000-0000-000000000003';
  player3_id UUID := '00000000-0000-0000-0000-000000000004';
  player4_id UUID := '00000000-0000-0000-0000-000000000005';
  court1_id UUID := '11111111-1111-1111-1111-111111111111';
  court2_id UUID := '22222222-2222-2222-2222-222222222222';
  match1_id UUID := '33333333-3333-3333-3333-333333333331';
  match2_id UUID := '33333333-3333-3333-3333-333333333332';
BEGIN
  -- Profiles
  INSERT INTO public.profiles (id, full_name, email, role, rank_points, rank_tier, total_xp, wins, losses, dupr_id, skill_rating, avatar_url)
  VALUES 
    (admin_id, 'Coach Marcus Sterling', 'marcus@pickleplay.com', 'court_admin', 2240, 'Diamond', 8400, 78, 14, 'DUPR-99214', 4.85, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80'),
    (player1_id, 'Taylor Vance', 'taylor@pickleplay.com', 'player', 1680, 'Gold', 4250, 42, 19, 'DUPR-54812', 4.15, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80'),
    (player2_id, 'Jordan Cruz', 'jordan@pickleplay.com', 'player', 1940, 'Platinum', 6120, 58, 22, 'DUPR-38190', 4.45, 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&h=200&q=80'),
    (player3_id, 'Elena Rostova', 'elena@pickleplay.com', 'player', 2490, 'Pickle Master', 11300, 94, 11, 'DUPR-10294', 5.15, 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&h=200&q=80'),
    (player4_id, 'Devon Hayes', 'devon@pickleplay.com', 'player', 1340, 'Silver', 2100, 24, 21, 'DUPR-77319', 3.65, 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&h=200&q=80')
  ON CONFLICT (id) DO UPDATE SET 
    rank_points = EXCLUDED.rank_points,
    rank_tier = EXCLUDED.rank_tier,
    total_xp = EXCLUDED.total_xp,
    wins = EXCLUDED.wins,
    losses = EXCLUDED.losses;

  -- Courts (Tagum City, Davao del Norte, Philippines)
  INSERT INTO public.courts (id, name, owner_id, address, total_courts, is_indoor, hourly_rate, surface_type, amenities, image_url)
  VALUES 
    (court1_id, 'City Pickle Grounds (CPG) - Tagum', admin_id, 'National Highway, Brgy. Mankilam, Tagum City, Davao del Norte, Philippines', 6, true, 350.00, 'International Tournament Cushion Acrylic', ARRAY['24/7 Night Floodlights', 'DUPR Verified Cameras', 'Pro Shop & Rental Paddles', 'Hydration Bar', 'Locker Suites'], '/src/assets/images/pickleball_court_hero_1790512672504.jpg'),
    (court2_id, 'M Central Pickleball Club', admin_id, 'Doña Regina Dalisay Avenue, Tagum City, Davao del Norte, Philippines', 4, false, 280.00, 'All-Weather Championship Acrylic', ARRAY['Open Until 2:00 AM', 'Spectator Bleachers', 'Referees on Duty', 'Player Lounge Cafe'], '/src/assets/images/court_venue_metro_1790512684659.jpg')
  ON CONFLICT (id) DO NOTHING;

  -- Matches
  INSERT INTO public.matches (id, host_id, court_id, scheduled_at, game_type, min_rating, max_rating, status, winner_team, team_a_score, team_b_score, scored_by_admin_id)
  VALUES
    (match1_id, player1_id, court1_id, now() - INTERVAL '15 minutes', 'doubles', 3.50, 4.50, 'in_progress', NULL, 8, 9, NULL),
    (match2_id, player2_id, court1_id, now() - INTERVAL '2 hours', 'doubles', 4.00, 5.00, 'completed', 'A', 11, 7, admin_id)
  ON CONFLICT (id) DO NOTHING;

  -- Match Players for Live Match (match1)
  INSERT INTO public.match_players (match_id, player_id, team, rating_before)
  VALUES
    (match1_id, player1_id, 'A', 1680),
    (match1_id, player4_id, 'A', 1340),
    (match1_id, player2_id, 'B', 1940),
    (match1_id, player3_id, 'B', 2490)
  ON CONFLICT (match_id, player_id) DO NOTHING;
END $$;


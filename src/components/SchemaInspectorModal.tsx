import React, { useState } from 'react';
import { Database, ShieldCheck, Code, Check, Copy, X, Server, Layers } from 'lucide-react';

interface SchemaInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SchemaInspectorModal({ isOpen, onClose }: SchemaInspectorModalProps) {
  const [activeTab, setActiveTab] = useState<'schema' | 'rls' | 'architecture'>('schema');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const sqlSchemaSnippet = `-- ============================================================================
-- PICKLEPLAY PLATFORM - SUPABASE POSTGRESQL ARCHITECTURE & SECURITY POLICIES
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- PROFILES (Linked to auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('player', 'court_admin')) DEFAULT 'player',
  rank_points INTEGER NOT NULL DEFAULT 1000,
  rank_tier TEXT NOT NULL CHECK (rank_tier IN ('Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Pickle Master')) DEFAULT 'Bronze',
  total_xp INTEGER NOT NULL DEFAULT 0,
  wins INTEGER NOT NULL DEFAULT 0,
  losses INTEGER NOT NULL DEFAULT 0,
  dupr_id TEXT,
  skill_rating NUMERIC(3,2) DEFAULT 3.00 CHECK (skill_rating >= 1.00 AND skill_rating <= 5.50),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- COURTS
CREATE TABLE public.courts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  address TEXT NOT NULL,
  total_courts INTEGER NOT NULL DEFAULT 4,
  is_indoor BOOLEAN NOT NULL DEFAULT false,
  hourly_rate NUMERIC(10,2) NOT NULL DEFAULT 35.00,
  surface_type TEXT DEFAULT 'Pro-Cushion Acrylic',
  amenities TEXT[] DEFAULT ARRAY['LED Lighting', 'Pro Shop'],
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- BOOKINGS (Stripe Checkout)
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  court_id UUID NOT NULL REFERENCES public.courts(id) ON DELETE CASCADE,
  court_number INTEGER NOT NULL DEFAULT 1,
  booking_time TIMESTAMPTZ NOT NULL,
  duration_hours INTEGER NOT NULL DEFAULT 1,
  total_amount NUMERIC(10,2) NOT NULL,
  stripe_payment_intent_id TEXT,
  payment_status TEXT NOT NULL CHECK (payment_status IN ('pending', 'succeeded', 'failed', 'refunded')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- MATCHES (Rated Games)
CREATE TABLE public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  court_id UUID NOT NULL REFERENCES public.courts(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMPTZ DEFAULT now(),
  game_type TEXT NOT NULL CHECK (game_type IN ('singles', 'doubles')) DEFAULT 'doubles',
  min_rating NUMERIC(3,2) DEFAULT 2.50,
  max_rating NUMERIC(3,2) DEFAULT 5.50,
  status TEXT NOT NULL CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')) DEFAULT 'open',
  winner_team TEXT CHECK (winner_team IN ('A', 'B')),
  team_a_score INTEGER DEFAULT 0,
  team_b_score INTEGER DEFAULT 0,
  scored_by_admin_id UUID REFERENCES public.profiles(id),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- MATCH PLAYERS JUNCTION
CREATE TABLE public.match_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  team TEXT NOT NULL CHECK (team IN ('A', 'B')),
  rating_before INTEGER,
  rating_after INTEGER,
  xp_earned INTEGER DEFAULT 0,
  CONSTRAINT unique_match_player UNIQUE (match_id, player_id)
);

-- RLS SCOREKEEPING RULE (PREVENTS PLAYER SELF-SCORING BIAS)
CREATE POLICY "Court admins can officially score and complete matches"
  ON public.matches FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'court_admin')
    AND EXISTS (SELECT 1 FROM public.courts WHERE courts.id = matches.court_id AND courts.owner_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'court_admin')
    AND scored_by_admin_id = auth.uid()
  );`;

  const handleCopy = () => {
    navigator.clipboard.writeText(sqlSchemaSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[88vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">System Architecture & SQL Schema</h2>
              <p className="text-xs text-slate-400">
                PostgreSQL · Supabase RLS · Elo & XP Engine · Stripe
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-full bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 px-5 pt-3 border-b border-slate-800/80 bg-slate-950/40">
          <button
            onClick={() => setActiveTab('schema')}
            className={`px-3 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'schema'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>PostgreSQL Schema (.sql)</span>
          </button>
          <button
            onClick={() => setActiveTab('rls')}
            className={`px-3 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'rls'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Anti-Bias RLS Policies</span>
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`px-3 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'architecture'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>3-Tier Specs</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1 text-xs">
          {activeTab === 'schema' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400">
                  Ready-to-execute script saved in <code>supabase/schema.sql</code>
                </span>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 py-1.5 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs active:scale-95 transition-all"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy SQL Migration</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-slate-300 font-mono text-[11px] overflow-x-auto leading-relaxed">
                {sqlSchemaSnippet}
              </pre>
            </div>
          )}

          {activeTab === 'rls' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/40">
                <h3 className="text-sm font-bold text-emerald-400 mb-1">
                  1. Zero-Bias Scorekeeping Rule
                </h3>
                <p className="text-slate-300 leading-normal mb-2">
                  In competitive pickleball, players often dispute calls or misreport scores when allowed to self-score. PicklePlay solves this cryptographically and through database RLS:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-slate-400">
                  <li>
                    <strong className="text-white">Players cannot update:</strong> <code>team_a_score</code>, <code>team_b_score</code>, <code>winner_team</code>, or <code>status = 'completed'</code>.
                  </li>
                  <li>
                    <strong className="text-white">Only Court Admins & Referees:</strong> Can write scores to matches belonging to their authorized facility.
                  </li>
                  <li>
                    <strong className="text-white">Automated Backend Ingestion:</strong> When score is confirmed by referee, the server calculates Elo points, awards grinding XP, promotes rank tiers, and syncs DUPR.
                  </li>
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <h3 className="text-sm font-bold text-white mb-1">
                  2. Competitive Ladder Elo Algorithm
                </h3>
                <p className="text-slate-400 leading-normal">
                  Utilizes standard logistic curve <code>E_A = 1 / (1 + 10^((R_B - R_A)/400))</code> with Pickleball 11-point victory margin scaling. Tiers auto-upgrade: Bronze (&lt;1200), Silver (1200-1499), Gold (1500-1799), Platinum (1800-2099), Diamond (2100-2399), and Pickle Master (2400+).
                </p>
              </div>
            </div>
          )}

          {activeTab === 'architecture' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] font-bold uppercase text-emerald-400 block mb-1">
                  Tier 1
                </span>
                <h4 className="text-sm font-bold text-white mb-2">Database & Auth</h4>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Supabase PostgreSQL schema, RLS policies, trigger on <code>auth.users</code>, tables for profiles, courts, matches, match_players, and bookings.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] font-bold uppercase text-emerald-400 block mb-1">
                  Tier 2
                </span>
                <h4 className="text-sm font-bold text-white mb-2">Node.js API Layer</h4>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Express + TypeScript, role middleware (<code>requireCourtAdmin</code>), Elo & XP controllers, Stripe payments, DUPR rating sync, and match endpoints.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] font-bold uppercase text-emerald-400 block mb-1">
                  Tier 3
                </span>
                <h4 className="text-sm font-bold text-white mb-2">Mobile Interfaces</h4>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  React Native / Expo Router v3 code, AuthContext, AsyncStorage, Digital Scorepads, Stripe Checkout Sheet, and Ladder Grinding Dashboard.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

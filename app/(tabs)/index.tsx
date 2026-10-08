import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useNotifications } from '../../context/NotificationContext.tsx';
import { api } from '../../services/api.ts';
import { Match, RankTier } from '../../src/types.ts';
import {
  Trophy,
  Flame,
  Award,
  RefreshCw,
  Zap,
  Play,
  Calendar,
  MapPin,
  ChevronRight,
  Shield,
  ShieldCheck,
  Activity,
  CheckCircle2,
  Swords,
} from 'lucide-react';

interface DashboardProps {
  onNavigateTab?: (tab: string) => void;
  onOpenMatchModal?: () => void;
}

export default function DashboardScreen({ onNavigateTab, onOpenMatchModal }: DashboardProps) {
  const { user, isCourtAdmin, refreshUser } = useAuth();
  const { addNotification } = useNotifications();
  const [liveMatches, setLiveMatches] = useState<Match[]>([]);
  const [courtActivity, setCourtActivity] = useState<any>(null);
  const [isSyncingDupr, setIsSyncingDupr] = useState(false);
  const [duprSuccessMsg, setDuprSuccessMsg] = useState<string | null>(null);

  const fetchLiveMatches = async () => {
    try {
      const res = await api.matches.getMatches('in_progress');
      setLiveMatches(res.data || []);
    } catch (err) {
      console.error('Failed to fetch matches:', err);
    }
  };

  const fetchCourtActivity = async () => {
    try {
      const res = await api.courts.getActivityToday();
      if (res.success && res.data) {
        setCourtActivity(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch court activity:', err);
    }
  };

  useEffect(() => {
    fetchLiveMatches();
    fetchCourtActivity();
    const interval = setInterval(() => {
      fetchLiveMatches();
      fetchCourtActivity();
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleSyncDupr = async () => {
    setIsSyncingDupr(true);
    setDuprSuccessMsg(null);
    try {
      const res = await api.dupr.syncDupr();
      await refreshUser();
      setDuprSuccessMsg(`Synced DUPR ${res.skillRating} (${res.duprId})`);
      addNotification({
        title: 'Official DUPR Rating Synced',
        message: `Verified DUPR skill score updated to ${res.skillRating.toFixed(2)} (${res.duprId}). Synced with Philippine tournament circuits.`,
        type: 'dupr',
        targetTab: 'profile',
        actionLabel: 'View Profile',
        badge: `DUPR ${res.skillRating.toFixed(2)}`,
      });
      setTimeout(() => setDuprSuccessMsg(null), 4000);
    } catch (err: any) {
      console.error('DUPR sync error:', err);
    } finally {
      setIsSyncingDupr(false);
    }
  };

  if (!user) return null;

  // XP Progress Math
  // Each tier spans ~300 pts, with 2000 XP per tier bracket
  const xpCurrent = user.total_xp % 2000;
  const xpMax = 2000;
  const xpPercentage = Math.min(100, Math.round((xpCurrent / xpMax) * 100));

  const totalMatches = user.wins + user.losses;
  const winRate = totalMatches > 0 ? Math.round((user.wins / totalMatches) * 100) : 0;

  // Tier Badge Color Palette
  const getTierStyles = (tier: RankTier) => {
    switch (tier) {
      case 'Pickle Master':
        return {
          bg: 'from-amber-500/20 via-yellow-500/10 to-emerald-500/20',
          border: 'border-amber-400/40',
          text: 'text-amber-300',
          badgeBg: 'bg-amber-400/20 text-amber-300 border-amber-400/30',
        };
      case 'Diamond':
        return {
          bg: 'from-cyan-500/20 via-blue-500/10 to-indigo-500/20',
          border: 'border-cyan-400/40',
          text: 'text-cyan-300',
          badgeBg: 'bg-cyan-400/20 text-cyan-300 border-cyan-400/30',
        };
      case 'Platinum':
        return {
          bg: 'from-slate-400/20 via-slate-500/10 to-slate-300/20',
          border: 'border-slate-300/40',
          text: 'text-slate-200',
          badgeBg: 'bg-slate-300/20 text-slate-200 border-slate-300/30',
        };
      case 'Gold':
        return {
          bg: 'from-amber-600/20 via-yellow-600/10 to-amber-500/20',
          border: 'border-amber-500/40',
          text: 'text-amber-400',
          badgeBg: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        };
      case 'Silver':
        return {
          bg: 'from-zinc-400/20 via-slate-400/10 to-zinc-500/20',
          border: 'border-zinc-400/40',
          text: 'text-zinc-300',
          badgeBg: 'bg-zinc-400/20 text-zinc-300 border-zinc-400/30',
        };
      default:
        return {
          bg: 'from-amber-800/20 via-amber-900/10 to-orange-800/20',
          border: 'border-amber-700/40',
          text: 'text-amber-600',
          badgeBg: 'bg-amber-700/20 text-amber-600 border-amber-700/30',
        };
    }
  };

  const tierStyle = getTierStyles(user.rank_tier);

  return (
    <div className="flex flex-col space-y-5 pb-20 px-4 pt-3 max-w-2xl mx-auto w-full">
      {/* 1. ATHLETE PROFILE & RANK CARD */}
      <div
        className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${tierStyle.bg} bg-slate-900 border ${tierStyle.border} p-5 sm:p-6 shadow-2xl`}
      >
        {/* Background Action Photo Backdrop */}
        <div className="absolute inset-0 z-0 opacity-20 mix-blend-luminosity pointer-events-none">
          <img
            src="/src/assets/images/pickleball_action_hero_1790515984323.jpg"
            alt="Tournament Action"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/70 to-slate-950/30" />
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 cursor-pointer" onClick={() => onNavigateTab?.('profile')}>
            <div className="relative shrink-0">
              <img
                src={
                  user.id === '00000000-0000-0000-0000-000000000002' || user.full_name === 'Frannnxx'
                    ? '/src/assets/images/frannnxx_avatar_1791277042121.jpg'
                    : user.avatar_url || '/src/assets/images/frannnxx_avatar_1791277042121.jpg'
                }
                alt={user.full_name}
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500/60 shadow-lg"
              />
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-slate-900">
                <CheckCircle2 className="w-3 h-3 text-slate-950 stroke-[3]" />
              </span>
            </div>

            <div className="flex flex-col space-y-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-white tracking-tight hover:text-emerald-400 transition-colors leading-tight">
                  {user.full_name === 'Taylor Vance' ? 'Frannnxx' : user.full_name}
                </h2>
                {isCourtAdmin && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 uppercase tracking-wider">
                    ADMIN
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-300 font-medium">
                <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                <span>Tagum City, Davao del Norte, PH</span>
              </div>
            </div>
          </div>

          {/* Tier Label or Referee Authority Badge */}
          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1 border-t sm:border-t-0 pt-2.5 sm:pt-0 border-slate-800 shrink-0">
            {isCourtAdmin ? (
              <>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border text-xs font-black uppercase tracking-wider bg-emerald-500/20 border-emerald-500/40 text-emerald-400 shadow-md">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Court Admin</span>
                </div>
                <div className="text-[11px] text-emerald-300 font-mono">
                  Official Admin
                </div>
              </>
            ) : (
              <>
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border text-xs font-black uppercase tracking-wider ${tierStyle.badgeBg} shadow-md`}>
                  <Award className="w-3.5 h-3.5" />
                  <span>{user.rank_tier}</span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  Season 1 Ladder
                </div>
              </>
            )}
          </div>
        </div>

        {/* METRICS ROW: PLAYER ELO/RECORD (HIDDEN FOR ADMIN) */}
        {!isCourtAdmin && (
          <div className="relative z-10 grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-slate-800/80">
            <div className="bg-slate-950/70 backdrop-blur-sm rounded-xl px-2 py-2.5 border border-slate-800/60 text-center shadow-inner flex flex-col justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1 tracking-wider">
                ELO Points
              </span>
              <span className="text-lg sm:text-xl font-extrabold text-white font-['JetBrains_Mono'] tabular-nums my-0.5">
                {user.rank_points}
              </span>
              <span className="text-[10px] text-emerald-400/90 block mt-1 font-mono font-medium">
                Ladder Rating
              </span>
            </div>

            <div className="bg-slate-950/70 backdrop-blur-sm rounded-xl px-2 py-2.5 border border-slate-800/60 text-center shadow-inner flex flex-col justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1 tracking-wider">
                Record
              </span>
              <div className="flex flex-col items-center justify-center gap-0.5 my-1">
                <span className="inline-flex items-baseline gap-1">
                  <span className="text-base sm:text-lg font-black text-emerald-400 font-['JetBrains_Mono'] tabular-nums leading-none">
                    {user.wins}
                  </span>
                  <span className="text-xs font-bold text-emerald-400/90 uppercase tracking-normal">
                    W
                  </span>
                </span>
                <span className="inline-flex items-baseline gap-1">
                  <span className="text-base sm:text-lg font-black text-slate-300 font-['JetBrains_Mono'] tabular-nums leading-none">
                    {user.losses}
                  </span>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-normal">
                    L
                  </span>
                </span>
              </div>
              <div className="text-[10px] text-slate-400 block tracking-wide font-medium">
                <span className="text-emerald-400 font-bold font-mono">{winRate}%</span>{' '}
                <span className="text-slate-400">Win Rate</span>
              </div>
            </div>

            <div className="bg-slate-950/70 backdrop-blur-sm rounded-xl px-2 py-2.5 border border-slate-800/60 text-center shadow-inner flex flex-col justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1 tracking-wider">
                Total XP
              </span>
              <span className="text-lg sm:text-xl font-extrabold text-amber-400 font-['JetBrains_Mono'] tabular-nums my-0.5">
                {user.total_xp.toLocaleString()}
              </span>
              <span className="text-[10px] text-amber-400/90 block mt-1 font-mono font-medium">
                Season XP
              </span>
            </div>
          </div>
        )}

        {/* PROGRESS BAR (PLAYERS) OR COURT MANAGEMENT NOTICE (REFEREES) */}
        {isCourtAdmin ? (
          <div className="relative z-10 mt-4 p-3.5 rounded-2xl bg-slate-950/90 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-white block">Official Neutrality Mandate</span>
                <span className="text-[11px] text-slate-400">
                  Referees focus exclusively on court scoring and facility management. To play and earn ladder records, register as a Player athlete.
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              <button
                onClick={() => onNavigateTab?.('scorekeeper')}
                className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shrink-0 flex items-center justify-center gap-1.5 shadow active:scale-95 transition-all"
              >
                <Trophy className="w-3.5 h-3.5 text-slate-950" />
                <span>Scorepad Console</span>
              </button>
              <button
                onClick={() => onNavigateTab?.('profile')}
                className="flex-1 sm:flex-initial px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 font-bold text-xs border border-emerald-500/30 shrink-0 flex items-center justify-center gap-1 shadow"
              >
                <span>Register Player</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="relative z-10 mt-4">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
              <span className="flex items-center gap-1 font-medium">
                <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                XP Grinding Ladder
              </span>
              <span className="font-mono text-[11px] tabular-nums text-slate-300">
                {xpCurrent} / {xpMax} XP ({xpPercentage}%)
              </span>
            </div>
            <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-amber-400 rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${xpPercentage}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* 2. DUPR OFFICIAL RATING SYNC CARD (PLAYERS) OR REFEREE OFFICIATING STATION (REFEREES) */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-5 shadow-lg">
        {/* Background Court Texture */}
        <div className="absolute right-0 top-0 bottom-0 w-2/5 opacity-15 pointer-events-none overflow-hidden">
          <img
            src="/src/assets/images/pickleball_court_hero_1790512672504.jpg"
            alt="Court Backdrop"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-slate-900/60 to-slate-900" />
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black text-sm shadow">
              {isCourtAdmin ? <ShieldCheck className="w-6 h-6 text-emerald-400" /> : 'DUPR'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">
                  {isCourtAdmin ? 'Certified Official Scorer Station' : 'Dynamic Universal Rating'}
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-mono px-2 py-0.5 rounded border border-emerald-500/30 font-bold">
                  {isCourtAdmin ? 'LICENSE: REF-99214' : user.dupr_id || 'REGISTERED'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {isCourtAdmin
                  ? 'Authorized to score tournament matches and enter official point differentials for Philippine player ratings.'
                  : `Official algorithmic skill score: ${user.skill_rating.toFixed(2)}`}
              </p>
            </div>
          </div>

          {isCourtAdmin ? (
            <button
              onClick={() => onNavigateTab?.('scorekeeper')}
              className="flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-xs font-bold text-slate-950 active:scale-95 transition-all shadow"
            >
              <Trophy className="w-3.5 h-3.5 text-slate-950" />
              <span>Scorepad Console</span>
            </button>
          ) : (
            <button
              onClick={handleSyncDupr}
              disabled={isSyncingDupr}
              className="flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 active:scale-95 transition-all disabled:opacity-50 shadow"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${isSyncingDupr ? 'animate-spin' : ''}`} />
              <span>{isSyncingDupr ? 'Syncing...' : 'Sync DUPR'}</span>
            </button>
          )}
        </div>

        {duprSuccessMsg && (
          <div className="relative z-10 mt-3 p-2.5 rounded-lg bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{duprSuccessMsg}</span>
          </div>
        )}
      </div>

      {/* 3. QUICK NAVIGATION / ACTION ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={() => onNavigateTab?.(isCourtAdmin ? 'scorekeeper' : 'courts')}
          className="relative overflow-hidden flex items-center justify-between p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 active:scale-[0.98] transition-all text-left group shadow-lg min-h-[96px]"
        >
          {/* Tagum Court Picture Backdrop */}
          <div className="absolute inset-0 z-0 opacity-25 group-hover:opacity-35 transition-opacity">
            <img
              src="/src/assets/images/pickleball_court_hero_1790512672504.jpg"
              alt="Tagum Pickleball Courts"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
          </div>

          <div className="relative z-10">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-2 shadow">
              {isCourtAdmin ? <Shield className="w-4 h-4" /> : <Calendar className="w-4 h-4" />}
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
              {isCourtAdmin ? 'Scorekeeper Console' : 'Book Court'}
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              {isCourtAdmin ? 'Official Live Controls · Scorer Pad' : 'Tagum City · Stripe Instant Pass'}
            </p>
          </div>
          <ChevronRight className="relative z-10 w-4 h-4 text-slate-400 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
        </button>

        <button
          onClick={() => onNavigateTab?.(isCourtAdmin ? 'courts' : 'leaderboard')}
          className="relative overflow-hidden flex items-center justify-between p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 active:scale-[0.98] transition-all text-left group shadow-lg min-h-[96px]"
        >
          {/* Picture Backdrop */}
          <div className="absolute inset-0 z-0 opacity-25 group-hover:opacity-35 transition-opacity">
            <img
              src={
                isCourtAdmin
                  ? '/src/assets/images/tagum_pickleball_club_1790516250921.jpg'
                  : '/src/assets/images/tagum_championship_trophy_1791477380864.jpg'
              }
              alt="Action Backdrop"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
          </div>

          <div className="relative z-10">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mb-2 shadow">
              {isCourtAdmin ? <MapPin className="w-4 h-4" /> : <Trophy className="w-4 h-4" />}
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
              {isCourtAdmin ? 'Manage Facilities' : 'Leaderboards'}
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              {isCourtAdmin ? 'Tagum Venues & Reservations' : 'Season 1 · Top Masters & ELO'}
            </p>
          </div>
          <ChevronRight className="relative z-10 w-4 h-4 text-slate-400 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
        </button>
      </div>

      {/* 3.5. FEATURED TOURNAMENT & LIVE BRACKET SHOWCASE */}
      <div
        onClick={() => onNavigateTab?.('tournaments')}
        className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 cursor-pointer shadow-xl transition-all group p-5 flex flex-col sm:flex-row items-center justify-between gap-4"
      >
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
          <img
            src="/src/assets/images/tagum_championship_trophy_1791477380864.jpg"
            alt="Championship Trophy"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
        </div>

        <div className="relative z-10 flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-lg">
            <Swords className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 font-mono">
                Tagum Open Championship 2026
              </span>
              <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Bracket
              </span>
            </div>
            <h3 className="text-base font-black text-white group-hover:text-emerald-400 transition-colors">
              Single Elimination Brackets & Tournaments
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {isCourtAdmin
                ? 'Official Admin Bracket Builder · Score fixtures & advance winners'
                : 'Join certified tournaments, track bracket matchups & win prize purses'}
            </p>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-3 shrink-0">
          <div className="text-right hidden sm:block font-mono">
            <span className="text-xs font-black text-amber-400 block">₱15,000 Price</span>
            <span className="text-[10px] text-slate-400">8 Competitors</span>
          </div>
          <span className="py-2 px-3.5 rounded-xl bg-emerald-500 group-hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1 shadow-md shadow-emerald-500/20">
            <span>{isCourtAdmin ? 'Manage Brackets' : 'Explore Tournaments'}</span>
            <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />
          </span>
        </div>
      </div>

      {/* 4. LIVE VERIFIED MATCHES FEED */}
      <div className="space-y-3">
        {/* Banner with Tagum Arena & Referee Action */}
        <div className="relative overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 p-4 shadow-md flex items-center justify-between">
          <div className="absolute inset-0 z-0 opacity-25 pointer-events-none">
            <img
              src="/src/assets/images/referee_match_action_1790516268641.jpg"
              alt="Live Tagum League Arena"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
          </div>

          <div className="relative z-10 flex items-center gap-2.5 min-w-0 flex-1">
            <span className="relative flex h-3 w-3 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 flex-wrap">
                <span>Live Verified Matches</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-2 py-0.5 rounded-full border border-emerald-500/40 shrink-0">
                  Tagum Circuit
                </span>
              </h3>
              <p className="text-[11px] text-slate-300 leading-snug">Refereed games on center courts in Davao del Norte</p>
              {isCourtAdmin && (
                <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5 mt-0.5 text-[10px] text-emerald-400 font-mono">
                  <span className="whitespace-nowrap"><strong>{courtActivity?.totalPlayersToday || 56}</strong> players today</span>
                  <span className="text-slate-500">·</span>
                  <span className="whitespace-nowrap">{courtActivity?.totalActiveCourts || 11}/{courtActivity?.totalCourts || 14} courts occupied</span>
                </div>
              )}
            </div>
          </div>
          <span className="relative z-10 text-xs text-emerald-400 font-mono font-bold bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800 shadow whitespace-nowrap shrink-0">
            {liveMatches.length} Live
          </span>
        </div>

        {liveMatches.length === 0 ? (
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
            <Activity className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-slate-300 font-semibold">No live games in progress</p>
            <p className="text-xs text-slate-500 mt-1">
              Check court schedule or join upcoming open matches.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {liveMatches.map((m) => {
              const teamAPlayers = m.players?.filter((p) => p.team === 'A') || [];
              const teamBPlayers = m.players?.filter((p) => p.team === 'B') || [];

              return (
                <div
                  key={m.id}
                  className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl"
                >
                  {/* Venue Image Banner */}
                  <div className="relative h-24 w-full overflow-hidden bg-slate-950">
                    <img
                      src={m.court?.image_url || '/src/assets/images/pickleball_court_hero_1790512672504.jpg'}
                      alt={m.court?.name || 'Tagum Court Facility'}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />

                    <div className="absolute top-2.5 left-3 right-3 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-950/85 backdrop-blur-md border border-slate-700/80 text-slate-200">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="font-bold text-xs">{m.court?.name || 'Tagum Championship Arena'}</span>
                      </div>
                      <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 border border-emerald-400 uppercase tracking-wider shadow animate-pulse">
                        LIVE MATCH
                      </span>
                    </div>

                    <div className="absolute bottom-2 left-3 text-[11px] text-slate-400 font-mono">
                      <span>Tagum City · {m.game_type.toUpperCase()} · DUPR Sanctioned</span>
                    </div>
                  </div>

                  <div className="p-4 pt-3">
                    {/* SCOREBOARD DISPLAY */}
                    <div className="flex items-center justify-between py-2">
                      {/* Team A */}
                      <div className="flex-1">
                        <div className="text-xs font-bold text-slate-100 truncate">
                          {teamAPlayers.map((p) => p.player?.full_name).join(' & ') || 'Team A'}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          TEAM A ({m.game_type})
                        </div>
                      </div>

                      {/* Digital LED Scores */}
                      <div className="flex items-center gap-3 px-3 py-1 rounded-xl bg-slate-950/80 border border-slate-800">
                        <span className="text-2xl font-black text-emerald-400 font-['JetBrains_Mono'] tabular-nums">
                          {m.team_a_score}
                        </span>
                        <span className="text-slate-600 font-bold">:</span>
                        <span className="text-2xl font-black text-emerald-400 font-['JetBrains_Mono'] tabular-nums">
                          {m.team_b_score}
                        </span>
                      </div>

                      {/* Team B */}
                      <div className="flex-1 text-right">
                        <div className="text-xs font-bold text-slate-100 truncate">
                          {teamBPlayers.map((p) => p.player?.full_name).join(' & ') || 'Team B'}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          TEAM B ({m.game_type})
                        </div>
                      </div>
                    </div>

                    {/* Referee Tag */}
                    <div className="mt-3 pt-2.5 border-t border-slate-800/70 flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-emerald-400" />
                        Refereed by Certified Court Admin
                      </span>
                      {isCourtAdmin ? (
                        <button
                          onClick={() => onNavigateTab?.('scorekeeper')}
                          className="text-xs font-bold text-emerald-400 hover:underline"
                        >
                          Open Scorepad →
                        </button>
                      ) : (
                        <span className="text-slate-500 text-[10px]">Official Watch Mode</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

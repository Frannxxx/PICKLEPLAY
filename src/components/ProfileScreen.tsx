import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useNotifications } from '../../context/NotificationContext.tsx';
import { api } from '../../services/api.ts';
import { Match, RankTier } from '../../src/types.ts';
import {
  User,
  Trophy,
  Award,
  Zap,
  RefreshCw,
  CheckCircle2,
  Calendar,
  MapPin,
  Shield,
  Activity,
  LogOut,
  Clock,
  Sparkles,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
} from 'lucide-react';

interface ProfileScreenProps {
  onNavigateTab?: (tab: string) => void;
}

export default function ProfileScreen({ onNavigateTab }: ProfileScreenProps) {
  const { user, isCourtAdmin, logout, refreshUser } = useAuth();
  const { addNotification } = useNotifications();
  const [recentMatches, setRecentMatches] = useState<Match[]>([]);
  const [matchFilter, setMatchFilter] = useState<'all' | 'wins' | 'losses'>('all');
  const [isSyncingDupr, setIsSyncingDupr] = useState(false);
  const [duprSuccessMsg, setDuprSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const loadMatches = async () => {
      try {
        const res = await api.matches.getMatches();
        const matchesList = res.data || [];
        const completed = matchesList.filter((m) => m.status === 'completed');
        
        // Sort newest first
        completed.sort((a, b) => {
          const timeA = new Date(a.completed_at || a.scheduled_at || a.created_at || 0).getTime();
          const timeB = new Date(b.completed_at || b.scheduled_at || b.created_at || 0).getTime();
          return timeB - timeA;
        });

        setRecentMatches(completed);
      } catch (err) {
        console.error('Failed to load match history:', err);
      }
    };
    loadMatches();
  }, []);

  const handleSyncDupr = async () => {
    setIsSyncingDupr(true);
    setDuprSuccessMsg(null);
    try {
      const res = await api.dupr.syncDupr();
      await refreshUser();
      setDuprSuccessMsg(`Synced: DUPR ${res.skillRating} (${res.duprId})`);
      addNotification({
        title: 'Official DUPR Algorithm Sync',
        message: `Your skill rating is verified at ${res.skillRating.toFixed(2)} (${res.duprId}). Synced across Tagum tournament circuits.`,
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

  const totalMatches = user.wins + user.losses;
  const winRate = totalMatches > 0 ? Math.round((user.wins / totalMatches) * 100) : 0;
  const xpCurrent = user.total_xp % 2000;
  const xpMax = 2000;
  const xpPercentage = Math.min(100, Math.round((xpCurrent / xpMax) * 100));

  const getTierStyles = (tier: RankTier) => {
    switch (tier) {
      case 'Pickle Master':
        return {
          bg: 'from-amber-500/20 via-yellow-500/10 to-emerald-500/20',
          border: 'border-amber-400/40',
          badgeBg: 'bg-amber-400/20 text-amber-300 border-amber-400/40',
        };
      case 'Diamond':
        return {
          bg: 'from-cyan-500/20 via-blue-500/10 to-indigo-500/20',
          border: 'border-cyan-400/40',
          badgeBg: 'bg-cyan-400/20 text-cyan-300 border-cyan-400/40',
        };
      case 'Platinum':
        return {
          bg: 'from-slate-400/20 via-slate-500/10 to-slate-300/20',
          border: 'border-slate-300/40',
          badgeBg: 'bg-slate-300/20 text-slate-200 border-slate-300/40',
        };
      case 'Gold':
        return {
          bg: 'from-amber-600/20 via-yellow-600/10 to-amber-500/20',
          border: 'border-amber-500/40',
          badgeBg: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
        };
      case 'Silver':
        return {
          bg: 'from-zinc-400/20 via-slate-400/10 to-zinc-500/20',
          border: 'border-zinc-400/40',
          badgeBg: 'bg-zinc-400/20 text-zinc-300 border-zinc-400/40',
        };
      default:
        return {
          bg: 'from-amber-800/20 via-amber-900/10 to-orange-800/20',
          border: 'border-amber-700/40',
          badgeBg: 'bg-amber-700/20 text-amber-600 border-amber-700/40',
        };
    }
  };

  const tierStyle = getTierStyles(user.rank_tier);

  return (
    <div className="flex flex-col space-y-5 pb-20 px-4 pt-3 max-w-3xl mx-auto w-full">
      {/* 1. PLAYER HERO CARD */}
      <div
        className={`relative overflow-hidden rounded-3xl bg-slate-900 border ${tierStyle.border} shadow-2xl`}
      >
        {/* Cinematic Athlete Cover Picture Banner */}
        <div className="relative h-40 sm:h-48 w-full overflow-hidden bg-slate-950">
          <img
            src="/src/assets/images/player_profile_banner_1790516626987.jpg"
            alt="Pro Athlete Championship Court"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/70 via-transparent to-slate-950/40" />

          {/* Badges on Top of Cover */}
          <div className="absolute top-3.5 left-4 right-4 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/85 backdrop-blur-md border border-emerald-500/40 text-emerald-300 text-[11px] font-bold shadow-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Season 1 Active Athlete</span>
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/85 backdrop-blur-md border border-slate-700/80 text-slate-300 text-[11px] font-mono shadow-lg">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Official Roster</span>
            </span>
          </div>
        </div>

        <div className="relative p-6 pt-0">
          {/* Overlapping Avatar & Header Info */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 -mt-12 sm:-mt-14 mb-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="relative shrink-0 self-start sm:self-center">
                <img
                  src={
                    user.id === '00000000-0000-0000-0000-000000000002' || user.full_name === 'Frannnxx'
                      ? '/src/assets/images/frannnxx_avatar_1791277042121.jpg'
                      : user.avatar_url || '/src/assets/images/frannnxx_avatar_1791277042121.jpg'
                  }
                  alt={user.full_name}
                  referrerPolicy="no-referrer"
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-4 border-slate-900 shadow-2xl ring-2 ring-emerald-500/60"
                />
                <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 ring-4 ring-slate-900 shadow">
                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-950 stroke-[3]" />
                </span>
              </div>

              <div className="flex flex-col space-y-1">
                {/* Name & Role Badge Row */}
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-none">
                    {user.full_name === 'Taylor Vance' ? 'Frannnxx' : user.full_name}
                  </h1>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${
                      isCourtAdmin
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                        : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    }`}
                  >
                    {isCourtAdmin ? 'Court Admin / Referee' : 'Verified Player'}
                  </span>
                </div>

                {/* Email and ID Row */}
                <div className="flex items-center gap-2 text-xs text-slate-400 font-mono flex-wrap">
                  <span className="text-slate-300">{user.email}</span>
                  <span className="text-slate-600">|</span>
                  <span className="bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800 text-slate-400 text-[11px]">
                    ID: #{user.id.slice(-6)}
                  </span>
                </div>

                {/* Location Row */}
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 pt-0.5 font-medium">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  <span>Tagum City, Davao del Norte, PH</span>
                </div>
              </div>
            </div>

            {/* Tier Label & Division Badge */}
            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1.5 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800/80 shrink-0">
              <span
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-black uppercase tracking-wider ${tierStyle.badgeBg} shadow-md`}
              >
                <Award className="w-4 h-4" />
                <span>{user.rank_tier}</span>
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                Season 1 Competitive Ladder
              </span>
            </div>
          </div>

        {/* METRICS ROW */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5 pt-4 border-t border-slate-800/80">
          <div className="bg-slate-950/70 rounded-2xl p-3 border border-slate-800/60 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1 tracking-wider">
              Rank Points
            </span>
            <span className="text-2xl font-black text-white font-['JetBrains_Mono'] tabular-nums leading-none">
              {user.rank_points}
            </span>
            <span className="text-[10px] text-emerald-400 block font-mono mt-1 font-semibold">
              Official ELO
            </span>
          </div>

          <div className="bg-slate-950/70 rounded-2xl p-3 border border-slate-800/60 text-center flex flex-col justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1 tracking-wider">
              Match Record
            </span>
            <div className="flex flex-col items-center justify-center gap-0.5 my-1">
              <span className="inline-flex items-baseline gap-1">
                <span className="text-xl font-black text-emerald-400 font-['JetBrains_Mono'] tabular-nums leading-none">
                  {user.wins}
                </span>
                <span className="text-xs font-bold text-emerald-400/90 tracking-normal">
                  W
                </span>
              </span>
              <span className="inline-flex items-baseline gap-1">
                <span className="text-xl font-black text-slate-300 font-['JetBrains_Mono'] tabular-nums leading-none">
                  {user.losses}
                </span>
                <span className="text-xs font-bold text-slate-400 tracking-normal">
                  L
                </span>
              </span>
            </div>
            <div className="text-[10px] text-slate-400 block tracking-wide font-medium">
              <span className="text-emerald-400 font-bold font-mono">{winRate}%</span>{' '}
              <span className="text-slate-400">Win Rate</span>
            </div>
          </div>

          <div className="bg-slate-950/70 rounded-2xl p-3 border border-slate-800/60 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1 tracking-wider">
              DUPR Rating
            </span>
            <span className="text-2xl font-black text-blue-400 font-['JetBrains_Mono'] tabular-nums leading-none">
              {user.skill_rating.toFixed(2)}
            </span>
            <span className="text-[10px] text-blue-300 block font-mono mt-1">
              {user.dupr_id || 'REGISTERED'}
            </span>
          </div>

          <div className="bg-slate-950/70 rounded-2xl p-3 border border-slate-800/60 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1 tracking-wider">
              Total XP
            </span>
            <span className="text-2xl font-black text-amber-400 font-['JetBrains_Mono'] tabular-nums leading-none">
              {user.total_xp.toLocaleString()}
            </span>
            <span className="text-[10px] text-amber-300 block font-mono mt-1">
              Season Grinder
            </span>
          </div>
        </div>

        {/* XP PROGRESS BAR */}
        <div className="mt-4 pt-1">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span className="flex items-center gap-1.5 font-bold text-slate-300">
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>Progression to Next Rank Tier</span>
            </span>
            <span className="font-mono text-[11px] tabular-nums text-slate-300">
              {xpCurrent.toLocaleString()} / {xpMax.toLocaleString()} XP ({xpPercentage}%)
            </span>
          </div>
          <div className="h-2.5 w-full bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 via-yellow-400 to-amber-400 rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${xpPercentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>

      {/* 2. DUPR OFFICIAL RATING & REGISTRY SYNC */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-black text-base">
              DUPR
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Dynamic Universal Pickleball Rating</h3>
                <span className="text-[10px] bg-blue-500/20 text-blue-400 font-mono px-2 py-0.5 rounded border border-blue-500/30">
                  {user.dupr_id || 'DUPR-TAGUM-PH'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Official global rating algorithm verified across Philippine tournament circuits: <strong className="text-emerald-400 font-mono">{user.skill_rating.toFixed(2)}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={handleSyncDupr}
            disabled={isSyncingDupr}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 active:scale-95 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-blue-400 ${isSyncingDupr ? 'animate-spin' : ''}`} />
            <span>{isSyncingDupr ? 'Syncing DUPR...' : 'Sync Official DUPR'}</span>
          </button>
        </div>

        {duprSuccessMsg && (
          <div className="mt-3.5 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{duprSuccessMsg}</span>
          </div>
        )}
      </div>

      {/* 3. AFFILIATED HOME VENUES (TAGUM CITY) */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 shadow-xl group">
        {/* Scenic Tagum Club Picture Banner */}
        <div className="relative h-36 sm:h-44 w-full overflow-hidden bg-slate-950">
          <img
            src="/src/assets/images/tagum_pickleball_club_1790516250921.jpg"
            alt="Tagum City Elite Pickleball Facility"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
          <div className="absolute top-3 left-4 right-4 flex items-center justify-between text-xs">
            <span className="px-3 py-1 rounded-full bg-slate-950/85 backdrop-blur-md border border-slate-700/80 text-emerald-400 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5 shadow">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Tagum League Home Facility
            </span>
            <span className="text-[11px] text-slate-300 font-mono bg-slate-950/85 backdrop-blur-md px-2.5 py-0.5 rounded-md border border-slate-700 shadow">
              Davao del Norte · 24/7 Courts
            </span>
          </div>
          <div className="absolute bottom-3 left-4">
            <h3 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>Affiliated Home Venues · Tagum City</span>
            </h3>
          </div>
        </div>

        <div className="p-5 pt-3">
          <div className="flex items-center justify-between mb-3 text-xs">
            <span className="text-slate-400">
              Primary court locations for your official Season 1 ladder fixtures:
            </span>
            <button
              onClick={() => onNavigateTab?.('courts')}
              className="font-bold text-emerald-400 hover:underline shrink-0 ml-2"
            >
              Book Courts →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3 hover:border-emerald-500/40 transition-colors">
              <img
                src="/src/assets/images/pickleball_court_hero_1790512672504.jpg"
                alt="City Pickle Grounds Tagum"
                className="w-14 h-14 rounded-xl object-cover border border-slate-700 shadow"
              />
              <div>
                <h4 className="text-xs font-bold text-white">City Pickle Grounds (CPG)</h4>
                <p className="text-[11px] text-slate-400">Brgy. Mankilam, Tagum City</p>
                <span className="text-[10px] text-emerald-400 font-mono">Home Facility · 24/7 Night Courts</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3 hover:border-emerald-500/40 transition-colors">
              <img
                src="/src/assets/images/court_venue_metro_1790512684659.jpg"
                alt="M Central Tagum"
                className="w-14 h-14 rounded-xl object-cover border border-slate-700 shadow"
              />
              <div>
                <h4 className="text-xs font-bold text-white">M Central Pickleball Club</h4>
                <p className="text-[11px] text-slate-400">Doña Regina Dalisay Ave, Tagum</p>
                <span className="text-[10px] text-emerald-400 font-mono">Open Until 2:00 AM · 4 Courts</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. MATCH HISTORY SECTION */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        {/* Tournament Action Picture Banner */}
        <div className="relative h-32 sm:h-36 w-full overflow-hidden bg-slate-950">
          <img
            src="/src/assets/images/referee_match_action_1790516268641.jpg"
            alt="Official Referee Match Scoring"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
          <div className="absolute top-3 left-4 right-4 flex items-center justify-between text-xs">
            <span className="px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-700/80 text-amber-400 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5 shadow">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              Verified Anti-Bias Ledger
            </span>
            <span className="text-[11px] text-slate-300 font-mono bg-slate-950/80 px-2.5 py-0.5 rounded-full border border-slate-800 shadow">
              Season 1 Elo & DUPR
            </span>
          </div>
          <div className="absolute bottom-2.5 left-4">
            <h3 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Match History</span>
            </h3>
            <p className="text-[11px] text-slate-300 font-mono">
              Official scores, match dates, and certified Elo rating adjustments
            </p>
          </div>
        </div>

        <div className="p-5 pt-3">
          {/* Controls & Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800/80">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setMatchFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  matchFilter === 'all'
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                All Matches ({recentMatches.length})
              </button>
              <button
                onClick={() => setMatchFilter('wins')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  matchFilter === 'wins'
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                Victories ({
                  recentMatches.filter((m) => {
                    const up = m.players?.find((p) => p.player_id === user.id) || m.players?.[0];
                    return up && m.winner_team === up.team;
                  }).length
                })
              </button>
              <button
                onClick={() => setMatchFilter('losses')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  matchFilter === 'losses'
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                Defeats ({
                  recentMatches.filter((m) => {
                    const up = m.players?.find((p) => p.player_id === user.id) || m.players?.[0];
                    return up && m.winner_team && m.winner_team !== up.team;
                  }).length
                })
              </button>
            </div>

            <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Certified Official Ledger</span>
            </span>
          </div>

          {recentMatches.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs bg-slate-950 rounded-2xl border border-slate-800">
              <Calendar className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-white mb-1">No Matches Recorded</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Completed matches scored by certified referees will automatically appear here with official scores, date played, and Elo rating changes.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentMatches
                .filter((m) => {
                  const up = m.players?.find((p) => p.player_id === user.id) || m.players?.[0];
                  const isWin = up && m.winner_team === up.team;
                  if (matchFilter === 'wins') return isWin;
                  if (matchFilter === 'losses') return !isWin;
                  return true;
                })
                .map((m) => {
                  const teamAPlayers = m.players?.filter((p) => p.team === 'A') || [];
                  const teamBPlayers = m.players?.filter((p) => p.team === 'B') || [];
                  const userPlayer = m.players?.find((p) => p.player_id === user.id) || m.players?.[0];
                  const userTeam = userPlayer?.team || 'A';
                  const isVictory = m.winner_team ? m.winner_team === userTeam : false;

                  // Elo calculation
                  let eloDelta = 0;
                  let ratingBefore = userPlayer?.rating_before;
                  let ratingAfter = userPlayer?.rating_after;

                  if (ratingBefore !== undefined && ratingAfter !== undefined) {
                    eloDelta = ratingAfter - ratingBefore;
                  } else if (isVictory) {
                    eloDelta = +24;
                    ratingBefore = user.rank_points - 24;
                    ratingAfter = user.rank_points;
                  } else {
                    eloDelta = -18;
                    ratingBefore = user.rank_points + 18;
                    ratingAfter = user.rank_points;
                  }

                  // Date formatting
                  const rawDate = m.completed_at || m.scheduled_at || m.created_at;
                  let formattedDate = 'Recent Match';
                  if (rawDate) {
                    const d = new Date(rawDate);
                    if (!isNaN(d.getTime())) {
                      formattedDate = d.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      });
                    }
                  }

                  return (
                    <div
                      key={m.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        isVictory
                          ? 'bg-slate-950/80 border-emerald-500/30 hover:border-emerald-500/60'
                          : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {/* Top Bar: Format, Date, Venue */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-slate-900">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-black px-2.5 py-0.5 rounded-full font-mono uppercase tracking-wider ${
                              isVictory
                                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                                : 'bg-rose-950 text-rose-300 border border-rose-500/30'
                            }`}
                          >
                            {isVictory ? 'VICTORY' : 'DEFEAT'}
                          </span>

                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono">
                            {m.game_type === 'singles' ? 'SINGLES 1v1' : 'DOUBLES 2v2'}
                          </span>
                        </div>

                        {/* Date Played */}
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          <span>{formattedDate}</span>
                        </div>
                      </div>

                      {/* Middle: Teams, Scores, and Elo Point Changes */}
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                        {/* Teams & Matchup (7 cols) */}
                        <div className="sm:col-span-7 space-y-1.5">
                          {/* Court Venue */}
                          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                            <MapPin className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{m.court?.name || 'Tagum City Elite Arena'}</span>
                          </div>

                          {/* Team Roster */}
                          <div className="space-y-1 text-xs">
                            <div className="flex items-center gap-2">
                              <span className="w-4 text-[10px] font-mono font-bold text-slate-500">A:</span>
                              <span className={`font-semibold ${userTeam === 'A' ? 'text-emerald-300 font-bold' : 'text-slate-300'}`}>
                                {teamAPlayers.map((p) => p.player?.full_name).join(' & ') || 'Team A'}
                              </span>
                              {userTeam === 'A' && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 font-mono border border-emerald-500/30">
                                  YOU
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="w-4 text-[10px] font-mono font-bold text-slate-500">B:</span>
                              <span className={`font-semibold ${userTeam === 'B' ? 'text-emerald-300 font-bold' : 'text-slate-300'}`}>
                                {teamBPlayers.map((p) => p.player?.full_name).join(' & ') || 'Team B'}
                              </span>
                              {userTeam === 'B' && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 font-mono border border-emerald-500/30">
                                  YOU
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Scores & Elo Point Changes (5 cols) */}
                        <div className="sm:col-span-5 flex sm:flex-col items-center sm:items-end justify-between gap-1.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-900">
                          {/* Exact Score Display */}
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono uppercase text-slate-500">Score</span>
                            <div className="text-xl font-black font-['JetBrains_Mono'] tracking-tight text-white bg-slate-900 px-3 py-0.5 rounded-xl border border-slate-800 shadow">
                              <span className={m.winner_team === 'A' ? 'text-emerald-400' : 'text-slate-300'}>
                                {m.team_a_score}
                              </span>
                              <span className="text-slate-600 mx-1.5">-</span>
                              <span className={m.winner_team === 'B' ? 'text-emerald-400' : 'text-slate-300'}>
                                {m.team_b_score}
                              </span>
                            </div>
                          </div>

                          {/* Elo Point Changes Badge */}
                          <div className="flex items-center gap-1.5">
                            <div
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl font-mono text-xs font-black shadow-sm ${
                                eloDelta >= 0
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              }`}
                            >
                              {eloDelta >= 0 ? (
                                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                              ) : (
                                <ArrowDownRight className="w-3.5 h-3.5 text-rose-400 stroke-[3]" />
                              )}
                              <span>{eloDelta >= 0 ? `+${eloDelta}` : eloDelta} ELO</span>
                            </div>

                            {/* Progression before -> after */}
                            {ratingBefore !== undefined && ratingAfter !== undefined && (
                              <span className="text-[10px] font-mono text-slate-500 hidden sm:inline">
                                ({ratingBefore} → {ratingAfter})
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Bottom Footer: Referee Certification Sign-off */}
                      {m.scorer_admin && (
                        <div className="mt-2.5 pt-2 border-t border-slate-900 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                          <div className="flex items-center gap-1 text-emerald-400/80">
                            <Shield className="w-3 h-3 text-emerald-400" />
                            <span>Official Scorer: {m.scorer_admin.full_name}</span>
                          </div>
                          <span>Anti-Bias Certified</span>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>

      {/* 5. ACCOUNT LOG OUT */}
      <div className="pt-2">
        <button
          onClick={logout}
          className="w-full h-12 rounded-2xl bg-red-950/40 hover:bg-red-900/50 text-red-300 border border-red-500/30 text-xs font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out of Profile</span>
        </button>
      </div>
    </div>
  );
}

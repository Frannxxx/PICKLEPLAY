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
  ShieldCheck,
  Activity,
  LogOut,
  Clock,
  Sparkles,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  X,
  Mail,
  Lock,
  UserPlus,
  Users,
  Radio,
  Eye,
  Plus,
  Send,
  Flame,
  MessageSquare,
  Check,
} from 'lucide-react';

interface ProfileScreenProps {
  onNavigateTab?: (tab: string) => void;
}

export default function ProfileScreen({ onNavigateTab }: ProfileScreenProps) {
  const { user, isCourtAdmin, logout, refreshUser, switchUser, register } = useAuth();
  const { addNotification } = useNotifications();
  const [recentMatches, setRecentMatches] = useState<Match[]>([]);
  const [matchFilter, setMatchFilter] = useState<'all' | 'wins' | 'losses'>('all');
  const [refereeFilter, setRefereeFilter] = useState<'all' | 'doubles' | 'singles'>('all');
  const [isSyncingDupr, setIsSyncingDupr] = useState(false);
  const [duprSuccessMsg, setDuprSuccessMsg] = useState<string | null>(null);

  // Live Court Activity & Today's Attendance State
  const [courtActivity, setCourtActivity] = useState<any>(null);
  const [isLoadingCourtActivity, setIsLoadingCourtActivity] = useState(false);
  const [selectedFacilityFilter, setSelectedFacilityFilter] = useState<string>('all');
  const [isCourtUpdateModalOpen, setIsCourtUpdateModalOpen] = useState(false);
  const [updateMsg, setUpdateMsg] = useState('');
  const [updateAddedPlayers, setUpdateAddedPlayers] = useState(0);
  const [updateStatusText, setUpdateStatusText] = useState('High Activity');
  const [selectedUpdateCourtId, setSelectedUpdateCourtId] = useState('');
  const [isPostingCourtUpdate, setIsPostingCourtUpdate] = useState(false);
  const [checkInSuccessMsg, setCheckInSuccessMsg] = useState<string | null>(null);

  // Player Registration Modal for Referees who want to play
  const [isRegisterPlayerModalOpen, setIsRegisterPlayerModalOpen] = useState(false);
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regDuprId, setRegDuprId] = useState('');
  const [regIsSubmitting, setRegIsSubmitting] = useState(false);

  const handleSwitchToPlayer = () => {
    switchUser({
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
    });
    addNotification({
      title: 'Switched to Player Account',
      message: 'Now active as Frannnxx (Gold Tier Player). You can compete and grind ELO ladder records.',
      type: 'match',
    });
  };

  const handleRegisterPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regFullName || !regEmail) return;
    setRegIsSubmitting(true);
    try {
      await register({
        full_name: regFullName,
        email: regEmail,
        role: 'player',
        dupr_id: regDuprId || undefined,
      });
      setIsRegisterPlayerModalOpen(false);
      setRegFullName('');
      setRegEmail('');
      setRegDuprId('');
      addNotification({
        title: 'Player Account Registered!',
        message: `Welcome, ${regFullName}! You are registered as a Player. You can now compete in sanctioned matches.`,
        type: 'match',
      });
    } catch (err: any) {
      console.error('Registration failed:', err);
    } finally {
      setRegIsSubmitting(false);
    }
  };

  const loadCourtActivity = async () => {
    setIsLoadingCourtActivity(true);
    try {
      const res = await api.courts.getActivityToday();
      if (res.success && res.data) {
        setCourtActivity(res.data);
      }
    } catch (err) {
      console.error('Failed to load court activity:', err);
    } finally {
      setIsLoadingCourtActivity(false);
    }
  };

  const handleSelfCheckIn = async (courtId?: string) => {
    try {
      const res = await api.courts.updateActivity({
        message: `${user?.full_name || 'Athlete'} checked in for court session`,
        addedPlayers: 1,
        statusText: 'Check-In',
        courtId,
      });
      if (res.success && res.data) {
        setCourtActivity(res.data);
        setCheckInSuccessMsg('Checked in! Today\'s player attendance incremented.');
        addNotification({
          title: 'Court Check-In Verified',
          message: `Welcome, ${user?.full_name}! You are registered on court today.`,
          type: 'match',
        });
        setTimeout(() => setCheckInSuccessMsg(null), 4000);
      }
    } catch (err) {
      console.error('Check-in error:', err);
    }
  };

  const handlePostCourtUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateMsg.trim() && updateAddedPlayers <= 0) return;
    setIsPostingCourtUpdate(true);
    try {
      const res = await api.courts.updateActivity({
        message: updateMsg.trim() || undefined,
        addedPlayers: Number(updateAddedPlayers) || 0,
        statusText: updateStatusText || undefined,
        courtId: selectedUpdateCourtId || undefined,
      });
      if (res.success && res.data) {
        setCourtActivity(res.data);
        addNotification({
          title: 'Court Status Broadcasted Live',
          message: updateMsg.trim()
            ? `Broadcast: "${updateMsg.trim()}" posted across Tagum.`
            : `+${updateAddedPlayers} walk-in players registered to today's count!`,
          type: 'match',
        });
        setUpdateMsg('');
        setUpdateAddedPlayers(0);
        setIsCourtUpdateModalOpen(false);
      }
    } catch (err) {
      console.error('Failed to post court update:', err);
    } finally {
      setIsPostingCourtUpdate(false);
    }
  };

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
    loadCourtActivity();
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
              <span>{isCourtAdmin ? 'Season 1 Active Admin' : 'Season 1 Active Athlete'}</span>
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
                    {isCourtAdmin ? 'Court Admin' : 'Verified Player'}
                  </span>
                </div>

                {/* Email and ID Row */}
                <div className="flex items-center gap-2 text-xs text-slate-400 font-mono flex-wrap">
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

            {/* Tier Label or Referee Authority Badge */}
            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1.5 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800/80 shrink-0">
              {isCourtAdmin ? (
                <>
                  <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-md">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Official Admin</span>
                  </span>
                  <span className="text-[11px] text-emerald-300 font-mono">
                    Facility Court Manager
                  </span>
                </>
              ) : (
                <>
                  <span
                    className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-black uppercase tracking-wider ${tierStyle.badgeBg} shadow-md`}
                  >
                    <Award className="w-4 h-4" />
                    <span>{user.rank_tier}</span>
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Season 1 Competitive Ladder
                  </span>
                </>
              )}
            </div>
          </div>

        {/* METRICS ROW: PLAYER STATS (HIDDEN FOR ADMIN) */}
        {!isCourtAdmin && (
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
        )}

        {/* XP PROGRESS BAR (PLAYERS ONLY) */}
        {!isCourtAdmin && (
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
        )}
      </div>
    </div>

      {/* 2. DUPR OFFICIAL RATING & REGISTRY SYNC (PLAYERS) OR REFEREE ACCREDITATION (REFEREES) */}
      {isCourtAdmin ? (
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black text-base shadow">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">Referee Official Accreditation & Clearance</h3>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-mono px-2 py-0.5 rounded border border-emerald-500/30 font-bold">
                    {user.dupr_id || 'REF-99214'}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Tagum City Circuit authorized official scorekeeper. Electronic scores directly validate tournament fixtures and adjust player ELO ratings.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigateTab?.('scorekeeper')}
                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs active:scale-95 transition-all shadow whitespace-nowrap"
              >
                <Trophy className="w-4 h-4 text-slate-950" />
                <span>Open Live Scorepad</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
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
      )}

      {/* 3. REFEREE-ONLY: LIVE COURT STATUS & DAILY ATTENDANCE MONITOR (VS PLAYER AFFILIATED VENUES) */}
      {isCourtAdmin ? (
        <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 shadow-xl group">
          {/* Scenic Tagum Club Picture Banner with Live Broadcast Overlay */}
          <div className="relative min-h-[220px] sm:min-h-[240px] md:min-h-[260px] h-60 sm:h-64 w-full overflow-hidden bg-slate-950">
            <img
              src="/src/assets/images/tagum_pickleball_club_1790516250921.jpg"
              alt="Tagum City Elite Pickleball Facility"
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-slate-950/25" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/30 to-transparent" />
            
            {/* Top Live Badges */}
            <div className="absolute top-3 left-4 right-4 z-10 flex items-center justify-between text-xs flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full bg-slate-950/90 backdrop-blur-md border border-emerald-500/50 text-emerald-400 font-bold text-[10px] uppercase tracking-wider flex items-center gap-2 shadow-lg">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="truncate">REFEREE COURT STATION · TAGUM CITY</span>
              </span>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={loadCourtActivity}
                  className="text-[11px] text-slate-300 font-mono bg-slate-950/85 hover:bg-slate-800 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700 shadow flex items-center gap-1.5 transition-colors active:scale-95"
                  title="Refresh Live Court Data"
                >
                  <RefreshCw className={`w-3 h-3 text-emerald-400 ${isLoadingCourtActivity ? 'animate-spin' : ''}`} />
                  <span>Updated Live</span>
                </button>
              </div>
            </div>

            {/* Banner Title & Tagum Status */}
            <div className="absolute bottom-3 sm:bottom-4 left-4 right-4 z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-3 max-w-[calc(100%-2rem)]">
              <div className="min-w-0 flex-1 max-w-full">
                <div className="flex items-center gap-x-2 gap-y-1 mb-1.5 flex-wrap">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase font-mono tracking-wider shrink-0">
                    Referee Monitoring Console
                  </span>
                  <span className="text-[11px] text-slate-300 font-mono shrink-0">
                    Davao del Norte · 3 Venues
                  </span>
                </div>
                <h3 className="text-base sm:text-lg md:text-xl font-black text-white tracking-tight flex items-center gap-2 font-['Cabinet_Grotesk'] leading-tight">
                  <span className="break-words">WHAT'S HAPPENING ON COURT</span>
                </h3>
                <p className="text-xs text-slate-300 mt-1 line-clamp-2 sm:line-clamp-none leading-relaxed">
                  Live game status across facilities & verified daily player attendance
                </p>
              </div>

              {/* Quick Check-in or Update Button in Header */}
              <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                <button
                  onClick={() => setIsCourtUpdateModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg active:scale-95 transition-all whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Post Court Update / Log Walk-Ins</span>
                </button>
              </div>
            </div>
          </div>

        {/* FEEDBACK BANNER (IF CHECKED IN) */}
        {checkInSuccessMsg && (
          <div className="p-3 bg-emerald-950/60 border-b border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between px-5">
            <span className="flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{checkInSuccessMsg}</span>
            </span>
            <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold">Verified Attendance</span>
          </div>
        )}

        <div className="p-5 space-y-5">
          {/* 1. HOW MANY PLAY TODAY - KEY METRICS ROW */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 font-mono">
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                <span>Today's Headcount & Court Capacity</span>
              </span>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-bold">
                Peak Hours · Night Sessions Active
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* Stat 1: Total Players Today */}
              <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-emerald-500/30 flex flex-col justify-between shadow-inner">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                  Players Today
                </span>
                <div className="flex items-baseline gap-1.5 my-1">
                  <span className="text-2xl sm:text-3xl font-black text-white font-['JetBrains_Mono'] leading-none">
                    {courtActivity?.totalPlayersToday || 56}
                  </span>
                  <span className="text-xs font-bold text-emerald-400 uppercase font-mono">
                    Athletes
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
                  <TrendingUp className="w-3 h-3" />
                  <span>+18% Peak Day</span>
                </div>
              </div>

              {/* Stat 2: Courts Active */}
              <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 flex flex-col justify-between shadow-inner">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                  Courts In Use
                </span>
                <div className="flex items-baseline gap-1.5 my-1">
                  <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-['JetBrains_Mono'] leading-none">
                    {courtActivity?.totalActiveCourts || 11}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    / {courtActivity?.totalCourts || 14}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  <span className="text-emerald-400 font-bold">{courtActivity?.occupancyPercentage || 78}%</span> in play
                </div>
              </div>

              {/* Stat 3: Matches Today */}
              <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 flex flex-col justify-between shadow-inner">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                  Matches Today
                </span>
                <div className="flex items-baseline gap-1.5 my-1">
                  <span className="text-2xl sm:text-3xl font-black text-amber-400 font-['JetBrains_Mono'] leading-none">
                    {courtActivity?.totalMatchesToday || 14}
                  </span>
                  <span className="text-xs text-amber-400/80 font-mono">Sets</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  Official Ladder Fixtures
                </div>
              </div>

              {/* Stat 4: Officials on Duty */}
              <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 flex flex-col justify-between shadow-inner">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                  Officials on Duty
                </span>
                <div className="flex items-baseline gap-1.5 my-1">
                  <span className="text-2xl sm:text-3xl font-black text-cyan-400 font-['JetBrains_Mono'] leading-none">
                    {courtActivity?.activeRefereesCount || 2}
                  </span>
                  <span className="text-xs text-cyan-300 font-mono">Certified</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono truncate" title="Marcus Sterling (REF-99214)">
                  Ref. Marcus Sterling
                </div>
              </div>
            </div>
          </div>

          {/* 2. FACILITY SELECTOR / FILTER TABS */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
            <div className="flex items-center gap-1.5 overflow-x-auto py-1">
              {[
                { id: 'all', label: 'All Tagum Venues (3)' },
                { id: '11111111-1111-1111-1111-111111111111', label: 'City Pickle Grounds (CPG)' },
                { id: '22222222-2222-2222-2222-222222222222', label: 'M Central Club' },
                { id: '33333333-3333-3333-3333-333333333330', label: 'Picklezone Arena' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedFacilityFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedFacilityFilter === tab.id
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                      : 'bg-slate-950/80 text-slate-300 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => onNavigateTab?.('courts')}
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 hover:underline flex items-center gap-1"
            >
              <span>Book Courts →</span>
            </button>
          </div>

          {/* 3. WHAT IS HAPPENING IN THE COURTS (FACILITY-BY-FACILITY & COURT-BY-COURT STATUS) */}
          <div className="space-y-4">
            {(courtActivity?.facilities || [
              {
                id: '11111111-1111-1111-1111-111111111111',
                name: 'City Pickle Grounds (CPG) - Tagum',
                shortName: 'CPG Mankilam',
                address: 'National Highway, Brgy. Mankilam, Tagum City',
                image_url: '/src/assets/images/pickleball_court_hero_1790512672504.jpg',
                total_courts: 6,
                active_courts: 4,
                players_today: 26,
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
                id: '22222222-2222-2222-2222-222222222222',
                name: 'M Central Pickleball Club',
                shortName: 'M Central',
                address: 'Doña Regina Dalisay Ave, Tagum City',
                image_url: '/src/assets/images/court_venue_metro_1790512684659.jpg',
                total_courts: 4,
                active_courts: 3,
                players_today: 16,
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
                id: '33333333-3333-3333-3333-333333333330',
                name: 'Picklezone Tagum & Indoor Arena',
                shortName: 'Picklezone Arena',
                address: 'Purok 4, Brgy. Magugpo East, Tagum City',
                image_url: '/src/assets/images/pickleball_court_hero_1790512672504.jpg',
                total_courts: 4,
                active_courts: 4,
                players_today: 14,
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
                    players: 'Registered Tournament Players',
                    score: 'Match Point',
                    referee: 'Certified Ref',
                  },
                ],
                recentUpdate: 'Rainproof indoor courts running at full capacity. Next open rotation at 7:30 PM.',
              },
            ])
              .filter((fac: any) => selectedFacilityFilter === 'all' || fac.id === selectedFacilityFilter)
              .map((fac: any) => (
                <div
                  key={fac.id}
                  className="rounded-2xl bg-slate-950 border border-slate-800 p-4 shadow-lg space-y-3.5 hover:border-slate-700 transition-colors"
                >
                  {/* Facility Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-slate-800/80">
                    <div className="flex items-center gap-3">
                      <img
                        src={fac.image_url}
                        alt={fac.name}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-700 shrink-0 shadow"
                      />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-white tracking-tight">
                            {fac.name}
                          </h4>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                            {fac.active_courts} / {fac.total_courts} Courts Occupied
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                          <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span>{fac.address}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-center">
                      <span className="text-[10px] bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 text-slate-300 font-mono">
                        <strong className="text-emerald-400">{fac.players_today}</strong> Players Today
                      </span>
                      <span className="text-[10px] bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/30 text-amber-300 font-mono">
                        {fac.lighting_status}
                      </span>
                    </div>
                  </div>

                  {/* Real-time Court Slots Grid */}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2 font-mono">
                      Current Court Status & Ongoing Action:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {fac.court_slots?.map((slot: any) => {
                        const isOccupied = slot.status === 'occupied';
                        const isAvailable = slot.status === 'available';
                        const isReserved = slot.status === 'reserved';

                        return (
                          <div
                            key={slot.courtNumber}
                            className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${
                              isOccupied
                                ? 'bg-slate-900/90 border-emerald-500/30 text-slate-200'
                                : isAvailable
                                ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
                                : 'bg-slate-900/60 border-slate-800 text-slate-400'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1 mb-1.5">
                              <span className="text-xs font-bold font-mono text-white flex items-center gap-1.5">
                                <span className={`w-2 h-2 rounded-full ${
                                  isOccupied
                                    ? 'bg-emerald-400 animate-pulse'
                                    : isAvailable
                                    ? 'bg-emerald-500'
                                    : 'bg-amber-400'
                                }`} />
                                Court #{slot.courtNumber}
                              </span>
                              <span
                                className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${
                                  isOccupied
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                    : isAvailable
                                    ? 'bg-emerald-500 text-slate-950 font-bold'
                                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                }`}
                              >
                                {isOccupied ? 'In Progress' : isAvailable ? 'Available' : 'Reserved'}
                              </span>
                            </div>

                            <p className="text-xs font-semibold text-white leading-tight mb-1">
                              {slot.title}
                            </p>

                            <p className="text-[11px] text-slate-400 truncate mb-1.5" title={slot.players}>
                              {slot.players}
                            </p>

                            <div className="flex items-center justify-between text-[10px] font-mono border-t border-slate-800/80 pt-1.5 text-slate-400">
                              <span>Score: <strong className="text-emerald-400">{slot.score || '-'}</strong></span>
                              {slot.referee && slot.referee !== 'None' && (
                                <span className="text-emerald-400 truncate max-w-[100px]" title={slot.referee}>
                                  {slot.referee}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Recent Court Notes / Activity */}
                  {fac.recentUpdate && (
                    <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 text-xs text-slate-300 flex items-center gap-2">
                      <Radio className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{fac.recentUpdate}</span>
                    </div>
                  )}
                </div>
              ))}
          </div>

          {/* 4. RECENT COURT HAPPENINGS & TIMELINE FEED */}
          <div className="rounded-2xl bg-slate-950 border border-slate-800 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 font-mono">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Live Court Activity Timeline</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                Continuous Tournament Feed
              </span>
            </div>

            <div className="space-y-2">
              {(courtActivity?.feed || [
                {
                  id: 'f-1',
                  time: '4m ago',
                  courtName: 'City Pickle Grounds (CPG)',
                  text: 'Match Finalized: Taylor Vance & Frannnxx secured 11-8 victory on Court 1',
                  badge: 'Score 11-8',
                },
                {
                  id: 'f-2',
                  time: '14m ago',
                  courtName: 'City Pickle Grounds (CPG)',
                  text: 'Official Referee Marcus Sterling verified electronic scoresheet and adjusted ladder ELO',
                  badge: 'REF-99214',
                },
                {
                  id: 'f-3',
                  time: '26m ago',
                  courtName: 'M Central Pickleball Club',
                  text: '4 new players checked in for Evening Doubles Ladder Duel on Court 2',
                  badge: '+4 Players',
                },
                {
                  id: 'f-4',
                  time: '42m ago',
                  courtName: 'Picklezone Tagum Indoor',
                  text: 'Youth & Masters Training Clinic completed on Courts 1-3. All courts transitioning to open games',
                  badge: '14 Athletes',
                },
                {
                  id: 'f-5',
                  time: '1h ago',
                  courtName: 'Tagum Circuit',
                  text: 'Night floodlights powered on across all Tagum City outdoor venues. Surface condition: Dry & Fast',
                  badge: 'Night Play Active',
                },
              ]).map((event: any) => (
                <div
                  key={event.id}
                  className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white text-xs">{event.courtName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{event.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-300 truncate mt-0.5">{event.text}</p>
                    </div>
                  </div>
                  {event.badge && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 whitespace-nowrap font-bold shrink-0">
                      {event.badge}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      ) : (
        /* 3. AFFILIATED HOME VENUES (PLAYERS VIEW ONLY) */
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
            <div className="flex items-center justify-end mb-3 text-xs">
              <button
                onClick={() => onNavigateTab?.('courts')}
                className="font-bold text-emerald-400 hover:underline shrink-0"
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
      )}

      {/* 4. OFFICIAL COURT SCORING LOG (REFEREES) OR MATCH HISTORY (PLAYERS) */}
      {isCourtAdmin ? (
        <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
          {/* Header Banner */}
          <div className="relative h-32 sm:h-36 w-full overflow-hidden bg-slate-950">
            <img
              src="/src/assets/images/referee_match_action_1790516268641.jpg"
              alt="Official Court Scoring Log"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
            <div className="absolute top-3 left-4 right-4 flex items-center justify-between text-xs">
              <span className="px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-emerald-500/40 text-emerald-400 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5 shadow">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Anti-Bias Scorer Ledger
              </span>
              <span className="text-[11px] text-slate-300 font-mono bg-slate-950/80 px-2.5 py-0.5 rounded-full border border-slate-800 shadow">
                Tagum Court Circuit
              </span>
            </div>
            <div className="absolute bottom-2.5 left-4">
              <h3 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>Court Scoring & Officiating Log</span>
              </h3>
            </div>
          </div>

          <div className="p-5 pt-3">
            {/* Filter Bar for Referees */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                <button
                  onClick={() => setRefereeFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    refereeFilter === 'all'
                      ? 'bg-emerald-500 text-slate-950 shadow-md'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  All Scored Games ({recentMatches.length})
                </button>
                <button
                  onClick={() => setRefereeFilter('doubles')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    refereeFilter === 'doubles'
                      ? 'bg-emerald-500 text-slate-950 shadow-md'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  Doubles ({recentMatches.filter((m) => m.game_type === 'doubles').length})
                </button>
                <button
                  onClick={() => setRefereeFilter('singles')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    refereeFilter === 'singles'
                      ? 'bg-emerald-500 text-slate-950 shadow-md'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  Singles ({recentMatches.filter((m) => m.game_type === 'singles').length})
                </button>
              </div>

              <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Certified Neutral Scorer</span>
              </span>
            </div>

            {/* Officiated Matches List */}
            {recentMatches.filter((m) => refereeFilter === 'all' || m.game_type === refereeFilter).length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs bg-slate-950 rounded-2xl border border-slate-800">
                <Calendar className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-white mb-1">No Officiated Matches Recorded</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Matches you score from the Referee Scorekeeper Console will appear here with official certified scorelines.
                </p>
                <button
                  onClick={() => onNavigateTab?.('scorekeeper')}
                  className="mt-3 px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
                >
                  Open Scorekeeper Console
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentMatches
                  .filter((m) => refereeFilter === 'all' || m.game_type === refereeFilter)
                  .map((m) => {
                    const teamAPlayers = m.players?.filter((p) => p.team === 'A') || [];
                    const teamBPlayers = m.players?.filter((p) => p.team === 'B') || [];
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
                        className="p-4 rounded-2xl border bg-slate-950/80 border-slate-800 hover:border-slate-700 transition-all"
                      >
                        {/* Top Bar */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-slate-900">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full font-mono uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              OFFICIALLY CERTIFIED
                            </span>

                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono">
                              {m.game_type === 'singles' ? 'SINGLES 1v1' : 'DOUBLES 2v2'}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
                            <Calendar className="w-3.5 h-3.5 text-slate-500" />
                            <span>{formattedDate}</span>
                          </div>
                        </div>

                        {/* Middle: Teams and Verified Score */}
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                          <div className="sm:col-span-7 space-y-1.5">
                            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                              <MapPin className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate">{m.court?.name || 'Tagum City Elite Arena'}</span>
                            </div>

                            <div className="space-y-1 text-xs">
                              <div className="flex items-center gap-2">
                                <span className="w-4 text-[10px] font-mono font-bold text-slate-500">A:</span>
                                <span className="text-slate-200 font-semibold">
                                  {teamAPlayers.map((p) => `${p.player?.full_name || 'Player'} (${p.player?.rank_points || 1200} ELO)`).join(' & ')}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="w-4 text-[10px] font-mono font-bold text-slate-500">B:</span>
                                <span className="text-slate-200 font-semibold">
                                  {teamBPlayers.map((p) => `${p.player?.full_name || 'Player'} (${p.player?.rank_points || 1200} ELO)`).join(' & ')}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Scores */}
                          <div className="sm:col-span-5 flex sm:flex-col items-center sm:items-end justify-between gap-1.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-900">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono uppercase text-slate-500">Official Score</span>
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

                            <span className="text-[10px] font-mono text-emerald-400/90 font-semibold">
                              Winner: Team {m.winner_team}
                            </span>
                          </div>
                        </div>

                        {/* Bottom Footer */}
                        <div className="mt-2.5 pt-2 border-t border-slate-900 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                          <div className="flex items-center gap-1 text-emerald-400/80">
                            <Shield className="w-3 h-3 text-emerald-400" />
                            <span>Scored by Official Referee: {user.full_name}</span>
                          </div>
                          <span>Anti-Bias Verified · Player ELO Adjusted</span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      ) : (
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
      )}

      {/* 5. PLAYER REGISTRATION MODAL (FOR REFEREES WHO WANT TO PLAY) */}
      {isRegisterPlayerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl relative overflow-hidden p-6">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Register Verified Player</h3>
                  <p className="text-[11px] text-slate-400">Create a player profile to compete and build records</p>
                </div>
              </div>
              <button
                onClick={() => setIsRegisterPlayerModalOpen(false)}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300 mb-4 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                Referees manage courts with 0 bias. To play matches, you register a separate Player account with official ELO tracking.
              </span>
            </div>

            <form onSubmit={handleRegisterPlayer} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Player Name</label>
                <input
                  type="text"
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  placeholder="e.g. Marcus The Player"
                  required
                  className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="e.g. marcus.player@pickleplay.com"
                  required
                  className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  DUPR ID <span className="text-slate-500 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={regDuprId}
                  onChange={(e) => setRegDuprId(e.target.value)}
                  placeholder="e.g. DUPR-77291"
                  className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="submit"
                  disabled={regIsSubmitting}
                  className="flex-1 h-11 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow active:scale-95 transition-all disabled:opacity-50"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{regIsSubmitting ? 'Registering...' : 'Register as Player & Play'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsRegisterPlayerModalOpen(false)}
                  className="h-11 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. COURT STATUS BROADCAST & WALK-IN LOGGER MODAL (FOR REFEREES & COURT ADMINS) */}
      {isCourtUpdateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <Radio className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Broadcast Court Status</h3>
                  <p className="text-[11px] text-slate-400">Post live status & log walk-in players</p>
                </div>
              </div>
              <button
                onClick={() => setIsCourtUpdateModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePostCourtUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Target Venue
                </label>
                <select
                  value={selectedUpdateCourtId}
                  onChange={(e) => setSelectedUpdateCourtId(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500"
                >
                  <option value="">City Pickle Grounds (CPG) - Mankilam</option>
                  <option value="22222222-2222-2222-2222-222222222222">M Central Pickleball Club</option>
                  <option value="33333333-3333-3333-3333-333333333330">Picklezone Tagum Indoor Arena</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Log Additional Walk-in Players
                </label>
                <div className="flex items-center gap-2">
                  {[0, 1, 2, 4, 8].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setUpdateAddedPlayers(count)}
                      className={`flex-1 h-9 rounded-xl text-xs font-bold font-mono transition-all ${
                        updateAddedPlayers === count
                          ? 'bg-emerald-500 text-slate-950 shadow'
                          : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {count === 0 ? 'None' : `+${count}`}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-slate-500 mt-1 font-mono">
                  Increments today's active player attendance across Tagum.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Live Status Badge
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['High Activity', 'Night Play Active', 'Courts Open'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setUpdateStatusText(st)}
                      className={`h-9 px-2 rounded-xl text-[11px] font-semibold truncate transition-all ${
                        updateStatusText === st
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                          : 'bg-slate-950 text-slate-400 border border-slate-800'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Court Announcement / Condition
                </label>
                <textarea
                  value={updateMsg}
                  onChange={(e) => setUpdateMsg(e.target.value)}
                  placeholder="e.g. Court 5 is open for instant walk-ins! Night floodlights on. Surface clean and dry."
                  rows={3}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="submit"
                  disabled={isPostingCourtUpdate}
                  className="flex-1 h-11 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow active:scale-95 transition-all disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isPostingCourtUpdate ? 'Broadcasting...' : 'Broadcast Court Update'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsCourtUpdateModalOpen(false)}
                  className="h-11 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

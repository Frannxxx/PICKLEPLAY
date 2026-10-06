import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import { LeaderboardEntry, RankTier } from '../../src/types.ts';
import {
  Trophy,
  Medal,
  Flame,
  Zap,
  TrendingUp,
  Award,
  Filter,
} from 'lucide-react';

export default function LeaderboardScreen() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchLeaderboard = async () => {
    setIsLoading(true);
    try {
      const res = await api.leaderboard.getLeaderboard('all');
      setEntries(res.data || []);
    } catch (err) {
      console.error('Failed to load leaderboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const getTierBadgeStyle = (tier: RankTier) => {
    switch (tier) {
      case 'Pickle Master':
        return 'bg-amber-400/20 text-amber-300 border-amber-400/40';
      case 'Diamond':
        return 'bg-cyan-400/20 text-cyan-300 border-cyan-400/40';
      case 'Platinum':
        return 'bg-slate-300/20 text-slate-200 border-slate-300/40';
      case 'Gold':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'Silver':
        return 'bg-zinc-400/20 text-zinc-300 border-zinc-400/40';
      default:
        return 'bg-amber-800/20 text-amber-600 border-amber-700/40';
    }
  };

  const top3 = entries.slice(0, 3);
  const remaining = entries.slice(3);

  return (
    <div className="flex flex-col space-y-4 pb-20 px-4 pt-3 max-w-2xl mx-auto w-full">
      {/* Header with Championship Trophy Picture Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 shadow-xl p-5">
        <div className="absolute inset-0 z-0 opacity-25 pointer-events-none">
          <img
            src="/src/assets/images/pickleball_ladder_trophy_1790516003619.jpg"
            alt="Season 1 Tournament Trophy"
            className="w-full h-full object-cover object-right"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-transparent" />
        </div>

        <div className="relative z-10 flex flex-col gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow">
              <Trophy className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight font-['Cabinet_Grotesk']">
              LEADERBOARDS
            </h1>
          </div>
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs text-amber-300 font-mono font-bold bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-full shadow">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              Season 1 · Elo Rated
            </span>
          </div>
        </div>
      </div>

      {/* TOP 3 PODIUM DISPLAY */}
      {top3.length >= 3 && (
        <div className="grid grid-cols-3 gap-2 pt-2 items-end">
          {/* #2 Rank */}
          <div className="rounded-2xl bg-slate-900/90 border border-slate-700/60 p-3 text-center relative flex flex-col items-center">
            <div className="absolute -top-3 w-6 h-6 rounded-full bg-slate-300 text-slate-950 font-black text-xs flex items-center justify-center shadow-md">
              2
            </div>
            <img
              src={top3[1].avatar_url}
              alt={top3[1].full_name}
              className="w-12 h-12 rounded-xl object-cover mt-2 border-2 border-slate-400"
            />
            <h4 className="text-xs font-bold text-white mt-1.5 truncate max-w-full">
              {top3[1].full_name}
            </h4>
            <span className="text-sm font-extrabold text-white font-['JetBrains_Mono'] tabular-nums mt-0.5">
              {top3[1].rank_points}
            </span>
            <span className="text-[10px] text-slate-400 font-mono mt-0.5">
              {top3[1].rank_tier}
            </span>
          </div>

          {/* #1 Champion */}
          <div className="rounded-2xl bg-gradient-to-b from-amber-500/20 via-slate-900 to-slate-900 border border-amber-400/50 p-3.5 text-center relative flex flex-col items-center shadow-lg -translate-y-1">
            <div className="absolute -top-4 w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-amber-300 text-slate-950 font-black text-sm flex items-center justify-center shadow-lg">
              👑
            </div>
            <img
              src={top3[0].avatar_url}
              alt={top3[0].full_name}
              className="w-14 h-14 rounded-2xl object-cover mt-2 border-2 border-amber-400 shadow-md"
            />
            <h4 className="text-xs font-black text-amber-300 mt-1.5 truncate max-w-full">
              {top3[0].full_name}
            </h4>
            <span className="text-base font-black text-amber-300 font-['JetBrains_Mono'] tabular-nums mt-0.5">
              {top3[0].rank_points} ELO
            </span>
            <span className="text-[10px] text-amber-400/90 font-mono font-bold mt-0.5">
              Pickle Master
            </span>
          </div>

          {/* #3 Rank */}
          <div className="rounded-2xl bg-slate-900/90 border border-slate-700/60 p-3 text-center relative flex flex-col items-center">
            <div className="absolute -top-3 w-6 h-6 rounded-full bg-amber-700 text-white font-black text-xs flex items-center justify-center shadow-md">
              3
            </div>
            <img
              src={top3[2].avatar_url}
              alt={top3[2].full_name}
              className="w-12 h-12 rounded-xl object-cover mt-2 border-2 border-amber-600"
            />
            <h4 className="text-xs font-bold text-white mt-1.5 truncate max-w-full">
              {top3[2].full_name}
            </h4>
            <span className="text-sm font-extrabold text-white font-['JetBrains_Mono'] tabular-nums mt-0.5">
              {top3[2].rank_points}
            </span>
            <span className="text-[10px] text-slate-400 font-mono mt-0.5">
              {top3[2].rank_tier}
            </span>
          </div>
        </div>
      )}

      {/* LADDER TABLE LIST */}
      <div className="space-y-2 mt-2">
        {entries.map((entry) => {
          const isCurrentUser = user?.id === entry.id;
          return (
            <div
              key={entry.id}
              className={`flex items-center justify-between p-3.5 rounded-2xl transition-all border ${
                isCurrentUser
                  ? 'bg-emerald-950/40 border-emerald-500/50 shadow-md ring-1 ring-emerald-500/30'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Left: Rank & Avatar */}
              <div className="flex items-center gap-3">
                <span className="w-6 text-center text-xs font-bold font-mono text-slate-400">
                  #{entry.ladder_rank}
                </span>

                <img
                  src={entry.avatar_url}
                  alt={entry.full_name}
                  className="w-10 h-10 rounded-xl object-cover border border-slate-700"
                />

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{entry.full_name}</span>
                    {isCurrentUser && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500 text-slate-950">
                        YOU
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                    <span className="font-mono">DUPR {entry.skill_rating.toFixed(2)}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-slate-400 font-mono">
                      {entry.wins}W - {entry.losses}L ({entry.win_rate}%)
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Elo & Tier Badge */}
              <div className="text-right">
                <div className="text-sm font-extrabold text-white font-['JetBrains_Mono'] tabular-nums">
                  {entry.rank_points}{' '}
                  <span className="text-[10px] font-semibold text-slate-400">PTS</span>
                </div>
                <div className="mt-1">
                  <span
                    className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${getTierBadgeStyle(
                      entry.rank_tier
                    )}`}
                  >
                    {entry.rank_tier}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

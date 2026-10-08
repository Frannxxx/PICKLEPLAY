import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import { Match, EloAdjustmentResult } from '../../src/types.ts';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Trophy,
  Minus,
  Plus,
  Flame,
  Award,
  ArrowRight,
  Sparkles,
  AlertCircle,
  RefreshCw,
  MapPin,
  User,
  Calendar,
  Activity,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ScorekeeperScreenProps {
  onScoreSubmitted?: (result: EloAdjustmentResult) => void;
}

export default function ScorekeeperScreen({ onScoreSubmitted }: ScorekeeperScreenProps) {
  const { user, isCourtAdmin, switchUser } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [teamAScore, setTeamAScore] = useState<number>(0);
  const [teamBScore, setTeamBScore] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionResult, setSubmissionResult] = useState<EloAdjustmentResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchMatches = async () => {
    try {
      const res = await api.matches.getMatches();
      const liveOrOpen = (res.data || []).filter(
        (m) => m.status === 'in_progress' || m.status === 'open'
      );
      setMatches(liveOrOpen);
      if (liveOrOpen.length > 0 && !selectedMatch) {
        setSelectedMatch(liveOrOpen[0]);
        setTeamAScore(liveOrOpen[0].team_a_score || 0);
        setTeamBScore(liveOrOpen[0].team_b_score || 0);
      }
    } catch (err) {
      console.error('Failed to load matches for scorekeeper:', err);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const handleSelectMatch = (m: Match) => {
    setSelectedMatch(m);
    setTeamAScore(m.team_a_score || 0);
    setTeamBScore(m.team_b_score || 0);
    setSubmissionResult(null);
    setErrorMessage(null);
  };

  const handleScoreAdjust = (team: 'A' | 'B', delta: number) => {
    if (team === 'A') {
      const next = Math.max(0, teamAScore + delta);
      setTeamAScore(next);
      if (selectedMatch) {
        api.scores.updateLiveScore(selectedMatch.id, next, teamBScore).catch(() => {});
      }
    } else {
      const next = Math.max(0, teamBScore + delta);
      setTeamBScore(next);
      if (selectedMatch) {
        api.scores.updateLiveScore(selectedMatch.id, teamAScore, next).catch(() => {});
      }
    }
  };

  const handleApplyPreset = (scoreA: number, scoreB: number) => {
    setTeamAScore(scoreA);
    setTeamBScore(scoreB);
    if (selectedMatch) {
      api.scores.updateLiveScore(selectedMatch.id, scoreA, scoreB).catch(() => {});
    }
  };

  const handleSubmitOfficialScore = async () => {
    if (!selectedMatch) return;
    setErrorMessage(null);

    if (teamAScore === teamBScore) {
      setErrorMessage('Cannot submit a tied match. Pickleball rules require a 2-point lead to win.');
      return;
    }

    if (teamAScore < 11 && teamBScore < 11) {
      setErrorMessage('Standard official games must reach at least 11 points.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.scores.submitScore(selectedMatch.id, teamAScore, teamBScore);
      setSubmissionResult(res.eloResult);
      onScoreSubmitted?.(res.eloResult);

      // Trigger celebratory confetti if any promotions occurred
      const hasPromotion = res.eloResult.adjustments.some((a) => a.promoted);
      if (hasPromotion) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }

      await fetchMatches();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit official match score');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Switch demo account to Coach Marcus (Court Admin)
  const handleSwitchToAdmin = async () => {
    try {
      const res = await api.auth.login('marcus@pickleplay.com', 'court_admin');
      if (res.user) {
        switchUser(res.user);
        await fetchMatches();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // **************************************************************************
  // 1. STRICT ROLE ACCESS GATE:
  // If player tries to access scorekeeper, show bias-prevention block
  // **************************************************************************
  if (!isCourtAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[75vh] px-6 text-center max-w-md mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <h2 className="text-xl font-black text-white font-['Cabinet_Grotesk'] tracking-tight mb-2">
          OFFICIAL REFEREE ACCESS RESTRICTED
        </h2>

        <p className="text-xs text-slate-300 leading-relaxed mb-4">
          <strong className="text-amber-400">Strict Anti-Bias Policy:</strong> Players cannot score their own matches to prevent rating manipulation and protect competitive integrity.
        </p>

        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-left text-xs text-slate-400 mb-6 space-y-2">
          <div className="flex items-center gap-2 text-slate-200 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Verified Referee System Rules
          </div>
          <p className="text-[11px] leading-normal">
            Only facility owners and certified referees with <code className="text-emerald-400">court_admin</code> credentials have scorekeeping clearance to finalize matches and adjust Elo/DUPR ratings.
          </p>
        </div>

        <button
          onClick={handleSwitchToAdmin}
          className="w-full h-12 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Switch to Coach Marcus (Court Admin Demo)</span>
        </button>
      </div>
    );
  }

  // **************************************************************************
  // 2. OFFICIAL COURT ADMIN SCOREKEEPER CONSOLE
  // **************************************************************************
  const teamAPlayers = selectedMatch?.players?.filter((p) => p.team === 'A') || [];
  const teamBPlayers = selectedMatch?.players?.filter((p) => p.team === 'B') || [];

  return (
    <div className="flex flex-col space-y-4 pb-20 px-4 pt-3 max-w-2xl mx-auto w-full">
      {/* Admin Authority Banner */}
      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 shadow-md">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <h1 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span>Referee Scorekeeper Console</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-mono">
                REF-99214
              </span>
            </h1>
            <p className="text-[11px] text-emerald-300">
              Official Court Scorer & Venue Manager: <span className="font-bold">{user?.full_name}</span>
            </p>
          </div>
        </div>
        <button
          onClick={fetchMatches}
          className="p-1.5 px-2.5 rounded-xl bg-emerald-900/40 hover:bg-emerald-800/60 text-emerald-300 text-xs flex items-center gap-1 font-semibold"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {errorMessage && (
        <div className="p-3 rounded-xl bg-red-950/70 border border-red-500/50 text-red-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* MATCH SELECTION ROW */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Active Facility Matches ({matches.length})
        </label>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {matches.map((m) => (
            <button
              key={m.id}
              onClick={() => handleSelectMatch(m)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border whitespace-nowrap transition-all flex items-center gap-2 ${
                selectedMatch?.id === m.id
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{m.court?.name ? m.court.name.split(' ')[0] : 'Court'} ({m.game_type})</span>
            </button>
          ))}
        </div>
      </div>

      {selectedMatch ? (
        <div className="space-y-4">
          {/* DIGITAL SCOREPAD INTERFACE */}
          <div className="rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl relative overflow-hidden">
            {/* Panoramic Championship Referee Picture Header */}
            <div className="relative h-32 sm:h-40 w-full overflow-hidden bg-slate-950">
              <img
                src="/src/assets/images/referee_scorepad_hero_1790517908238.jpg"
                alt="Official Referee Match Arena"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
              <div className="absolute top-3 left-4 right-4 flex items-center justify-between text-xs">
                <span className="px-3 py-1 rounded-full bg-slate-950/85 backdrop-blur-md border border-emerald-500/40 text-emerald-400 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5 shadow">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Live Official Scorepad
                </span>
                <span className="font-mono text-emerald-400 uppercase text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-950/85 backdrop-blur-md border border-slate-700 shadow">
                  Match #{selectedMatch.id.slice(-4)}
                </span>
              </div>
              <div className="absolute bottom-2.5 left-4">
                <h2 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <span>{selectedMatch.court?.name || 'Tagum Championship Arena'}</span>
                </h2>
              </div>
            </div>

            <div className="p-5 pt-3">
              <div className="flex items-center justify-between text-xs text-slate-400 pb-3 mb-4 border-b border-slate-800">
                <span className="font-medium text-slate-300">
                  Certified Court Referee Live Controls
                </span>
                <span className="font-mono text-emerald-400 uppercase text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/30">
                  {selectedMatch.game_type.toUpperCase()}
                </span>
              </div>

              {/* TEAM SCOREPAD COLUMNS */}
            <div className="grid grid-cols-2 gap-4">
              {/* TEAM A */}
              <div className="flex flex-col items-center p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
                <span className="text-[10px] font-black uppercase text-slate-400 mb-1 tracking-wider">
                  TEAM A
                </span>
                <div className="text-center min-h-[44px] mb-3">
                  {teamAPlayers.map((p) => (
                    <div key={p.id} className="text-xs font-bold text-white truncate max-w-[130px]">
                      {p.player?.full_name}
                      <span className="text-[10px] text-slate-400 block font-mono">
                        {p.player?.rank_points} ELO · {p.player?.rank_tier}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Score Big Display */}
                <div className="w-24 h-24 rounded-2xl bg-slate-900 border-2 border-emerald-500/50 flex items-center justify-center text-5xl font-black text-emerald-400 font-['JetBrains_Mono'] tabular-nums shadow-inner mb-3">
                  {teamAScore}
                </div>

                {/* Stepper Buttons */}
                <div className="grid grid-cols-2 gap-2 w-full max-w-[160px]">
                  <button
                    onClick={() => handleScoreAdjust('A', -1)}
                    className="h-11 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-black text-lg flex items-center justify-center active:scale-90 transition-transform border border-slate-700"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleScoreAdjust('A', 1)}
                    className="h-11 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-lg flex items-center justify-center active:scale-90 transition-transform shadow-md shadow-emerald-500/20"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* TEAM B */}
              <div className="flex flex-col items-center p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
                <span className="text-[10px] font-black uppercase text-slate-400 mb-1 tracking-wider">
                  TEAM B
                </span>
                <div className="text-center min-h-[44px] mb-3">
                  {teamBPlayers.map((p) => (
                    <div key={p.id} className="text-xs font-bold text-white truncate max-w-[130px]">
                      {p.player?.full_name}
                      <span className="text-[10px] text-slate-400 block font-mono">
                        {p.player?.rank_points} ELO · {p.player?.rank_tier}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Score Big Display */}
                <div className="w-24 h-24 rounded-2xl bg-slate-900 border-2 border-emerald-500/50 flex items-center justify-center text-5xl font-black text-emerald-400 font-['JetBrains_Mono'] tabular-nums shadow-inner mb-3">
                  {teamBScore}
                </div>

                {/* Stepper Buttons */}
                <div className="grid grid-cols-2 gap-2 w-full max-w-[160px]">
                  <button
                    onClick={() => handleScoreAdjust('B', -1)}
                    className="h-11 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-black text-lg flex items-center justify-center active:scale-90 transition-transform border border-slate-700"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleScoreAdjust('B', 1)}
                    className="h-11 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-lg flex items-center justify-center active:scale-90 transition-transform shadow-md shadow-emerald-500/20"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* QUICK PRESETS FOR FAST TESTING */}
            <div className="mt-4 pt-3 border-t border-slate-800/80">
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-2">
                Quick Finish Presets (Testing)
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleApplyPreset(11, 7)}
                  className="py-1.5 px-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-[11px] font-semibold text-slate-300 border border-slate-700 text-center"
                >
                  11 - 7 (Team A)
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset(9, 11)}
                  className="py-1.5 px-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-[11px] font-semibold text-slate-300 border border-slate-700 text-center"
                >
                  9 - 11 (Team B)
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset(11, 2)}
                  className="py-1.5 px-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-[11px] font-semibold text-slate-300 border border-slate-700 text-center"
                >
                  11 - 2 (Blowout)
                </button>
              </div>
            </div>

            {/* OFFICIAL SUBMIT SCORE BUTTON */}
            <button
              onClick={handleSubmitOfficialScore}
              disabled={isSubmitting}
              className="w-full h-12 mt-5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Submitting & Calculating Elo Engine...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                  <span>OFFICIAL SUBMIT SCORE & COMPLETE MATCH</span>
                </>
              )}
            </button>
          </div>
        </div>

          {/* POST-SUBMISSION ELO & XP BREAKDOWN RESULT */}
          {submissionResult && (
            <div className="rounded-3xl bg-slate-900 border border-emerald-500/60 p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
              <div className="flex items-center gap-2 text-emerald-400">
                <Trophy className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-black text-white">
                  Match Finalized: Team {submissionResult.winnerTeam} Victorious!
                </h3>
              </div>

              <p className="text-xs text-slate-400">
                Official final scoreline: {submissionResult.teamAScore} - {submissionResult.teamBScore}. Player rankings and DUPR skills have been updated.
              </p>

              {/* Individual Player Deltas */}
              <div className="space-y-2">
                {submissionResult.adjustments.map((adj) => (
                  <div
                    key={adj.playerId}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300">
                        {adj.team}
                      </div>
                      <div>
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <span>{adj.fullName}</span>
                          {adj.promoted && (
                            <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-amber-400 text-slate-950">
                              PROMOTED!
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {adj.tierBefore} → <span className="font-bold text-emerald-400">{adj.tierAfter}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div
                        className={`text-sm font-black font-['JetBrains_Mono'] ${
                          adj.ratingDelta > 0 ? 'text-emerald-400' : 'text-red-400'
                        }`}
                      >
                        {adj.ratingDelta > 0 ? `+${adj.ratingDelta}` : adj.ratingDelta} PTS
                      </div>
                      <div className="text-[11px] text-amber-400 font-mono">
                        +{adj.xpEarned} XP · DUPR {adj.skillRatingAfter.toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center">
          <AlertCircle className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-300">No active matches found</p>
          <p className="text-xs text-slate-500 mt-1">
            Matches hosted by players will appear here for referee scorekeeping.
          </p>
        </div>
      )}
      {/* 3. FACILITY COURT MANAGEMENT & MONITORING (REFEREE ONLY) */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Court Facility Live Management
              </h2>
              <p className="text-[11px] text-slate-400">
                Official court supervision across Tagum City centers
              </p>
            </div>
          </div>
          <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-mono px-2 py-0.5 rounded border border-emerald-500/30 font-bold">
            3 Facilities Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-xs text-white">City Pickle Grounds</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-[11px] text-slate-400 mb-2">4 Courts · 24/7 Night Lights</p>
            <div className="text-[10px] text-emerald-400 font-mono bg-emerald-950/40 px-2 py-1 rounded border border-emerald-500/30">
              Status: Referees on Duty
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-xs text-white">M Central Club</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-[11px] text-slate-400 mb-2">4 Courts · Open to 2 AM</p>
            <div className="text-[10px] text-amber-400 font-mono bg-amber-950/40 px-2 py-1 rounded border border-amber-500/30">
              Status: Live Scorer Active
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-xs text-white">Championship Arena</span>
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            </div>
            <p className="text-[11px] text-slate-400 mb-2">6 Courts · Sanctioned</p>
            <div className="text-[10px] text-blue-400 font-mono bg-blue-950/40 px-2 py-1 rounded border border-blue-500/30">
              Status: Tournament Ready
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

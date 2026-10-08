import React, { useState } from 'react';
import { Tournament, BracketMatch, TournamentPlayer } from '../types.ts';
import { Trophy, Shield, Clock, MapPin, Award, CheckCircle2, Flame, User, Sparkles } from 'lucide-react';
import AdminScoreMatchModal from './AdminScoreMatchModal.tsx';

interface TournamentBracketViewProps {
  tournament: Tournament;
  currentUserId?: string;
  isCourtAdmin?: boolean;
  onUpdateMatchScore?: (
    matchId: string,
    score1: number,
    score2: number,
    winnerId: string,
    status: 'in_progress' | 'completed'
  ) => Promise<void>;
  onGenerateBracket?: () => Promise<void>;
}

export default function TournamentBracketView({
  tournament,
  currentUserId,
  isCourtAdmin,
  onUpdateMatchScore,
  onGenerateBracket,
}: TournamentBracketViewProps) {
  const [activeMatchForScoring, setActiveMatchForScoring] = useState<BracketMatch | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const rounds = tournament.rounds || [];
  const hasRounds = rounds.length > 0;

  const handleOpenScoreModal = (match: BracketMatch) => {
    if (!isCourtAdmin) return;
    setActiveMatchForScoring(match);
  };

  const handleSaveScore = async (
    matchId: string,
    score1: number,
    score2: number,
    winnerId: string,
    status: 'in_progress' | 'completed'
  ) => {
    if (onUpdateMatchScore) {
      await onUpdateMatchScore(matchId, score1, score2, winnerId, status);
    }
  };

  const handleGenerate = async () => {
    if (!onGenerateBracket) return;
    setIsGenerating(true);
    try {
      await onGenerateBracket();
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col space-y-6">
      {/* 1. Champion Showcase Banner (When Completed) */}
      {tournament.status === 'completed' && tournament.champion && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-emerald-950/60 border border-amber-500/40 p-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="relative">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-amber-400 shadow-xl shadow-amber-500/20">
                  <img
                    src={tournament.champion.avatar_url || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&h=200&q=80'}
                    alt={tournament.champion.full_name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-lg font-black text-xs">
                  👑
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs uppercase tracking-widest text-amber-400 font-black flex items-center gap-1.5 justify-center sm:justify-start">
                  <Trophy className="w-3.5 h-3.5" />
                  Official Tournament Champion
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {tournament.champion.full_name}
                </h3>
                <div className="flex items-center gap-2 text-xs text-slate-300 mt-1 font-mono justify-center sm:justify-start">
                  <span>DUPR {tournament.champion.skill_rating?.toFixed(2) || '4.50'}</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-amber-400 font-bold">Prize Awarded: ₱{tournament.prize_pool.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {tournament.runner_up && (
              <div className="flex items-center gap-3 bg-slate-950/60 px-4 py-2.5 rounded-2xl border border-slate-800">
                <img
                  src={tournament.runner_up.avatar_url || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&h=120&q=80'}
                  alt={tournament.runner_up.full_name}
                  className="w-10 h-10 rounded-xl object-cover border border-slate-700"
                />
                <div className="flex flex-col text-left">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Runner-up Finalist
                  </span>
                  <span className="text-xs font-bold text-white">
                    {tournament.runner_up.full_name}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. Empty Bracket State / Admin Generator Prompt */}
      {!hasRounds ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 sm:p-12 text-center flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 shadow">
            <Trophy className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-white tracking-tight mb-2">
            Bracket Generation Pending
          </h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
            Player registrations are currently being collected. Currently{' '}
            <strong className="text-white">{tournament.participants.length}</strong> of{' '}
            <strong className="text-white">{tournament.max_participants}</strong> competitors registered.
          </p>

          {isCourtAdmin ? (
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="py-3 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isGenerating ? 'Building Single Elimination Tree...' : 'Generate Bracket & Seed Players'}</span>
              </button>
              <span className="text-xs text-slate-400">
                (Fills any open slots with certified ladder contenders)
              </span>
            </div>
          ) : (
            <div className="text-xs text-slate-400 bg-slate-950/60 px-4 py-2.5 rounded-xl border border-slate-800">
              Tournament Director / Official Referee will seed and publish the live bracket once registration closes.
            </div>
          )}
        </div>
      ) : (
        /* 3. The Interactive Bracket Tree */
        <div className="overflow-x-auto pb-4">
          <div className="min-w-[760px] flex items-start justify-between gap-6 lg:gap-8 px-2 py-4">
            {rounds.map((round, rIndex) => (
              <div key={round.round_index} className="flex-1 flex flex-col space-y-4">
                {/* Round Header */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <h4 className="text-xs font-black uppercase tracking-wider text-white">
                      {round.round_name}
                    </h4>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {round.matches.length} {round.matches.length === 1 ? 'Match' : 'Matches'}
                  </span>
                </div>

                {/* Match Cards Container with Vertical Spacing depending on round index */}
                <div
                  className={`flex flex-col justify-around h-full space-y-4 ${
                    rIndex === 1 ? 'pt-8 space-y-16' : rIndex === 2 ? 'pt-24' : ''
                  }`}
                >
                  {round.matches.map((match) => {
                    const isUserMatch =
                      currentUserId &&
                      (match.player1?.player_id === currentUserId ||
                        match.player2?.player_id === currentUserId);
                    const isCompleted = match.status === 'completed';
                    const isLive = match.status === 'in_progress';

                    return (
                      <div
                        key={match.id}
                        className={`relative rounded-2xl border transition-all shadow-md overflow-hidden ${
                          isUserMatch
                            ? 'bg-slate-900 border-emerald-500/80 shadow-emerald-500/10 ring-1 ring-emerald-500/40'
                            : isLive
                            ? 'bg-slate-900 border-amber-500/50 shadow-amber-500/10'
                            : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {/* Match Metadata Ribbon */}
                        <div className="flex items-center justify-between px-3.5 py-2 bg-slate-950/70 border-b border-slate-800/80 text-[11px]">
                          <div className="flex items-center gap-1.5 text-slate-400 font-mono">
                            <span>M#{match.match_number}</span>
                            <span aria-hidden="true">·</span>
                            <span className="text-slate-300 truncate max-w-[110px]">
                              {match.court_name || 'Court 1'}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {isLive && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-400 uppercase tracking-wider">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                                LIVE
                              </span>
                            )}
                            {isCompleted && (
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                FINAL
                              </span>
                            )}
                            {!isLive && !isCompleted && (
                              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                <Clock className="w-3 h-3 text-slate-400" />
                                {match.scheduled_time?.split(' ')[1] || 'TBD'}
                              </span>
                            )}

                            {isUserMatch && (
                              <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-500 text-slate-950 px-1.5 py-0.2 rounded font-mono">
                                YOU
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Players List */}
                        <div className="p-2.5 flex flex-col space-y-1">
                          {/* Player 1 Row */}
                          <div
                            className={`flex items-center justify-between p-2 rounded-xl transition-colors ${
                              match.winner_id && match.player1?.player_id === match.winner_id
                                ? 'bg-emerald-950/30 text-white font-bold'
                                : 'text-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              {match.player1?.avatar_url ? (
                                <img
                                  src={match.player1.avatar_url}
                                  alt={match.player1.full_name}
                                  className="w-7 h-7 rounded-lg object-cover border border-slate-800 shrink-0"
                                />
                              ) : (
                                <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 text-xs shrink-0">
                                  <User className="w-3.5 h-3.5" />
                                </div>
                              )}
                              <div className="flex flex-col min-w-0">
                                <div className="flex items-center gap-1">
                                  {match.player1?.seed && (
                                    <span className="text-[10px] font-mono text-slate-400">
                                      #{match.player1.seed}
                                    </span>
                                  )}
                                  <span className="text-xs truncate font-medium max-w-[110px]">
                                    {match.player1?.full_name || 'TBD'}
                                  </span>
                                </div>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  DUPR {match.player1?.skill_rating?.toFixed(2) || '—'}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0 pl-2">
                              {match.score1 !== null && match.score1 !== undefined ? (
                                <span
                                  className={`w-6 h-6 rounded-md font-mono text-xs font-black flex items-center justify-center ${
                                    match.winner_id && match.player1?.player_id === match.winner_id
                                      ? 'bg-emerald-500 text-slate-950'
                                      : 'bg-slate-800 text-slate-300'
                                  }`}
                                >
                                  {match.score1}
                                </span>
                              ) : (
                                <span className="text-xs text-slate-400 font-mono">—</span>
                              )}
                            </div>
                          </div>

                          {/* Player 2 Row */}
                          <div
                            className={`flex items-center justify-between p-2 rounded-xl transition-colors ${
                              match.winner_id && match.player2?.player_id === match.winner_id
                                ? 'bg-emerald-950/30 text-white font-bold'
                                : 'text-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              {match.player2?.avatar_url ? (
                                <img
                                  src={match.player2.avatar_url}
                                  alt={match.player2.full_name}
                                  className="w-7 h-7 rounded-lg object-cover border border-slate-800 shrink-0"
                                />
                              ) : (
                                <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 text-xs shrink-0">
                                  <User className="w-3.5 h-3.5" />
                                </div>
                              )}
                              <div className="flex flex-col min-w-0">
                                <div className="flex items-center gap-1">
                                  {match.player2?.seed && (
                                    <span className="text-[10px] font-mono text-slate-400">
                                      #{match.player2.seed}
                                    </span>
                                  )}
                                  <span className="text-xs truncate font-medium max-w-[110px]">
                                    {match.player2?.full_name || 'TBD'}
                                  </span>
                                </div>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  DUPR {match.player2?.skill_rating?.toFixed(2) || '—'}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0 pl-2">
                              {match.score2 !== null && match.score2 !== undefined ? (
                                <span
                                  className={`w-6 h-6 rounded-md font-mono text-xs font-black flex items-center justify-center ${
                                    match.winner_id && match.player2?.player_id === match.winner_id
                                      ? 'bg-emerald-500 text-slate-950'
                                      : 'bg-slate-800 text-slate-300'
                                  }`}
                                >
                                  {match.score2}
                                </span>
                              ) : (
                                <span className="text-xs text-slate-400 font-mono">—</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Admin Officiate / Score Button (for Referee role) */}
                        {isCourtAdmin && (
                          <div className="px-2.5 pb-2.5 pt-1 border-t border-slate-800/80 bg-slate-950/40">
                            <button
                              onClick={() => handleOpenScoreModal(match)}
                              className="w-full py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors active:scale-98"
                            >
                              <Shield className="w-3 h-3 text-emerald-400" />
                              <span>{isCompleted ? 'Edit Score' : 'Score Match'}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Admin Score Match Modal */}
      {activeMatchForScoring && (
        <AdminScoreMatchModal
          isOpen={!!activeMatchForScoring}
          onClose={() => setActiveMatchForScoring(null)}
          tournament={tournament}
          match={activeMatchForScoring}
          onSaveScore={handleSaveScore}
        />
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useNotifications } from '../../context/NotificationContext.tsx';
import { api } from '../../services/api.ts';
import { Tournament, BracketMatch, TournamentPlayer } from '../../src/types.ts';
import {
  Trophy,
  Users,
  Calendar,
  MapPin,
  Plus,
  Flame,
  Award,
  Shield,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowLeft,
  X,
  Trash2,
  DollarSign,
  Share2,
} from 'lucide-react';
import TournamentBracketView from '../../src/components/TournamentBracketView.tsx';
import CreateTournamentModal from '../../src/components/CreateTournamentModal.tsx';

export default function TournamentsScreen() {
  const { user, isCourtAdmin } = useAuth();
  const { addNotification } = useNotifications();

  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [selectedTab, setSelectedTab] = useState<'bracket' | 'roster' | 'overview'>('bracket');
  const [statusFilter, setStatusFilter] = useState<'all' | 'registration_open' | 'active' | 'completed'>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [actionFeedback, setActionFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Fetch tournaments from API
  const fetchTournaments = async () => {
    try {
      setIsLoading(true);
      const res = await api.tournaments.getAll();
      if (res && res.data) {
        setTournaments(res.data);
        // If one was selected, update its reference
        if (selectedTournament) {
          const updated = res.data.find((t) => t.id === selectedTournament.id);
          if (updated) setSelectedTournament(updated);
        }
      }
    } catch (err) {
      console.error('Failed to load tournaments from API, using fallback data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTournaments();
  }, []);

  const showFeedback = (message: string, type: 'success' | 'error' = 'success') => {
    setActionFeedback({ message, type });
    setTimeout(() => setActionFeedback(null), 4000);
  };

  // Join Tournament Handler (Player)
  const handleJoinTournament = async (tournamentId: string) => {
    if (!user) return;
    try {
      const res = await api.tournaments.join(tournamentId);
      if (res.success) {
        showFeedback('You are officially registered for the tournament! Good luck on the ladder.');
        addNotification({
          title: `Registered: ${res.data.title}`,
          message: `Your registration is confirmed. Certified referees will seed the bracket once entries close.`,
          type: 'tournament',
          targetTab: 'tournaments',
          actionLabel: 'View Tournament Bracket',
          badge: 'ENTERED',
        });
        await fetchTournaments();
      }
    } catch (err: any) {
      showFeedback(err.message || 'Failed to register for tournament', 'error');
    }
  };

  // Leave Tournament Handler (Player)
  const handleLeaveTournament = async (tournamentId: string) => {
    if (!user) return;
    try {
      const res = await api.tournaments.leave(tournamentId);
      if (res.success) {
        showFeedback('Registration withdrawn from the tournament.');
        await fetchTournaments();
      }
    } catch (err: any) {
      showFeedback(err.message || 'Failed to withdraw from tournament', 'error');
    }
  };

  // Create Tournament Handler (Admin)
  const handleCreateTournament = async (data: Partial<Tournament>) => {
    try {
      const res = await api.tournaments.create(data);
      if (res.success) {
        showFeedback(`Tournament "${res.data.title}" successfully created and open for registration!`);
        addNotification({
          title: `New Tournament Announced!`,
          message: `"${res.data.title}" with a ₱${res.data.prize_pool.toLocaleString()} prize pool is now open for player registration!`,
          type: 'tournament',
          targetTab: 'tournaments',
          actionLabel: 'Check Roster',
          badge: 'NEW LADDER',
        });
        await fetchTournaments();
        setSelectedTournament(res.data);
        setSelectedTab('roster');
      }
    } catch (err: any) {
      showFeedback(err.message || 'Failed to create tournament', 'error');
    }
  };

  // Generate Bracket Handler (Admin)
  const handleGenerateBracket = async (tournamentId: string) => {
    try {
      const res = await api.tournaments.generateBracket(tournamentId);
      if (res.success) {
        showFeedback('Bracket seeded and published! Matches are now active.');
        addNotification({
          title: `Brackets Published: ${res.data.title}`,
          message: `Single elimination tree is now live. Check your match fixture and court assignments.`,
          type: 'tournament',
          targetTab: 'tournaments',
          actionLabel: 'Open Bracket',
          badge: 'BRACKET LIVE',
        });
        await fetchTournaments();
      }
    } catch (err: any) {
      showFeedback(err.message || 'Failed to generate bracket', 'error');
    }
  };

  // Update Match Score Handler (Admin)
  const handleUpdateMatchScore = async (
    matchId: string,
    score1: number,
    score2: number,
    winnerId: string,
    status: 'in_progress' | 'completed'
  ) => {
    if (!selectedTournament) return;
    try {
      const res = await api.tournaments.updateMatchScore(selectedTournament.id, matchId, {
        score1,
        score2,
        winnerId,
        status,
      });
      if (res.success) {
        showFeedback('Official score certified and advanced through the bracket.');
        if (res.data.status === 'completed' && res.data.champion) {
          addNotification({
            title: `🏆 Tournament Champion Crowned!`,
            message: `${res.data.champion.full_name} won the "${res.data.title}"! ELO rating and prize pool awarded.`,
            type: 'tournament',
            targetTab: 'tournaments',
            actionLabel: 'View Champion Podium',
            badge: 'CHAMPION',
          });
        }
        await fetchTournaments();
      }
    } catch (err: any) {
      showFeedback(err.message || 'Failed to save match score', 'error');
    }
  };

  // Delete Tournament Handler (Admin)
  const handleDeleteTournament = async (tournamentId: string) => {
    try {
      await api.tournaments.delete(tournamentId);
      showFeedback('Tournament cancelled and removed.');
      if (selectedTournament?.id === tournamentId) {
        setSelectedTournament(null);
      }
      await fetchTournaments();
    } catch (err: any) {
      showFeedback(err.message || 'Failed to delete tournament', 'error');
    }
  };

  // In admin view, remove the other three mock tournaments (tourn-2, tourn-3, tourn-4)
  // because admins only manage the official Tagum Open and tournaments they create.
  const visibleTournaments = isCourtAdmin
    ? tournaments.filter((t) => !['tourn-2', 'tourn-3', 'tourn-4'].includes(t.id))
    : tournaments;

  // Filter list
  const filteredTournaments = visibleTournaments.filter((t) => {
    if (statusFilter === 'all') return true;
    return t.status === statusFilter;
  });

  // Calculate high-level metrics
  const activeCount = visibleTournaments.filter((t) => t.status === 'active').length;
  const openCount = visibleTournaments.filter((t) => t.status === 'registration_open').length;
  const completedCount = visibleTournaments.filter((t) => t.status === 'completed').length;

  return (
    <div className="flex flex-col space-y-6">
      {/* Toast Feedback */}
      {actionFeedback && (
        <div
          className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center justify-between shadow-lg animate-in fade-in slide-in-from-top-2 duration-200 ${
            actionFeedback.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
              : 'bg-red-950/80 border-red-500/50 text-red-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {actionFeedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span>{actionFeedback.message}</span>
          </div>
          <button
            onClick={() => setActionFeedback(null)}
            className="text-slate-400 hover:text-white ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* VIEW A: TOURNAMENT DETAILS & BRACKET INSPECTION */}
      {selectedTournament ? (
        <div className="flex flex-col space-y-5">
          {/* Back button & Title Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <button
              onClick={() => setSelectedTournament(null)}
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Tournaments Directory</span>
            </button>

            {isCourtAdmin && (
              <div className="flex items-center gap-2">
                {selectedTournament.status === 'registration_open' && (
                  <button
                    onClick={() => handleGenerateBracket(selectedTournament.id)}
                    className="py-2 px-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow active:scale-95 transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Seed & Generate Bracket</span>
                  </button>
                )}
                <button
                  onClick={() => handleDeleteTournament(selectedTournament.id)}
                  className="p-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-500/30 transition-colors"
                  title="Delete Tournament"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Tournament Hero Card */}
          <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl">
            <div className="relative min-h-[230px] sm:min-h-[260px] md:min-h-[280px] h-56 sm:h-64 md:h-72 w-full overflow-hidden bg-slate-950">
              <img
                src={
                  selectedTournament.banner_image_url ||
                  '/src/assets/images/tagum_championship_trophy_1791477380864.jpg'
                }
                alt={selectedTournament.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/40 to-transparent" />

              {/* Badges on Top */}
              <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
                <span className="text-xs font-bold text-white bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full border border-slate-700/80">
                  {selectedTournament.category} · {selectedTournament.skill_level}
                </span>

                <div className="flex items-center gap-2">
                  {selectedTournament.status === 'active' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black uppercase tracking-wider">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                      Live Bracket
                    </span>
                  )}
                  {selectedTournament.status === 'registration_open' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-black uppercase tracking-wider">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Open Registration
                    </span>
                  )}
                  {selectedTournament.status === 'completed' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300 text-xs font-bold">
                      Completed
                    </span>
                  )}
                </div>
              </div>

              {/* Title & Metadata on bottom of cover */}
              <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-3 max-w-[calc(100%-2rem)]">
                <div className="min-w-0 flex-1 max-w-full">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-black text-white tracking-tight break-words leading-tight line-clamp-2 sm:line-clamp-none">
                    {selectedTournament.title}
                  </h2>
                  <div className="flex items-center gap-x-2.5 gap-y-1 text-xs text-slate-300 mt-1.5 flex-wrap">
                    <span className="inline-flex items-center gap-1 text-emerald-400 font-medium truncate max-w-[220px]">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{selectedTournament.venue_name}</span>
                    </span>
                    <span aria-hidden="true" className="text-slate-500">·</span>
                    <span className="text-amber-400 font-bold font-mono whitespace-nowrap">
                      Prize Pool: ₱{selectedTournament.prize_pool.toLocaleString()}
                    </span>
                    <span aria-hidden="true" className="text-slate-500">·</span>
                    <span className="text-slate-400 font-mono whitespace-nowrap">
                      Entry: ₱{selectedTournament.entry_fee}
                    </span>
                  </div>
                </div>

                {/* Player Register / Withdraw Button */}
                {!isCourtAdmin && (
                  <div className="shrink-0">
                    {selectedTournament.participants.some((p) => p.player_id === user?.id) ? (
                      <div className="flex items-center gap-2">
                        <span className="py-2 px-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5 whitespace-nowrap">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>Registered ✓</span>
                        </span>
                        {selectedTournament.status === 'registration_open' && (
                          <button
                            onClick={() => handleLeaveTournament(selectedTournament.id)}
                            className="py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-red-950/50 hover:text-red-300 text-slate-400 text-xs font-medium border border-slate-700 transition-colors whitespace-nowrap"
                          >
                            Withdraw
                          </button>
                        )}
                      </div>
                    ) : selectedTournament.status === 'registration_open' ? (
                      <button
                        onClick={() => handleJoinTournament(selectedTournament.id)}
                        disabled={selectedTournament.participants.length >= selectedTournament.max_participants}
                        className="py-2.5 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black uppercase tracking-wider shadow-lg shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-50 whitespace-nowrap"
                      >
                        Join Tournament (₱{selectedTournament.entry_fee})
                      </button>
                    ) : null}
                  </div>
                )}
              </div>
            </div>

            {/* Navigation Tabs Inside Tournament (Bracket / Roster / Overview) */}
            <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800">
                <button
                  onClick={() => setSelectedTab('bracket')}
                  className={`py-1.5 px-4 rounded-lg text-xs font-bold transition-all ${
                    selectedTab === 'bracket'
                      ? 'bg-slate-800 text-emerald-400 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Interactive Bracket ({selectedTournament.rounds?.length || 0} Rounds)
                </button>
                <button
                  onClick={() => setSelectedTab('roster')}
                  className={`py-1.5 px-4 rounded-lg text-xs font-bold transition-all ${
                    selectedTab === 'roster'
                      ? 'bg-slate-800 text-emerald-400 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Players ({selectedTournament.participants.length}/{selectedTournament.max_participants})
                </button>
                <button
                  onClick={() => setSelectedTab('overview')}
                  className={`py-1.5 px-4 rounded-lg text-xs font-bold transition-all ${
                    selectedTab === 'overview'
                      ? 'bg-slate-800 text-emerald-400 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Rules & Prizes
                </button>
              </div>

              {/* Roster Progress meter */}
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                <span>Roster Capacity:</span>
                <span className="font-bold text-white">
                  {selectedTournament.participants.length} / {selectedTournament.max_participants}
                </span>
              </div>
            </div>
          </div>

          {/* Tab 1: Bracket Tree */}
          {selectedTab === 'bracket' && (
            <TournamentBracketView
              tournament={selectedTournament}
              currentUserId={user?.id}
              isCourtAdmin={isCourtAdmin}
              onUpdateMatchScore={handleUpdateMatchScore}
              onGenerateBracket={() => handleGenerateBracket(selectedTournament.id)}
            />
          )}

          {/* Tab 2: Entrants Roster */}
          {selectedTab === 'roster' && (
            <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
              <div className="p-5 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">
                    Registered Competitors & Seeding
                  </h3>
                  <p className="text-xs text-slate-400">
                    Seeded primarily by DUPR algorithm and competitive ladder rank.
                  </p>
                </div>
                <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-950/40 px-3 py-1 rounded-xl border border-emerald-500/30">
                  {selectedTournament.participants.length} Registered
                </span>
              </div>

              {selectedTournament.participants.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-400">
                  No competitors registered yet. Be the first to enter this tournament!
                </div>
              ) : (
                <div className="divide-y divide-slate-800/80">
                  {selectedTournament.participants.map((p, idx) => (
                    <div
                      key={p.id}
                      className="p-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 text-center font-mono text-xs font-bold text-slate-400">
                          #{p.seed || idx + 1}
                        </span>
                        <img
                          src={
                            p.avatar_url ||
                            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80'
                          }
                          alt={p.full_name}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-700"
                        />
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-white flex items-center gap-1.5">
                            {p.full_name}
                            {p.player_id === user?.id && (
                              <span className="text-[9px] font-mono bg-emerald-500 text-slate-950 px-1 rounded font-black">
                                YOU
                              </span>
                            )}
                          </span>
                          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                            <span>{p.rank_tier}</span>
                            <span aria-hidden="true">·</span>
                            <span>{p.dupr_id || 'DUPR Verified'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-black text-emerald-400 font-mono">
                          {p.skill_rating?.toFixed(2) || '3.50'}
                        </span>
                        <span className="block text-[10px] text-slate-400 uppercase tracking-wider">
                          Skill DUPR
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Rules & Prize Breakdown */}
          {selectedTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Prize Pool Breakdown Card */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                    <Trophy className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Prize Pool Distribution</h4>
                    <span className="text-xs text-slate-400 font-mono">
                      Total Price: ₱{selectedTournament.prize_pool.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="space-y-2.5 pt-2">
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
                    <span className="text-xs font-bold text-amber-400 flex items-center gap-2">
                      🥇 1st Place Champion
                    </span>
                    <span className="font-mono text-sm font-black text-white">
                      ₱{(selectedTournament.prize_pool * 0.6).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                      🥈 2nd Place Runner-Up
                    </span>
                    <span className="font-mono text-sm font-black text-white">
                      ₱{(selectedTournament.prize_pool * 0.3).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
                    <span className="text-xs font-bold text-amber-600 flex items-center gap-2">
                      🥉 3rd Place Semifinalist
                    </span>
                    <span className="font-mono text-sm font-black text-white">
                      ₱{(selectedTournament.prize_pool * 0.1).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tournament Regulations Card */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Official Ladder Regulations</h4>
                    <span className="text-xs text-slate-400">
                      Standard USA Pickleball Rulebook 2026
                    </span>
                  </div>
                </div>

                <div className="space-y-3 text-xs text-slate-300 leading-relaxed pt-1">
                  <p>
                    • <strong>Match Format:</strong> Matches are best of 3 games to 11 points (win by 2) or single game to 15 points in preliminary rounds.
                  </p>
                  <p>
                    • <strong>Certification:</strong> Official referees certify all court scores and ELO ladder ratings immediately upon match conclusion.
                  </p>
                  <p>
                    • <strong>Venue Protocol:</strong> Players must check in with the desk 15 minutes prior to their scheduled match time.
                  </p>
                  <p>
                    • <strong>DUPR Integration:</strong> Match outcomes are synchronized to the global DUPR rating system.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* VIEW B: TOURNAMENTS DIRECTORY & LIST */
        <div className="flex flex-col space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
                <Trophy className="w-7 h-7 text-emerald-400" />
                <span>Tournaments</span>
              </h1>
            </div>

            {/* Admin Create Tournament Action */}
            {isCourtAdmin && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="self-start md:self-auto py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Create Tournament</span>
              </button>
            )}
          </div>

          {/* Filter Bar (Segmented Control) */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800 self-start overflow-x-auto max-w-full">
            <button
              onClick={() => setStatusFilter('all')}
              className={`py-1.5 px-3.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                statusFilter === 'all'
                  ? 'bg-slate-800 text-emerald-400 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Events ({visibleTournaments.length})
            </button>
            <button
              onClick={() => setStatusFilter('registration_open')}
              className={`py-1.5 px-3.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                statusFilter === 'registration_open'
                  ? 'bg-slate-800 text-emerald-400 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Open for Registration ({openCount})
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`py-1.5 px-3.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                statusFilter === 'active'
                  ? 'bg-slate-800 text-emerald-400 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Live Brackets ({activeCount})
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`py-1.5 px-3.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                statusFilter === 'completed'
                  ? 'bg-slate-800 text-emerald-400 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Completed ({completedCount})
            </button>
          </div>

          {/* Tournaments Grid */}
          {isLoading ? (
            <div className="p-12 text-center text-xs text-slate-400 font-mono">
              Loading tournament listings...
            </div>
          ) : filteredTournaments.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col items-center">
              <Trophy className="w-10 h-10 text-slate-600 mb-3" />
              <h3 className="text-sm font-bold text-white">No tournaments in this category</h3>
              <p className="text-xs text-slate-400 mt-1">
                {isCourtAdmin
                  ? 'Click "Create Tournament" above to organize an official bracket.'
                  : 'Check back soon for new ladder events!'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredTournaments.map((tournament) => {
                const isRegistered = tournament.participants.some(
                  (p) => p.player_id === user?.id
                );
                const isFull =
                  tournament.participants.length >= tournament.max_participants;

                return (
                  <div
                    key={tournament.id}
                    className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all shadow-xl flex flex-col group"
                  >
                    {/* Cover Photo */}
                    <div className="relative h-44 w-full overflow-hidden bg-slate-950">
                      <img
                        src={
                          tournament.banner_image_url ||
                          '/src/assets/images/tagum_championship_trophy_1791477380864.jpg'
                        }
                        alt={tournament.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />

                      {/* Status Tag on Cover */}
                      <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-200 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-slate-700/80">
                          {tournament.category}
                        </span>

                        {tournament.status === 'active' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px] font-black uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                            Live Bracket
                          </span>
                        )}
                        {tournament.status === 'registration_open' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-black uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Open
                          </span>
                        )}
                        {tournament.status === 'completed' && (
                          <span className="text-[11px] font-bold text-slate-400 bg-slate-950/80 px-2.5 py-0.5 rounded-full border border-slate-800">
                            Completed
                          </span>
                        )}
                      </div>

                      {/* Prize Badge in Bottom Right of Cover */}
                      <div className="absolute bottom-3 right-3 bg-slate-950/90 backdrop-blur-md px-3 py-1 rounded-xl border border-amber-500/40 text-amber-400 font-mono font-black text-xs shadow-lg">
                        ₱{tournament.prize_pool.toLocaleString()} Price
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-xs text-emerald-400 font-semibold truncate">
                            {tournament.skill_level}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">
                            Fee: ₱{tournament.entry_fee}
                          </span>
                        </div>
                        <h3 className="text-lg font-black text-white tracking-tight group-hover:text-emerald-400 transition-colors">
                          {tournament.title}
                        </h3>
                        <p className="text-xs text-slate-400 line-clamp-2 mt-1.5 leading-relaxed">
                          {tournament.description}
                        </p>
                      </div>

                      {/* Venue & Capacity meter */}
                      <div className="space-y-2 pt-2 border-t border-slate-800/80 text-xs">
                        <div className="flex items-center justify-between text-slate-400">
                          <span className="flex items-center gap-1.5 truncate">
                            <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            {tournament.venue_name}
                          </span>
                          <span className="font-mono text-slate-300 font-bold shrink-0">
                            {tournament.participants.length}/{tournament.max_participants} Players
                          </span>
                        </div>

                        {/* Capacity Progress Bar */}
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-400 rounded-full transition-all duration-300"
                            style={{
                              width: `${Math.min(
                                100,
                                (tournament.participants.length / tournament.max_participants) * 100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => {
                            setSelectedTournament(tournament);
                            setSelectedTab('bracket');
                          }}
                          className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <span>{tournament.status === 'active' ? 'View Live Bracket' : 'Tournament Details'}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>

                        {/* Quick Join for Player if open */}
                        {!isCourtAdmin && tournament.status === 'registration_open' && (
                          isRegistered ? (
                            <span className="py-2.5 px-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold flex items-center gap-1 shrink-0">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Joined</span>
                            </span>
                          ) : (
                            <button
                              onClick={() => handleJoinTournament(tournament.id)}
                              disabled={isFull}
                              className="py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black uppercase tracking-wider shadow active:scale-95 transition-all shrink-0 disabled:opacity-50"
                            >
                              Join
                            </button>
                          )
                        )}
                        {/* Admin Delete Tournament Action */}
                        {isCourtAdmin && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTournament(tournament.id);
                            }}
                            className="p-2.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-500/30 transition-colors shrink-0"
                            title="Delete Tournament"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Admin Create Tournament Modal */}
      <CreateTournamentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateTournament={handleCreateTournament}
      />
    </div>
  );
}

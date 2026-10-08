import React, { useState } from 'react';
import { BracketMatch, Tournament } from '../types.ts';
import { X, Shield, Award, CheckCircle, ChevronUp, ChevronDown } from 'lucide-react';

interface AdminScoreMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  tournament: Tournament;
  match: BracketMatch | null;
  onSaveScore: (matchId: string, score1: number, score2: number, winnerId: string, status: 'in_progress' | 'completed') => Promise<void>;
}

export default function AdminScoreMatchModal({
  isOpen,
  onClose,
  tournament,
  match,
  onSaveScore,
}: AdminScoreMatchModalProps) {
  if (!isOpen || !match) return null;

  const [score1, setScore1] = useState<number>(match.score1 ?? 0);
  const [score2, setScore2] = useState<number>(match.score2 ?? 0);
  const [selectedWinnerId, setSelectedWinnerId] = useState<string>(
    match.winner_id || (score1 > score2 && match.player1 ? match.player1.player_id : match.player2 ? match.player2.player_id : '')
  );
  const [isFinalMatch, setIsFinalMatch] = useState<boolean>(match.status === 'completed');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const p1 = match.player1;
  const p2 = match.player2;

  const handleScoreChange1 = (newVal: number) => {
    const val = Math.max(0, newVal);
    setScore1(val);
    if (val > score2 && p1) {
      setSelectedWinnerId(p1.player_id);
    } else if (score2 > val && p2) {
      setSelectedWinnerId(p2.player_id);
    }
  };

  const handleScoreChange2 = (newVal: number) => {
    const val = Math.max(0, newVal);
    setScore2(val);
    if (val > score1 && p2) {
      setSelectedWinnerId(p2.player_id);
    } else if (score1 > val && p1) {
      setSelectedWinnerId(p1.player_id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!p1 || !p2) {
      setErrorMsg('Both players must be determined before scoring this match.');
      return;
    }

    if (score1 === score2 && isFinalMatch) {
      setErrorMsg('Pickleball matches cannot end in a tie. One player must achieve the winning margin.');
      return;
    }

    let winnerId = selectedWinnerId;
    if (!winnerId) {
      winnerId = score1 > score2 ? p1.player_id : p2.player_id;
    }

    setIsSubmitting(true);
    try {
      await onSaveScore(
        match.id,
        score1,
        score2,
        winnerId,
        isFinalMatch ? 'completed' : 'in_progress'
      );
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update bracket match score.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Officiate Bracket Match
              </h3>
              <p className="text-[11px] text-slate-400">
                {match.round_name} · Match #{match.match_number}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 flex flex-col space-y-5">
          {errorMsg && (
            <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-xl text-xs text-red-300">
              {errorMsg}
            </div>
          )}

          {/* Tournament context */}
          <div className="px-3 py-2 bg-slate-950/40 border border-slate-800/80 rounded-xl text-xs text-slate-400 flex items-center justify-between">
            <span className="truncate max-w-[200px]">{tournament.title}</span>
            <span className="font-mono text-emerald-400 text-[11px]">{match.court_name}</span>
          </div>

          {/* Scoring Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Player 1 Card */}
            <div
              className={`p-3.5 rounded-xl border transition-all flex flex-col items-center text-center ${
                selectedWinnerId === p1?.player_id
                  ? 'bg-emerald-950/30 border-emerald-500/50 shadow-sm'
                  : 'bg-slate-950/60 border-slate-800'
              }`}
            >
              <div className="relative mb-2">
                <img
                  src={p1?.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80'}
                  alt={p1?.full_name || 'TBD'}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-700"
                />
                {p1?.seed && (
                  <span className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-slate-900 border border-slate-700 text-[10px] font-bold text-slate-300 flex items-center justify-center">
                    #{p1.seed}
                  </span>
                )}
              </div>
              <span className="text-xs font-bold text-white truncate max-w-[120px] mb-0.5">
                {p1?.full_name || 'Slot A (Pending)'}
              </span>
              <span className="text-[10px] text-slate-400 font-mono mb-3">
                DUPR {p1?.skill_rating ? p1.skill_rating.toFixed(2) : '3.50'}
              </span>

              {/* Score Control */}
              <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl p-1 mb-2">
                <button
                  type="button"
                  onClick={() => handleScoreChange1(score1 - 1)}
                  className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center active:scale-95 transition-all"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={score1}
                  onChange={(e) => handleScoreChange1(parseInt(e.target.value) || 0)}
                  className="w-10 text-center font-black text-lg bg-transparent text-emerald-400 focus:outline-none font-mono"
                />
                <button
                  type="button"
                  onClick={() => handleScoreChange1(score1 + 1)}
                  className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center active:scale-95 transition-all"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
              </div>

              {p1 && (
                <button
                  type="button"
                  onClick={() => setSelectedWinnerId(p1.player_id)}
                  className={`text-[10px] font-bold py-1 px-2.5 rounded-lg border transition-all ${
                    selectedWinnerId === p1.player_id
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {selectedWinnerId === p1.player_id ? '✓ Winner Pick' : 'Select Winner'}
                </button>
              )}
            </div>

            {/* Player 2 Card */}
            <div
              className={`p-3.5 rounded-xl border transition-all flex flex-col items-center text-center ${
                selectedWinnerId === p2?.player_id
                  ? 'bg-emerald-950/30 border-emerald-500/50 shadow-sm'
                  : 'bg-slate-950/60 border-slate-800'
              }`}
            >
              <div className="relative mb-2">
                <img
                  src={p2?.avatar_url || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&h=120&q=80'}
                  alt={p2?.full_name || 'TBD'}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-700"
                />
                {p2?.seed && (
                  <span className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-slate-900 border border-slate-700 text-[10px] font-bold text-slate-300 flex items-center justify-center">
                    #{p2.seed}
                  </span>
                )}
              </div>
              <span className="text-xs font-bold text-white truncate max-w-[120px] mb-0.5">
                {p2?.full_name || 'Slot B (Pending)'}
              </span>
              <span className="text-[10px] text-slate-400 font-mono mb-3">
                DUPR {p2?.skill_rating ? p2.skill_rating.toFixed(2) : '3.50'}
              </span>

              {/* Score Control */}
              <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl p-1 mb-2">
                <button
                  type="button"
                  onClick={() => handleScoreChange2(score2 - 1)}
                  className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center active:scale-95 transition-all"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={score2}
                  onChange={(e) => handleScoreChange2(parseInt(e.target.value) || 0)}
                  className="w-10 text-center font-black text-lg bg-transparent text-emerald-400 focus:outline-none font-mono"
                />
                <button
                  type="button"
                  onClick={() => handleScoreChange2(score2 + 1)}
                  className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center active:scale-95 transition-all"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
              </div>

              {p2 && (
                <button
                  type="button"
                  onClick={() => setSelectedWinnerId(p2.player_id)}
                  className={`text-[10px] font-bold py-1 px-2.5 rounded-lg border transition-all ${
                    selectedWinnerId === p2.player_id
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {selectedWinnerId === p2.player_id ? '✓ Winner Pick' : 'Select Winner'}
                </button>
              )}
            </div>
          </div>

          {/* Quick Score Presets */}
          <div className="flex items-center justify-center gap-2">
            <span className="text-[10px] text-slate-400 font-semibold">Presets:</span>
            <button
              type="button"
              onClick={() => {
                setScore1(11);
                setScore2(8);
                if (p1) setSelectedWinnerId(p1.player_id);
              }}
              className="text-[10px] py-0.5 px-2 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono"
            >
              11 - 8
            </button>
            <button
              type="button"
              onClick={() => {
                setScore1(11);
                setScore2(9);
                if (p1) setSelectedWinnerId(p1.player_id);
              }}
              className="text-[10px] py-0.5 px-2 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono"
            >
              11 - 9
            </button>
            <button
              type="button"
              onClick={() => {
                setScore1(7);
                setScore2(11);
                if (p2) setSelectedWinnerId(p2.player_id);
              }}
              className="text-[10px] py-0.5 px-2 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono"
            >
              7 - 11
            </button>
          </div>

          {/* Finalize Toggle */}
          <label className="flex items-center justify-between p-3 bg-slate-950/60 border border-slate-800 rounded-xl cursor-pointer">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                Finalize & Advance Winner
              </span>
              <span className="text-[10px] text-slate-400">
                Pushes winner to {match.next_match_id ? 'the next bracket round' : 'champion status'}
              </span>
            </div>
            <input
              type="checkbox"
              checked={isFinalMatch}
              onChange={(e) => setIsFinalMatch(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-500 bg-slate-900 border-slate-700 focus:ring-emerald-500"
            />
          </label>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !p1 || !p2}
              className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black uppercase tracking-wider shadow-lg shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Recording...' : isFinalMatch ? 'Certify Result' : 'Save Score'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

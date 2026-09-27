import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import { Court } from '../../src/types.ts';
import { Trophy, X, Calendar, PlusCircle, Check } from 'lucide-react';

interface HostMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMatchCreated?: () => void;
}

export default function HostMatchModal({ isOpen, onClose, onMatchCreated }: HostMatchModalProps) {
  const { user } = useAuth();
  const [courts, setCourts] = useState<Court[]>([]);
  const [selectedCourtId, setSelectedCourtId] = useState<string>('');
  const [gameType, setGameType] = useState<'singles' | 'doubles'>('doubles');
  const [minRating, setMinRating] = useState('3.5');
  const [maxRating, setMaxRating] = useState('4.5');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      api.courts.getCourts().then((res) => {
        const list = res.data || [];
        setCourts(list);
        if (list.length > 0) setSelectedCourtId(list[0].id);
      });
    }
  }, [isOpen]);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourtId) return;

    setIsSubmitting(true);
    try {
      await api.matches.createMatch({
        courtId: selectedCourtId,
        gameType,
        minRating: parseFloat(minRating),
        maxRating: parseFloat(maxRating),
        scheduledAt: new Date(Date.now() + 15 * 60000).toISOString(),
      });
      onMatchCreated?.();
      onClose();
    } catch (err: any) {
      console.error('Failed to create match:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl relative overflow-hidden">
        {/* Match Hosting Header Picture */}
        <div className="relative h-28 sm:h-32 w-full overflow-hidden bg-slate-950 border-b border-slate-800 group">
          <img
            src="/src/assets/images/pickleball_match_smash_1790518380509.jpg"
            alt="Host Rated Match"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-3.5 right-3.5 p-1.5 text-slate-300 hover:text-white rounded-full bg-slate-950/80 border border-slate-700 backdrop-blur-md"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="absolute bottom-2.5 left-4 flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold text-emerald-400 bg-slate-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
              Season 1 Ladder Fixture
            </span>
          </div>
        </div>

        <div className="p-5 pt-3">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Host Rated Match</h2>
              <p className="text-xs text-slate-400">DUPR & ELO sanctioned match queued for certified referee</p>
            </div>
          </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Court Facility */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Select Venue Court
            </label>
            <select
              value={selectedCourtId}
              onChange={(e) => setSelectedCourtId(e.target.value)}
              className="w-full h-11 px-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500"
            >
              {courts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} (${c.hourly_rate}/hr)
                </option>
              ))}
            </select>
          </div>

          {/* Game Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Match Format
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setGameType('doubles')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                  gameType === 'doubles'
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                    : 'bg-slate-950 text-slate-400 border-slate-800'
                }`}
              >
                Doubles (2v2)
              </button>
              <button
                type="button"
                onClick={() => setGameType('singles')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                  gameType === 'singles'
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                    : 'bg-slate-950 text-slate-400 border-slate-800'
                }`}
              >
                Singles (1v1)
              </button>
            </div>
          </div>

          {/* Rating Range */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Target DUPR Skill Bracket
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-slate-400 block mb-1">Min DUPR</span>
                <input
                  type="number"
                  step="0.1"
                  min="2.0"
                  max="5.5"
                  value={minRating}
                  onChange={(e) => setMinRating(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block mb-1">Max DUPR</span>
                <input
                  type="number"
                  step="0.1"
                  min="2.0"
                  max="5.5"
                  value={maxRating}
                  onChange={(e) => setMaxRating(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Scheduling Match...</span>
            ) : (
              <>
                <PlusCircle className="w-4 h-4" />
                <span>Host Open Match</span>
              </>
            )}
          </button>
        </form>
        </div>
      </div>
    </div>
  );
}

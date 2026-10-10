import React, { useState } from 'react';
import { Tournament } from '../types.ts';
import { X, Trophy, MapPin, Calendar, DollarSign, Shield, Users, Sparkles } from 'lucide-react';

interface CreateTournamentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTournament: (data: Partial<Tournament>) => Promise<void>;
}

const VENUE_OPTIONS = [
  {
    name: 'Spin & Smash Pickleball Pavilion',
    address: 'Visayan Village, National Highway, Tagum City',
    image: '/src/assets/images/court_venue_metro_1790512684659.jpg',
  },
  {
    name: 'Tagum Central Pickleball Complex',
    address: 'Pioneer Ave, Magugpo Poblacion, Tagum City',
    image: '/src/assets/images/tagum_championship_trophy_1791477380864.jpg',
  },
  {
    name: 'Picklezone Tagum & Indoor Arena',
    address: 'Purok 4, Brgy. Magugpo East, Tagum City',
    image: '/src/assets/images/pickle_master_trophy_1790512697080.jpg',
  },
  {
    name: 'Rotary Park Pickleball Hub',
    address: 'Rotary Park Sports Complex, Tagum City',
    image: '/src/assets/images/tagum_pickleball_club_1790516250921.jpg',
  },
];

export default function CreateTournamentModal({
  isOpen,
  onClose,
  onCreateTournament,
}: CreateTournamentModalProps) {
  if (!isOpen) return null;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState(
    'Sanctioned competitive tournament featuring certified regional referees and DUPR verified scoring.'
  );
  const [category, setCategory] = useState<Tournament['category']>("Men's Singles");
  const [skillLevel, setSkillLevel] = useState('Open Division (All)');
  const [format, setFormat] = useState<Tournament['format']>('Single Elimination (8 Players)');
  const [maxParticipants, setMaxParticipants] = useState<number>(8);
  const [selectedVenue, setSelectedVenue] = useState(VENUE_OPTIONS[0]);
  const [customVenue, setCustomVenue] = useState('');
  const [entryFee, setEntryFee] = useState<number>(350);
  const [prizePool, setPrizePool] = useState<number>(15000);
  const [startDate, setStartDate] = useState(
    new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 9 * 86400000).toISOString().split('T')[0]
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Please enter a tournament title.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const venueName = customVenue.trim() || selectedVenue.name;
      const venueAddress = customVenue.trim()
        ? 'Tagum City, Davao del Norte, PH'
        : selectedVenue.address;

      await onCreateTournament({
        title: title.trim(),
        description: description.trim(),
        category,
        skill_level: skillLevel,
        format,
        max_participants: maxParticipants,
        venue_name: venueName,
        venue_address: venueAddress,
        entry_fee: entryFee,
        prize_pool: prizePool,
        start_date: new Date(startDate).toISOString(),
        end_date: new Date(endDate).toISOString(),
        registration_deadline: new Date(startDate).toISOString(),
        banner_image_url: selectedVenue.image,
      });

      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create tournament.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-white tracking-tight">
                Create Sanctioned Tournament
              </h3>
              <p className="text-xs text-slate-400">
                Official Referee / Admin Bracket Organizer
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

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-xl text-xs text-red-300">
              {errorMsg}
            </div>
          )}

          {/* Tournament Title */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              Tournament Name *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Tagum City Summer Slam 2026"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm text-white placeholder-slate-500 transition-colors"
            />
          </div>

          {/* Category & Skill Division */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="Men's Singles">Men's Singles</option>
                <option value="Women's Singles">Women's Singles</option>
                <option value="Open Doubles">Open Doubles</option>
                <option value="Mixed Doubles">Mixed Doubles</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Skill Division
              </label>
              <select
                value={skillLevel}
                onChange={(e) => setSkillLevel(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="Open Division (All)">Open Division (All)</option>
                <option value="Intermediate (3.0 - 3.5)">Intermediate (3.0 - 3.5)</option>
                <option value="Advanced (4.0 - 4.5)">Advanced (4.0 - 4.5)</option>
                <option value="Pro Masters (4.5+)">Pro Masters (4.5+)</option>
              </select>
            </div>
          </div>

          {/* Bracket Format & Max Participants */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Bracket Format
              </label>
              <select
                value={format}
                onChange={(e) => {
                  const val = e.target.value as any;
                  setFormat(val);
                  setMaxParticipants(val.includes('16') ? 16 : 8);
                }}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="Single Elimination (8 Players)">Single Elimination (8 Players)</option>
                <option value="Single Elimination (16 Players)">Single Elimination (16 Players)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Roster Capacity
              </label>
              <div className="flex items-center px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 font-mono">
                <Users className="w-3.5 h-3.5 text-emerald-400 mr-2" />
                <span>{maxParticipants} Players Max</span>
              </div>
            </div>
          </div>

          {/* Venue Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              Host Venue & Arena
            </label>
            <div className="grid grid-cols-1 gap-2">
              {VENUE_OPTIONS.map((venue) => (
                <div
                  key={venue.name}
                  onClick={() => {
                    setSelectedVenue(venue);
                    setCustomVenue('');
                  }}
                  className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between text-left ${
                    selectedVenue.name === venue.name && !customVenue
                      ? 'bg-emerald-950/30 border-emerald-500/60 text-white'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={venue.image}
                      alt={venue.name}
                      className="w-8 h-8 rounded-lg object-cover shrink-0 border border-slate-800"
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-white truncate">{venue.name}</span>
                      <span className="text-[10px] text-slate-400 truncate">{venue.address}</span>
                    </div>
                  </div>
                  {selectedVenue.name === venue.name && !customVenue && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 ml-2" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Financials: Entry Fee & Prize Pool */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Entry Fee (PHP ₱)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-500 text-xs font-mono">₱</span>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={entryFee}
                  onChange={(e) => setEntryFee(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full pl-7 pr-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-emerald-500 text-xs text-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Prize Pool (PHP ₱)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-500 text-xs font-mono">₱</span>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={prizePool}
                  onChange={(e) => setPrizePool(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full pl-7 pr-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-emerald-500 text-xs text-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white font-mono"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              Description & Ladder Notes
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-95 transition-all disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isSubmitting ? 'Announcing...' : 'Publish Tournament'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

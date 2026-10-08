import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { UserRole } from '../../src/types.ts';
import { Trophy, Shield, ArrowRight, UserCheck, Check } from 'lucide-react';

interface RegisterScreenProps {
  onNavigateLogin?: () => void;
  onSuccess?: () => void;
}

export default function RegisterScreen({ onNavigateLogin, onSuccess }: RegisterScreenProps) {
  const { register, isLoading } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [duprId, setDuprId] = useState('');
  const [role, setRole] = useState<UserRole>('player');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!fullName.trim() || !email.trim()) {
      setError('Please provide your name and email');
      return;
    }

    try {
      await register({
        full_name: fullName.trim(),
        email: email.trim(),
        role,
        dupr_id: duprId.trim() || undefined,
      });
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    }
  };

  return (
    <div className="flex flex-col min-h-full px-6 py-6 justify-between max-w-md mx-auto w-full">
      <div>
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Trophy className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white font-['Cabinet_Grotesk']">
              JOIN PICKLE<span className="text-emerald-400">PLAY</span>
            </h1>
            <p className="text-xs text-slate-400">Account Setup & Role Assignment</p>
          </div>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-red-950/60 border border-red-500/30 text-red-200 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* ROLE SELECTOR TOGGLE */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Select Your Official Platform Role
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole('player')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  role === 'player'
                    ? 'bg-emerald-950/40 border-emerald-500/60 ring-1 ring-emerald-500/40'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <Trophy className={`w-4 h-4 ${role === 'player' ? 'text-emerald-400' : 'text-slate-400'}`} />
                    <span className="text-xs font-bold text-white">Player</span>
                  </div>
                  {role === 'player' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">
                  Grind ladder ELO, join matches, book courts. Cannot self-score.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setRole('court_admin')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  role === 'court_admin'
                    ? 'bg-emerald-950/40 border-emerald-500/60 ring-1 ring-emerald-500/40'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <Shield className={`w-4 h-4 ${role === 'court_admin' ? 'text-emerald-400' : 'text-slate-400'}`} />
                    <span className="text-xs font-bold text-white">Court Admin</span>
                  </div>
                  {role === 'court_admin' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">
                  Facility owner & official referee. Court management & scoring only (to play, register as a Player).
                </p>
              </button>
            </div>

            <div className="mt-2 p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
              <UserCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                {role === 'player'
                  ? 'As a Player, match integrity is guaranteed: scores must be validated by an authorized Court Admin or referee.'
                  : 'As a Court Admin / Referee, you hold scorekeeping and court management authority. Referees cannot play on this account to guarantee neutrality.'}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full h-10 px-3.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-emerald-500"
              placeholder="e.g. Riley Morgan"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full h-10 px-3.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-emerald-500"
              placeholder="riley@example.com"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full h-10 px-3.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-emerald-500"
              placeholder="Create a strong password"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              DUPR ID <span className="text-slate-500 font-normal">(Optional sync)</span>
            </label>
            <input
              type="text"
              value={duprId}
              onChange={(e) => setDuprId(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-emerald-500"
              placeholder="e.g. DUPR-58291"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 mt-1 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <span>Creating Profile...</span>
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>

      <div className="pt-4 pb-2 text-center">
        <p className="text-xs text-slate-400">
          Already registered?{' '}
          <button
            type="button"
            onClick={onNavigateLogin}
            className="text-emerald-400 font-semibold hover:underline"
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
}

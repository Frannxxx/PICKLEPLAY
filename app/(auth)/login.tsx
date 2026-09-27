import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { Shield, Trophy, ArrowRight, CheckCircle2 } from 'lucide-react';

interface LoginScreenProps {
  onNavigateRegister?: () => void;
  onSuccess?: () => void;
}

export default function LoginScreen({ onNavigateRegister, onSuccess }: LoginScreenProps) {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('taylor@pickleplay.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email);
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  };

  const handleQuickDemo = async (role: 'player' | 'court_admin') => {
    setError(null);
    try {
      if (role === 'court_admin') {
        setEmail('marcus@pickleplay.com');
        await login('marcus@pickleplay.com', 'court_admin');
      } else {
        setEmail('taylor@pickleplay.com');
        await login('taylor@pickleplay.com', 'player');
      }
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    }
  };

  return (
    <div className="flex flex-col min-h-full px-6 py-8 justify-between max-w-md mx-auto w-full">
      {/* Brand Zone */}
      <div className="pt-4">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Trophy className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white font-['Cabinet_Grotesk']">
              PICKLE<span className="text-emerald-400">PLAY</span>
            </h1>
            <p className="text-xs text-slate-400">Competitive Ladder & Verified Referees</p>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-bold text-white mb-1">Welcome Back</h2>
          <p className="text-sm text-slate-400">
            Sign in to access your player rating, court bookings, and live verified matches.
          </p>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-red-950/60 border border-red-500/30 text-red-200 text-xs">
            {error}
          </div>
        )}

        {/* Demo Fast Login Pills */}
        <div className="mb-6 p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <p className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
            Quick 1-Tap Demo Switcher
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('player')}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 active:scale-95 transition-all text-center"
            >
              <Trophy className="w-3.5 h-3.5 text-emerald-400" />
              <span>Taylor (Player)</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('court_admin')}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/50 text-xs font-semibold text-emerald-300 border border-emerald-500/30 active:scale-95 transition-all text-center"
            >
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Coach Marcus (Admin)</span>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full h-11 px-3.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              placeholder="player@pickleplay.com"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">Password</label>
              <span className="text-xs text-emerald-400 hover:underline cursor-pointer">
                Forgot?
              </span>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full h-11 px-3.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 mt-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In to PicklePlay</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Footer link */}
      <div className="pt-6 pb-2 text-center">
        <p className="text-xs text-slate-400">
          New to the league?{' '}
          <button
            type="button"
            onClick={onNavigateRegister}
            className="text-emerald-400 font-semibold hover:underline"
          >
            Create an Account
          </button>
        </p>
      </div>
    </div>
  );
}

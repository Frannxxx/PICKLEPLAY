import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { UserRole } from '../types.ts';
import {
  Trophy,
  Shield,
  ArrowRight,
  UserCheck,
  Check,
  Lock,
  Mail,
  User,
  Activity,
  Calendar,
  Sparkles,
  AlertCircle,
} from 'lucide-react';

interface AuthPortalProps {
  initialMode?: 'login' | 'register';
}

export default function AuthPortal({ initialMode = 'login' }: AuthPortalProps) {
  const { login, register, isLoading } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  // Form states
  const [fullName, setFullName] = useState('');
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('player');
  const [duprId, setDuprId] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!emailOrUsername.trim()) {
      setErrorMessage('Please enter your username or email');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password');
      return;
    }

    try {
      // Allow username or email: if no @, append @pickleplay.com for convenience
      const email = emailOrUsername.includes('@')
        ? emailOrUsername.trim().toLowerCase()
        : `${emailOrUsername.trim().toLowerCase()}@pickleplay.com`;

      await login(email);
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed. Please check credentials.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!fullName.trim()) {
      setErrorMessage('Please provide your full name');
      return;
    }
    if (!emailOrUsername.trim()) {
      setErrorMessage('Please provide a username or email');
      return;
    }
    if (password.length < 4) {
      setErrorMessage('Password must be at least 4 characters');
      return;
    }

    try {
      const email = emailOrUsername.includes('@')
        ? emailOrUsername.trim().toLowerCase()
        : `${emailOrUsername.trim().toLowerCase()}@pickleplay.com`;

      await register({
        full_name: fullName.trim(),
        email,
        role,
        dupr_id: duprId.trim() || undefined,
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed');
    }
  };

  const handleFillDemo = (type: 'player' | 'admin') => {
    setErrorMessage(null);
    if (type === 'player') {
      setMode('login');
      setEmailOrUsername('taylor@pickleplay.com');
      setPassword('password123');
    } else {
      setMode('login');
      setEmailOrUsername('marcus@pickleplay.com');
      setPassword('adminpass');
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col justify-center items-center py-10 px-4">
      {/* Container Card */}
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12">
        {/* Left Hero Branding Column */}
        <div className="md:col-span-5 relative bg-slate-950 p-6 sm:p-8 flex flex-col justify-between overflow-hidden border-b md:border-b-0 md:border-r border-slate-800">
          <div className="absolute inset-0 z-0 opacity-20">
            <img
              src="/src/assets/images/pickleball_court_hero_1790512672504.jpg"
              alt="PicklePlay Championship Arena"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
          </div>

          {/* Brand header */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-md">
                <Trophy className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-white font-['Cabinet_Grotesk'] leading-none">
                  PICKLE<span className="text-emerald-400">PLAY</span>
                </h1>
                <span className="text-[11px] text-slate-400 font-mono">Competitive Sports Portal</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-6">
              The premier platform for competitive pickleball ladder grinding, verified referee scorekeeping, and Stripe court reservations.
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="relative z-10 space-y-3 my-4">
            <div className="flex items-start gap-2.5 text-xs text-slate-300">
              <Shield className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-semibold">Zero-Bias Scorekeeping</strong>
                <span className="text-[11px] text-slate-400">Only verified Court Admins and referees score matches to prevent bias.</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 text-xs text-slate-300">
              <Activity className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-semibold">Real-Time Elo & DUPR Sync</strong>
                <span className="text-[11px] text-slate-400">Win matches, earn XP, and climb divisions from Bronze to Pickle Master.</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 text-xs text-slate-300">
              <Calendar className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-semibold">Instant Stripe Court Passes</strong>
                <span className="text-[11px] text-slate-400">Reserve indoor/outdoor championship courts with one tap.</span>
              </div>
            </div>
          </div>

          {/* Quick Demo Pre-fills */}
          <div className="relative z-10 mt-4 pt-4 border-t border-slate-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Quick Test Credentials
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleFillDemo('player')}
                className="py-1.5 px-2 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-[11px] font-bold text-slate-200 border border-slate-700/80 text-center transition-all"
              >
                🎮 Demo Player
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo('admin')}
                className="py-1.5 px-2 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 text-[11px] font-bold text-emerald-300 border border-emerald-500/30 text-center transition-all"
              >
                🛡️ Demo Referee
              </button>
            </div>
          </div>
        </div>

        {/* Right Form Column: Sign In or Register */}
        <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden bg-slate-900/95">
          {/* Subtle background ambient overlay */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

          <div>
            {/* Visual Action Banner with Gear Picture */}
            <div className="relative h-28 sm:h-32 w-full rounded-2xl overflow-hidden mb-5 border border-slate-800 shadow-xl group">
              <img
                src="/src/assets/images/auth_pickleball_gear_1790517058648.jpg"
                alt="PicklePlay Pro Access"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
              <div className="absolute top-2.5 right-3">
                <span className="text-[10px] font-mono font-bold text-emerald-300 bg-slate-950/85 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-emerald-500/40 shadow">
                  Season 1 Live
                </span>
              </div>
              <div className="absolute bottom-2.5 left-3.5 right-3.5 flex items-center justify-between text-xs">
                <span className="font-bold text-white tracking-wide text-xs flex items-center gap-1.5 drop-shadow">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Tagum City Competitive Circuit
                </span>
                <span className="text-[10px] text-slate-300 font-mono hidden sm:inline">
                  Verified Court Scoring
                </span>
              </div>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800 mb-5">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMessage(null);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  mode === 'login'
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setErrorMessage(null);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  mode === 'register'
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Create Account (Register)
              </button>
            </div>

            {/* Error Notification */}
            {errorMessage && (
              <div className="p-3 mb-4 rounded-xl bg-red-950/70 border border-red-500/40 text-red-200 text-xs flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* FORM: LOGIN */}
            {mode === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">Sign In to Your Account</h2>
                  <p className="text-xs text-slate-400">
                    Enter your email or username to access your player profile or referee scorepad.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Username or Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={emailOrUsername}
                      onChange={(e) => setEmailOrUsername(e.target.value)}
                      placeholder="e.g. taylor@pickleplay.com"
                      required
                      className="w-full h-11 pl-10 pr-3.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-300">Password</label>
                    <span className="text-[11px] text-emerald-400 hover:underline cursor-pointer">
                      Demo mode: any password
                    </span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full h-11 pl-10 pr-3.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 mt-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {isLoading ? (
                    <span>Verifying Session...</span>
                  ) : (
                    <>
                      <span>Enter PicklePlay Platform</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* FORM: REGISTER */
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">Create Player or Admin Account</h2>
                  <p className="text-xs text-slate-400">
                    Select your platform role and create your credentials.
                  </p>
                </div>

                {/* Role Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Select Account Role
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole('player')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        role === 'player'
                          ? 'bg-emerald-950/40 border-emerald-500 text-white ring-1 ring-emerald-500/40'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          <Trophy className="w-3.5 h-3.5 text-emerald-400" />
                          Player
                        </span>
                        {role === 'player' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                      </div>
                      <p className="text-[11px] text-slate-400 leading-tight">
                        Grind ladder points & XP, book courts. (Cannot self-score matches)
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRole('court_admin')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        role === 'court_admin'
                          ? 'bg-emerald-950/40 border-emerald-500 text-white ring-1 ring-emerald-500/40'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          <Shield className="w-3.5 h-3.5 text-emerald-400" />
                          Court Admin
                        </span>
                        {role === 'court_admin' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                      </div>
                      <p className="text-[11px] text-slate-400 leading-tight">
                        Facility manager & referee. Has official scorekeeping authority.
                      </p>
                    </button>
                  </div>
                </div>

                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Jordan Cruz"
                      required
                      className="w-full h-10 pl-10 pr-3.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Email / Username */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Username or Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={emailOrUsername}
                      onChange={(e) => setEmailOrUsername(e.target.value)}
                      placeholder="e.g. jordan@pickleplay.com"
                      required
                      className="w-full h-10 pl-10 pr-3.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Password & DUPR */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full h-10 px-3.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      DUPR ID <span className="text-slate-500 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={duprId}
                      onChange={(e) => setDuprId(e.target.value)}
                      placeholder="e.g. DUPR-49102"
                      className="w-full h-10 px-3.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 mt-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {isLoading ? (
                    <span>Registering Account...</span>
                  ) : (
                    <>
                      <span>Complete Registration & Log In</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Footer toggle note */}
          <div className="pt-4 border-t border-slate-800/80 mt-4 text-center">
            {mode === 'login' ? (
              <p className="text-xs text-slate-400">
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setErrorMessage(null);
                  }}
                  className="text-emerald-400 font-bold hover:underline"
                >
                  Register as Player or Admin
                </button>
              </p>
            ) : (
              <p className="text-xs text-slate-400">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMessage(null);
                  }}
                  className="text-emerald-400 font-bold hover:underline"
                >
                  Sign In with your credentials
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

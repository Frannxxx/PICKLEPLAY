import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useNotifications } from '../../context/NotificationContext.tsx';
import {
  Settings,
  X,
  User,
  Mail,
  Lock,
  Phone,
  Eye,
  EyeOff,
  Shield,
  HelpCircle,
  PhoneCall,
  Sliders,
  Check,
  Save,
  AlertCircle,
  Sparkles,
  RefreshCw,
  Copy,
  CheckCheck,
  Send,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  MapPin,
  Building,
  Calendar,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSchemaModal?: () => void;
}

type SettingsTab = 'account' | 'privacy' | 'preferences' | 'help' | 'contacts';

interface PrivacySettings {
  isPublicProfile: boolean;
  shareMatchHistory: boolean;
  allowRefereeSms: boolean;
  showSkillRatingPublic: boolean;
}

const DEFAULT_PRIVACY: PrivacySettings = {
  isPublicProfile: true,
  shareMatchHistory: true,
  allowRefereeSms: true,
  showSkillRatingPublic: true,
};

export default function SettingsModal({
  isOpen,
  onClose,
  onOpenSchemaModal,
}: SettingsModalProps) {
  const { user, isCourtAdmin, updateUserProfile } = useAuth();
  const { addNotification } = useNotifications();

  const [activeTab, setActiveTab] = useState<SettingsTab>('account');

  // Account State
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '+63 917 555 3821');

  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Privacy State
  const [privacy, setPrivacy] = useState<PrivacySettings>(() => {
    try {
      const saved = localStorage.getItem('pickleplay_privacy_settings');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse privacy settings', e);
    }
    return DEFAULT_PRIVACY;
  });

  // Preferences State
  const [matchAlerts, setMatchAlerts] = useState(true);
  const [courtAlerts, setCourtAlerts] = useState(true);
  const [confettiCelebrations, setConfettiCelebrations] = useState(true);
  const [preferredFormat, setPreferredFormat] = useState<'both' | 'doubles' | 'singles'>('doubles');
  const [homeVenue, setHomeVenue] = useState('City Pickle Grounds (CPG) Tagum');

  // Help Accordion State
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);
  const [supportMessage, setSupportMessage] = useState('');
  const [supportSubmitted, setSupportSubmitted] = useState(false);

  // Status feedback
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Sync inputs with user on open
  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setPhone(user.phone || '+63 917 555 3821');
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccessMsg(null);
    setPasswordError(null);

    try {
      if (!fullName.trim()) {
        throw new Error('Full name cannot be blank.');
      }

      // Check Password Change if attempted
      if (newPassword || confirmPassword || currentPassword) {
        if (!currentPassword) {
          throw new Error('Please enter your current password to confirm changes.');
        }
        if (newPassword.length < 6) {
          throw new Error('New password must be at least 6 characters long.');
        }
        if (newPassword !== confirmPassword) {
          throw new Error('New passwords do not match.');
        }
        setPasswordSuccess(true);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }

      await updateUserProfile({
        full_name: fullName.trim(),
        phone: phone.trim(),
      });

      setSaveSuccessMsg('Account details and profile credentials updated successfully!');
      addNotification({
        title: 'Account Settings Updated',
        message: `Profile updated: ${fullName}. Credentials saved.`,
        type: 'league',
        badge: 'SAVED',
      });

      setTimeout(() => setSaveSuccessMsg(null), 4000);
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to update account.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePrivacy = () => {
    localStorage.setItem('pickleplay_privacy_settings', JSON.stringify(privacy));
    setSaveSuccessMsg('Privacy controls saved to your local session.');
    addNotification({
      title: 'Privacy Settings Updated',
      message: 'Ladder and match history visibility preferences saved.',
      type: 'league',
      badge: 'PRIVACY',
    });
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportMessage.trim()) return;
    setSupportSubmitted(true);
    addNotification({
      title: 'Support Ticket Submitted',
      message: 'Your inquiry was dispatched to Coach Marcus and the Tagum officiating staff.',
      type: 'referee',
      badge: 'TICKET #781',
    });
    setSupportMessage('');
    setTimeout(() => setSupportSubmitted(false), 5000);
  };

  const faqs = [
    {
      q: 'How is official ELO rating calculated?',
      a: 'PicklePlay uses a FIDE/USATT tournament-adapted Elo algorithm with dynamic K-factors (K=32 for calibrating players, K=16 for veteran tier athletes). When a certified referee enters the final scoreline, point differentials and opponent strength adjust your ladder standing immediately.',
    },
    {
      q: 'How does DUPR algorithm sync work in Tagum City?',
      a: 'Official scores recorded by certified referees at City Pickle Grounds, M Central, and the Arena are queued for algorithmic reconciliation with the Philippine Pickleball circuit registry. You can trigger an instant pull by pressing "Sync Official DUPR" on your dashboard or profile.',
    },
    {
      q: 'What is the Referee Anti-Bias Protocol?',
      a: 'To guarantee competitive ladder integrity and prevent rating inflation, players cannot self-score their own competitive ladder matches. Only certified Court Admins (such as Coach Marcus Sterling) hold electronic referee scorekeeping clearance.',
    },
    {
      q: 'How do Stripe court access passes work?',
      a: 'When you book a court through the Courts tab, an instantaneous Stripe Payment Intent reserves your court number and slot. A verified QR/Access code is generated for your venue turnstile and night court lighting activation.',
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[92vh] shadow-2xl relative overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Banner Header with Arena Picture */}
        <div className="relative h-28 sm:h-32 w-full overflow-hidden bg-slate-950 border-b border-slate-800 shrink-0">
          <img
            src="/src/assets/images/pickleball_court_hero_1790512672504.jpg"
            alt="Settings Arena"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-slate-950/80 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition-colors border border-slate-700/60 backdrop-blur-md shadow"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Banner Title */}
          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow backdrop-blur-md">
                <Settings className="w-4 h-4 animate-spin-slow" />
              </div>
              <div>
                <h2 className="text-base font-black text-white uppercase tracking-wider font-['Cabinet_Grotesk'] leading-none">
                  Platform Settings & Preferences
                </h2>
              </div>
            </div>

            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-slate-950/80 border border-slate-700 text-emerald-400 text-[10px] font-mono font-bold">
              Tagum Circuit
            </span>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-1 px-4 py-2.5 bg-slate-950 border-b border-slate-800 overflow-x-auto no-scrollbar shrink-0">
          <button
            onClick={() => setActiveTab('account')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'account'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Account & Password</span>
          </button>

          <button
            onClick={() => setActiveTab('privacy')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'privacy'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Privacy Controls</span>
          </button>

          <button
            onClick={() => setActiveTab('preferences')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'preferences'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Preferences</span>
          </button>

          <button
            onClick={() => setActiveTab('help')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'help'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Help & FAQ</span>
          </button>

          <button
            onClick={() => setActiveTab('contacts')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'contacts'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Official Contacts</span>
          </button>
        </div>

        {/* Scrollable Main Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5 text-xs text-slate-300">
          {/* Success / Error Feedback Alerts */}
          {saveSuccessMsg && (
            <div className="p-3 rounded-2xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2.5 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-400 shrink-0 stroke-[3]" />
              <span className="font-semibold">{saveSuccessMsg}</span>
            </div>
          )}

          {passwordError && (
            <div className="p-3 rounded-2xl bg-red-950/70 border border-red-500/50 text-red-200 text-xs flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}

          {/* TAB 1: ACCOUNT & PASSWORD */}
          {activeTab === 'account' && (
            <form onSubmit={handleSaveAccount} className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-400" />
                  <span>Personal Details & Identity</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Change Full Name */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Full Legal Name
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Frannnxx"
                        className="w-full h-10 pl-9 pr-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500"
                        required
                      />
                      <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  {/* Change Phone Number */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Mobile Number (SMS Court & Match Call-ups)
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+63 9XX XXX XXXX"
                        className="w-full h-10 pl-9 pr-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-emerald-500"
                      />
                      <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Change Password Block */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <Lock className="w-4 h-4 text-amber-400" />
                    <span>Change Security Password</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 font-mono"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showPassword ? 'Hide Passwords' : 'Show Passwords'}</span>
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 font-medium mb-1">
                      Current Password (leave blank if keeping existing)
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-400 font-medium mb-1">
                        New Password
                      </label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-400 font-medium mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-type new password"
                        className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-50"
                >
                  <Save className="w-4 h-4 stroke-[2.5]" />
                  <span>{isSaving ? 'Updating Profile...' : 'Save Profile Changes'}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: PRIVACY CONTROLS */}
          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3.5">
                <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span>Competitive Ladder & Visibility Privacy</span>
                </h3>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Control how your player profile, match history, and contact details appear across the Tagum City network.
                </p>

                <div className="space-y-3 pt-2">
                  {/* Public Profile Visibility */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                    <div>
                      <h4 className="font-bold text-white text-xs">Public Leaderboard Listing</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Allow other athletes and referees to view your name and ELO rank on the ladder.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPrivacy({ ...privacy, isPublicProfile: !privacy.isPublicProfile })}
                      className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
                        privacy.isPublicProfile ? 'bg-emerald-500' : 'bg-slate-800'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-slate-950 shadow-md transform transition-transform ${
                          privacy.isPublicProfile ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Share Match History */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                    <div>
                      <h4 className="font-bold text-white text-xs">Match History Ledger Public</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Let opponents view past game scorelines, game type, and point deltas.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPrivacy({ ...privacy, shareMatchHistory: !privacy.shareMatchHistory })}
                      className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
                        privacy.shareMatchHistory ? 'bg-emerald-500' : 'bg-slate-800'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-slate-950 shadow-md transform transition-transform ${
                          privacy.shareMatchHistory ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Allow Referee SMS */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                    <div>
                      <h4 className="font-bold text-white text-xs">Certified Referee Emergency Contact</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Allow official tournament coordinators to reach you via SMS regarding court assignments.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPrivacy({ ...privacy, allowRefereeSms: !privacy.allowRefereeSms })}
                      className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
                        privacy.allowRefereeSms ? 'bg-emerald-500' : 'bg-slate-800'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-slate-950 shadow-md transform transition-transform ${
                          privacy.allowRefereeSms ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleSavePrivacy}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                >
                  <Save className="w-4 h-4 stroke-[2.5]" />
                  <span>Save Privacy Settings</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: PREFERENCES */}
          {activeTab === 'preferences' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3.5">
                <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-emerald-400" />
                  <span>Match & Facility Preferences</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-white mb-1.5">
                      Preferred Format
                    </label>
                    <select
                      value={preferredFormat}
                      onChange={(e) => setPreferredFormat(e.target.value as any)}
                      className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500"
                    >
                      <option value="both">Both (Singles & Doubles)</option>
                      <option value="doubles">Doubles (2v2 Standard)</option>
                      <option value="singles">Singles (1v1 Championship)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-white mb-1.5">
                      Home Venue Facility
                    </label>
                    <select
                      value={homeVenue}
                      onChange={(e) => setHomeVenue(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500"
                    >
                      <option value="City Pickle Grounds (CPG) Tagum">City Pickle Grounds (CPG)</option>
                      <option value="M Central Pickleball Club Tagum">M Central Pickleball Club</option>
                      <option value="Tagum City Elite Arena">Tagum City Elite Arena</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>Celebration Animations</span>
                </h3>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                  <div>
                    <h4 className="font-bold text-white text-xs">Promotion Confetti Explosions</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Show screen-wide confetti particles when advancing between rank tiers.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setConfettiCelebrations(!confettiCelebrations)}
                    className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
                      confettiCelebrations ? 'bg-emerald-500' : 'bg-slate-800'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-slate-950 shadow-md transform transition-transform ${
                        confettiCelebrations ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: HELP & FAQ */}
          {activeTab === 'help' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-emerald-400" />
                  <span>Frequently Asked Questions & Rulebook</span>
                </h3>

                <div className="space-y-2 pt-1">
                  {faqs.map((faq, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl bg-slate-900/80 border border-slate-800 overflow-hidden"
                    >
                      <button
                        type="button"
                        onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                        className="w-full p-3 text-left font-bold text-white text-xs flex items-center justify-between hover:text-emerald-400 transition-colors"
                      >
                        <span>{faq.q}</span>
                        {expandedFaq === idx ? (
                          <ChevronUp className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                        )}
                      </button>
                      {expandedFaq === idx && (
                        <div className="p-3 pt-0 text-[11px] text-slate-300 leading-relaxed border-t border-slate-800/60 mt-1">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit a Dispute / Inquiry */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Send className="w-4 h-4 text-amber-400" />
                  <span>Dispute a Match Score or Send Inquiry</span>
                </h3>

                {supportSubmitted ? (
                  <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCheck className="w-4 h-4 text-emerald-400" />
                    <span>Inquiry submitted! Coach Marcus and officiating staff will review shortly.</span>
                  </div>
                ) : (
                  <form onSubmit={handleSupportSubmit} className="space-y-2.5">
                    <textarea
                      value={supportMessage}
                      onChange={(e) => setSupportMessage(e.target.value)}
                      placeholder="Describe the match ID, score issue, or court inquiry..."
                      rows={3}
                      className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
                      required
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Send to Referee Staff</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: OFFICIAL CONTACTS */}
          {activeTab === 'contacts' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3.5">
                <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Building className="w-4 h-4 text-emerald-400" />
                  <span>Official Tagum City Officiating Directory</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Verified contacts for court supervisors, head referees, and facility managers across Davao del Norte.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {/* Contact Card 1 */}
                  <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        HEAD REFEREE
                      </span>
                      <button
                        onClick={() => handleCopy('marcus@pickleplay.com', 'marcus')}
                        className="text-slate-400 hover:text-white transition-colors"
                        title="Copy email"
                      >
                        {copiedKey === 'marcus' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-xs">Coach Marcus Sterling</h4>
                      <p className="text-[11px] text-slate-400 font-mono">marcus@pickleplay.com</p>
                      <p className="text-[11px] text-emerald-400 font-mono mt-0.5">+63 917 888 1234</p>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-800">
                      Championship Circuit Scorer
                    </div>
                  </div>

                  {/* Contact Card 2 */}
                  <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        VENUE CONCIERGE
                      </span>
                      <button
                        onClick={() => handleCopy('+63 (084) 216-9876', 'cpg')}
                        className="text-slate-400 hover:text-white transition-colors"
                        title="Copy phone"
                      >
                        {copiedKey === 'cpg' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-xs">City Pickle Grounds (CPG)</h4>
                      <p className="text-[11px] text-slate-400 font-mono">support@cpg-tagum.ph</p>
                      <p className="text-[11px] text-emerald-400 font-mono mt-0.5">+63 (084) 216-9876</p>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-800">
                      Mankilam, Tagum City, PH
                    </div>
                  </div>

                  {/* Contact Card 3 */}
                  <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        TOURNAMENT DESK
                      </span>
                      <button
                        onClick={() => handleCopy('+63 920 444 8910', 'desk')}
                        className="text-slate-400 hover:text-white transition-colors"
                        title="Copy hotline"
                      >
                        {copiedKey === 'desk' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-xs">M Central Pickleball Club</h4>
                      <p className="text-[11px] text-slate-400 font-mono">desk@mcentral-pickle.ph</p>
                      <p className="text-[11px] text-emerald-400 font-mono mt-0.5">+63 920 444 8910</p>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-800">
                      Magugpo Central, Tagum City
                    </div>
                  </div>

                  {/* Contact Card 4 */}
                  <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30">
                        DUPR DESK
                      </span>
                      <button
                        onClick={() => handleCopy('dupr@pickleplay.ph', 'dupr')}
                        className="text-slate-400 hover:text-white transition-colors"
                        title="Copy email"
                      >
                        {copiedKey === 'dupr' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-xs">DUPR Philippines Desk</h4>
                      <p className="text-[11px] text-slate-400 font-mono">dupr@pickleplay.ph</p>
                      <p className="text-[11px] text-emerald-400 font-mono mt-0.5">Rating Verification Hub</p>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-800">
                      Philippine Rating Sync Desk
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 sm:p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-[11px] text-slate-400">
              Session: <strong className="text-white">{user?.full_name}</strong>
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

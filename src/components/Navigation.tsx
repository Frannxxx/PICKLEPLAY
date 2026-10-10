import React from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useNotifications } from '../../context/NotificationContext.tsx';
import {
  Trophy,
  Calendar,
  Shield,
  Layers,
  LogOut,
  User,
  Activity,
  Database,
  Smartphone,
  Maximize2,
  Bell,
  Settings,
  Swords,
} from 'lucide-react';

interface NavigationProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenSchemaModal: () => void;
  onOpenNotifications?: () => void;
  onOpenSettings?: () => void;
}

export function TopBar({
  currentTab,
  onSelectTab,
  onOpenSchemaModal,
  onOpenNotifications,
  onOpenSettings,
}: NavigationProps) {
  const { user, isCourtAdmin, logout, switchUser } = useAuth();
  const { unreadCount } = useNotifications();

  const handleRoleToggle = () => {
    if (isCourtAdmin) {
      // Switch to Frannnxx (Player)
      switchUser({
        id: '00000000-0000-0000-0000-000000000002',
        full_name: 'Frannnxx',
        email: 'franx000002@gmail.com',
        role: 'player',
        rank_points: 1680,
        rank_tier: 'Gold',
        total_xp: 4250,
        wins: 42,
        losses: 19,
        dupr_id: 'DUPR-54812',
        skill_rating: 4.15,
        avatar_url: '/src/assets/images/frannnxx_avatar_1791277042121.jpg',
      });
    } else {
      // Switch to Coach Marcus (Court Admin / Referee)
      switchUser({
        id: '00000000-0000-0000-0000-000000000001',
        full_name: 'Coach Marcus Sterling',
        email: 'marcus@pickleplay.com',
        role: 'court_admin',
        rank_points: 0,
        rank_tier: 'Bronze',
        total_xp: 0,
        wins: 0,
        losses: 0,
        dupr_id: 'REF-99214',
        skill_rating: 0,
        avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80',
      });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-md px-4 sm:px-6 py-3 flex items-center justify-between">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onSelectTab('dashboard')}
          className="text-lg sm:text-xl font-black tracking-tight text-white font-['Cabinet_Grotesk'] flex items-center gap-2 focus:outline-none"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>PICKLE<span className="text-emerald-400">PLAY</span></span>
        </button>
      </div>

      {/* Zone 2: Navigation Links */}
      <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-400">
        <button
          onClick={() => onSelectTab('dashboard')}
          className={`transition-colors whitespace-nowrap ${
            currentTab === 'dashboard' ? 'text-emerald-400 font-bold' : 'hover:text-slate-200'
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => onSelectTab('leaderboard')}
          className={`transition-colors whitespace-nowrap ${
            currentTab === 'leaderboard' ? 'text-emerald-400 font-bold' : 'hover:text-slate-200'
          }`}
        >
          Leaderboards
        </button>
        <button
          onClick={() => onSelectTab('tournaments')}
          className={`transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            currentTab === 'tournaments' ? 'text-emerald-400 font-bold' : 'hover:text-slate-200'
          }`}
        >
          <Swords className="w-3.5 h-3.5 text-emerald-400" />
          <span>Tournaments</span>
        </button>
        <button
          onClick={() => onSelectTab('courts')}
          className={`transition-colors whitespace-nowrap ${
            currentTab === 'courts' ? 'text-emerald-400 font-bold' : 'hover:text-slate-200'
          }`}
        >
          Courts & Stripe
        </button>
        {isCourtAdmin && (
          <button
            onClick={() => onSelectTab('scorekeeper')}
            className={`transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              currentTab === 'scorekeeper' ? 'text-emerald-400 font-bold' : 'hover:text-slate-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Referee Scorekeeper</span>
          </button>
        )}
        <button
          onClick={() => onSelectTab('profile')}
          className={`transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            currentTab === 'profile' ? 'text-emerald-400 font-bold' : 'hover:text-slate-200'
          }`}
        >
          <User className="w-3.5 h-3.5 text-emerald-400" />
          <span>My Profile</span>
        </button>
      </nav>

      {/* Zone 3: 1-2 primary actions + user state */}
      <div className="flex items-center gap-2.5">
        {/* Notification Bell Button */}
        <button
          onClick={onOpenNotifications}
          className="relative w-9 h-9 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 flex items-center justify-center active:scale-95 transition-all shadow"
          title="Notifications Center"
        >
          <Bell className="w-4 h-4 text-emerald-400" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-emerald-500 text-slate-950 font-black text-[9px] font-mono shadow-md ring-2 ring-slate-950">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Settings Button */}
        <button
          onClick={onOpenSettings}
          className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 flex items-center justify-center active:scale-95 transition-all shadow"
          title="Platform Preferences & Settings"
        >
          <Settings className="w-4 h-4 text-slate-300 hover:text-emerald-400 transition-colors" />
        </button>

        {/* Quick Role Switcher Pill */}
        {user && (
          <button
            onClick={handleRoleToggle}
            className={`hidden sm:flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-bold border transition-all active:scale-95 ${
              isCourtAdmin
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/50'
                : 'bg-slate-900 text-slate-200 border-slate-800'
            }`}
            title={
              isCourtAdmin
                ? 'Referee (Court Scoring Only) — Click to switch to Player to play matches'
                : 'Player (Competitive Ladder) — Click to switch to Referee'
            }
          >
            {isCourtAdmin ? (
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Trophy className="w-3.5 h-3.5 text-emerald-400" />
            )}
            <span className="truncate max-w-[110px]">{user.full_name}</span>
            <span className="text-[10px] text-slate-400 font-normal">
              ({isCourtAdmin ? 'Admin' : 'Player'})
            </span>
          </button>
        )}

        {/* LOG OUT BUTTON */}
        {user && (
          <button
            onClick={logout}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 text-xs font-bold border border-red-500/30 active:scale-95 transition-all"
            title="Sign out of your account"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Log Out</span>
          </button>
        )}
      </div>
    </header>
  );
}

export function BottomTabBar({
  currentTab,
  onSelectTab,
}: {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}) {
  const { isCourtAdmin } = useAuth();

  const tabs = isCourtAdmin
    ? [
        { id: 'dashboard', label: 'Dashboard', icon: Activity },
        { id: 'leaderboard', label: 'Rankings', icon: Trophy },
        { id: 'tournaments', label: 'Tournaments', icon: Swords },
        { id: 'courts', label: 'Courts', icon: Calendar },
        {
          id: 'scorekeeper',
          label: 'Referee',
          icon: Shield,
          badge: 'ADMIN',
        },
        { id: 'profile', label: 'Profile', icon: User },
      ]
    : [
        { id: 'dashboard', label: 'Dashboard', icon: Activity },
        { id: 'leaderboard', label: 'Rankings', icon: Trophy },
        { id: 'tournaments', label: 'Tournaments', icon: Swords },
        { id: 'courts', label: 'Courts', icon: Calendar },
        { id: 'profile', label: 'Profile', icon: User },
      ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 h-16 bg-slate-950/95 backdrop-blur-md border-t border-slate-800/80 px-2 flex items-center justify-around max-w-2xl mx-auto">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={`min-h-[44px] min-w-[56px] flex flex-col items-center justify-center relative py-1 px-3 rounded-xl transition-all ${
              isActive ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="relative">
              <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-400 stroke-[2.5]' : ''}`} />
              {tab.badge && (
                <span
                  className={`absolute -top-1.5 -right-3.5 text-[8px] font-black px-1 rounded ${
                    isCourtAdmin
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] tracking-tight mt-1 whitespace-nowrap">
              {tab.label}
            </span>
            {isActive && (
              <span className="w-1 h-1 rounded-full bg-emerald-400 mt-0.5" />
            )}
          </button>
        );
      })}
    </nav>
  );
}

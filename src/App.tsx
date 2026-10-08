import React, { useState } from 'react';
import { AuthProvider, useAuth } from '../context/AuthContext.tsx';
import { NotificationProvider, useNotifications } from '../context/NotificationContext.tsx';
import AuthPortal from './components/AuthPortal.tsx';
import DashboardScreen from '../app/(tabs)/index.tsx';
import LeaderboardScreen from '../app/(tabs)/leaderboard.tsx';
import CourtsScreen from '../app/(tabs)/courts.tsx';
import TournamentsScreen from '../app/(tabs)/tournaments.tsx';
import ScorekeeperScreen from '../app/(tabs)/scorekeeper.tsx';
import ProfileScreen from './components/ProfileScreen.tsx';
import { TopBar, BottomTabBar } from './components/Navigation.tsx';
import SchemaInspectorModal from './components/SchemaInspectorModal.tsx';
import HostMatchModal from './components/HostMatchModal.tsx';
import NotificationDrawer, { NotificationToast } from './components/NotificationDrawer.tsx';
import SettingsModal from './components/SettingsModal.tsx';
import { EloAdjustmentResult } from './types.ts';
import { Plus } from 'lucide-react';

function AppContent() {
  const { user, isLoading, isCourtAdmin } = useAuth();
  const { addNotification } = useNotifications();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isSchemaModalOpen, setIsSchemaModalOpen] = useState<boolean>(false);
  const [isHostMatchModalOpen, setIsHostMatchModalOpen] = useState<boolean>(false);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [lastEloResult, setLastEloResult] = useState<EloAdjustmentResult | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-400 font-mono">
            Loading PicklePlay...
          </span>
        </div>
      </div>
    );
  }

  // 1. Unauthenticated Gate: User must log in or register with username/password & role
  if (!user) {
    return <AuthPortal initialMode="login" />;
  }

  // 2. Render Screen according to currentTab
  const renderScreen = () => {
    switch (currentTab) {
      case 'dashboard':
        return (
          <DashboardScreen
            onNavigateTab={setCurrentTab}
            onOpenMatchModal={() => setIsHostMatchModalOpen(true)}
          />
        );
      case 'leaderboard':
        return <LeaderboardScreen />;
      case 'tournaments':
        return <TournamentsScreen />;
      case 'courts':
        return <CourtsScreen />;
      case 'scorekeeper':
        return (
          <ScorekeeperScreen
            onScoreSubmitted={(result) => {
              setLastEloResult(result);
              addNotification({
                title: `Match Finalized · Team ${result.winnerTeam} Victorious!`,
                message: `Official match finalized: ${result.teamAScore}-${result.teamBScore}. ELO points & DUPR recalculated.`,
                type: 'match',
                targetTab: 'leaderboard',
                actionLabel: 'Inspect Ladder',
                badge: `FINAL ${result.teamAScore}-${result.teamBScore}`,
              });
            }}
          />
        );
      case 'profile':
        return <ProfileScreen onNavigateTab={setCurrentTab} />;
      default:
        return <DashboardScreen onNavigateTab={setCurrentTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Application Bar */}
      <TopBar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenSchemaModal={() => setIsSchemaModalOpen(true)}
        onOpenNotifications={() => setIsNotificationDrawerOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
      />

      {/* Main Spacious Content Container (No phone simulator frame) */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 flex flex-col pb-24">
        {renderScreen()}
      </main>

      {/* Bottom Tab Bar for Mobile Touch Ergonomics */}
      <div className="md:hidden">
        <BottomTabBar currentTab={currentTab} onSelectTab={setCurrentTab} />
      </div>

      {/* Floating Live Notification Toast */}
      <NotificationToast onNavigateTab={setCurrentTab} />

      {/* Host Match Floating Action Pill */}
      {currentTab === 'dashboard' && (
        <button
          onClick={() => setIsHostMatchModalOpen(true)}
          className="fixed bottom-20 md:bottom-8 right-6 z-40 h-12 px-5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-xl shadow-emerald-500/25 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Host Match</span>
        </button>
      )}

      {/* Notifications Drawer */}
      <NotificationDrawer
        isOpen={isNotificationDrawerOpen}
        onClose={() => setIsNotificationDrawerOpen(false)}
        onNavigateTab={setCurrentTab}
      />

      {/* Settings & Preferences Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onOpenSchemaModal={() => setIsSchemaModalOpen(true)}
      />

      {/* Modals */}
      <SchemaInspectorModal
        isOpen={isSchemaModalOpen}
        onClose={() => setIsSchemaModalOpen(false)}
      />

      <HostMatchModal
        isOpen={isHostMatchModalOpen}
        onClose={() => setIsHostMatchModalOpen(false)}
        onMatchCreated={() => {
          addNotification({
            title: 'New Match Hosted on Center Court',
            message: 'Your fixture is now live on the referee queue. Awaiting official court scorer.',
            type: 'match',
            targetTab: isCourtAdmin ? 'scorekeeper' : 'dashboard',
            actionLabel: 'View Match',
            badge: 'HOSTED',
          });
          if (isCourtAdmin) setCurrentTab('scorekeeper');
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <AppContent />
      </NotificationProvider>
    </AuthProvider>
  );
}

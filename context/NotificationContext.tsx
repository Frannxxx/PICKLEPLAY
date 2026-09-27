import React, { createContext, useContext, useState, useEffect } from 'react';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'match' | 'dupr' | 'court' | 'league' | 'referee';
  read: boolean;
  timestamp: string;
  targetTab?: 'dashboard' | 'leaderboard' | 'courts' | 'scorekeeper' | 'profile';
  actionLabel?: string;
  badge?: string;
}

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
  addNotification: (notif: {
    title: string;
    message: string;
    type: 'match' | 'dupr' | 'court' | 'league' | 'referee';
    targetTab?: 'dashboard' | 'leaderboard' | 'courts' | 'scorekeeper' | 'profile';
    actionLabel?: string;
    badge?: string;
  }) => void;
  activeToast: AppNotification | null;
  dismissToast: () => void;
  simulateIncomingNotification: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const SEED_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'Official Match Finalized · +24 ELO',
    message: 'Tagum Championship Arena #4: You won 11-8 in a refereed match scored by Coach Marcus Sterling. ELO rating adjusted.',
    type: 'match',
    read: false,
    timestamp: '12m ago',
    targetTab: 'profile',
    actionLabel: 'View Match Record',
    badge: 'ELO +24',
  },
  {
    id: 'notif-2',
    title: 'DUPR Algorithmic Skill Rating Synced',
    message: 'Your DUPR rating was verified at 4.15 across official Davao del Norte sanctioned tournament matches.',
    type: 'dupr',
    read: false,
    timestamp: '1h ago',
    targetTab: 'profile',
    actionLabel: 'Check DUPR Sync',
    badge: 'DUPR 4.15',
  },
  {
    id: 'notif-3',
    title: 'City Pickle Grounds Court Reserved',
    message: 'Confirmed booking for Court 2 tonight (7:00 PM - 8:00 PM). Stripe instant access pass is ready in your wallet.',
    type: 'court',
    read: false,
    timestamp: '3h ago',
    targetTab: 'courts',
    actionLabel: 'View Court Pass',
    badge: 'CONFIRMED',
  },
  {
    id: 'notif-4',
    title: 'Season 1 Tagum Ladder Re-calibrated',
    message: 'Top Masters division standings updated. You are 45 ELO points away from qualifying for Platinum rank promotion.',
    type: 'league',
    read: true,
    timestamp: '1d ago',
    targetTab: 'leaderboard',
    actionLabel: 'Inspect Ladder',
    badge: 'LEAGUE',
  },
  {
    id: 'notif-5',
    title: 'Referee Anti-Bias Ledger Active',
    message: 'Certified court referee clearance enabled for upcoming Mankilam night sessions. Player self-scoring locked.',
    type: 'referee',
    read: true,
    timestamp: '2d ago',
    targetTab: 'scorekeeper',
    actionLabel: 'Referee Station',
    badge: 'OFFICIAL',
  },
];

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem('pickleplay_notifications');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse notifications from localStorage', e);
    }
    return SEED_NOTIFICATIONS;
  });

  const [activeToast, setActiveToast] = useState<AppNotification | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('pickleplay_notifications', JSON.stringify(notifications));
    } catch (e) {
      console.warn('Failed to save notifications to localStorage', e);
    }
  }, [notifications]);

  // Auto-dismiss active toast after 4.5 seconds
  useEffect(() => {
    if (activeToast) {
      const timer = setTimeout(() => {
        setActiveToast(null);
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [activeToast]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (activeToast?.id === id) {
      setActiveToast(null);
    }
  };

  const clearAll = () => {
    setNotifications([]);
    setActiveToast(null);
  };

  const addNotification = (notif: {
    title: string;
    message: string;
    type: 'match' | 'dupr' | 'court' | 'league' | 'referee';
    targetTab?: 'dashboard' | 'leaderboard' | 'courts' | 'scorekeeper' | 'profile';
    actionLabel?: string;
    badge?: string;
  }) => {
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: notif.title,
      message: notif.message,
      type: notif.type,
      read: false,
      timestamp: 'Just now',
      targetTab: notif.targetTab,
      actionLabel: notif.actionLabel,
      badge: notif.badge,
    };

    setNotifications((prev) => [newNotif, ...prev]);
    setActiveToast(newNotif);
  };

  const dismissToast = () => {
    setActiveToast(null);
  };

  const simulateIncomingNotification = () => {
    const simulations = [
      {
        title: 'New Official Match Hosted · Court 1',
        message: 'A 2v2 doubles match has been posted at City Pickle Grounds Tagum awaiting referee clearance.',
        type: 'match' as const,
        targetTab: 'dashboard' as const,
        actionLabel: 'View Active Match',
        badge: 'LIVE MATCH',
      },
      {
        title: 'Instant Stripe Court Pass Issued',
        message: 'M Central Pickleball Club (Court 3) confirmed. Lights and camera activated for your session.',
        type: 'court' as const,
        targetTab: 'courts' as const,
        actionLabel: 'Open Reservation',
        badge: 'PAID ₱350',
      },
      {
        title: 'Ladder Position Change · +1 Rank',
        message: 'You surpassed Davao North player in Gold division with 1,704 ELO points.',
        type: 'league' as const,
        targetTab: 'leaderboard' as const,
        actionLabel: 'See Ladder',
        badge: 'RANK UP',
      },
    ];

    const pick = simulations[Math.floor(Math.random() * simulations.length)];
    addNotification(pick);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll,
        addNotification,
        activeToast,
        dismissToast,
        simulateIncomingNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

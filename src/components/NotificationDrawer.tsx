import React, { useState } from 'react';
import { useNotifications, AppNotification } from '../../context/NotificationContext.tsx';
import {
  Bell,
  X,
  CheckCheck,
  Trash2,
  Trophy,
  Calendar,
  Shield,
  Sparkles,
  Activity,
  ArrowRight,
  ExternalLink,
  Zap,
} from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab?: (tab: string) => void;
}

export default function NotificationDrawer({
  isOpen,
  onClose,
  onNavigateTab,
}: NotificationDrawerProps) {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    simulateIncomingNotification,
  } = useNotifications();

  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'match' | 'court'>('all');

  if (!isOpen) return null;

  const filteredNotifications = notifications.filter((notif) => {
    if (activeFilter === 'unread') return !notif.read;
    if (activeFilter === 'match') return notif.type === 'match' || notif.type === 'league';
    if (activeFilter === 'court') return notif.type === 'court';
    return true;
  });

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'match':
        return <Activity className="w-4 h-4 text-emerald-400" />;
      case 'dupr':
        return <Sparkles className="w-4 h-4 text-blue-400" />;
      case 'court':
        return <Calendar className="w-4 h-4 text-amber-400" />;
      case 'league':
        return <Trophy className="w-4 h-4 text-yellow-400" />;
      case 'referee':
        return <Shield className="w-4 h-4 text-emerald-400" />;
      default:
        return <Bell className="w-4 h-4 text-slate-400" />;
    }
  };

  const handleActionClick = (notif: AppNotification) => {
    markAsRead(notif.id);
    if (notif.targetTab && onNavigateTab) {
      onNavigateTab(notif.targetTab);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-end sm:p-4 bg-slate-950/80 backdrop-blur-sm transition-opacity"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Drawer Panel */}
      <div className="relative z-10 w-full sm:max-w-md h-full sm:h-auto sm:max-h-[85vh] bg-slate-900 border border-slate-800 sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-top-4 duration-200">
        {/* Action Picture Banner */}
        <div className="relative h-32 sm:h-36 w-full overflow-hidden bg-slate-950 border-b border-slate-800/80 group">
          <img
            src="/src/assets/images/pickleball_match_smash_1790518380509.jpg"
            alt="Tagum Pickleball Match Alerts"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
          
          <div className="absolute top-3 left-4 right-4 flex items-center justify-between">
            <span className="px-2.5 py-1 rounded-full bg-slate-950/85 backdrop-blur-md border border-emerald-500/40 text-emerald-400 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5 shadow">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Tagum Circuit Dispatch
            </span>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-slate-950/85 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition-colors border border-slate-700/60 shadow"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="absolute bottom-2.5 left-4 right-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-white uppercase tracking-wider font-['Cabinet_Grotesk'] leading-none flex items-center gap-1.5">
                <Bell className="w-4 h-4 text-emerald-400" />
                <span>Live Notifications</span>
              </h3>
              <p className="text-[10px] text-slate-300 font-mono mt-0.5">
                Official ELO, Match Results & Court Feeds
              </p>
            </div>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px] font-mono shadow">
                {unreadCount} unread
              </span>
            )}
          </div>
        </div>

        {/* Action Controls & Simulation Bar */}
        <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800/80 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap ${
                activeFilter === 'all'
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setActiveFilter('unread')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap ${
                activeFilter === 'unread'
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Unread ({unreadCount})
            </button>
            <button
              onClick={() => setActiveFilter('match')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap ${
                activeFilter === 'match'
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Matches & ELO
            </button>
            <button
              onClick={() => setActiveFilter('court')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap ${
                activeFilter === 'court'
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Courts
            </button>
          </div>

          <button
            onClick={simulateIncomingNotification}
            className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-950/70 hover:bg-emerald-900/80 text-emerald-300 text-[10px] font-bold border border-emerald-500/40 active:scale-95 transition-all shadow"
            title="Simulate a real-time incoming court or match alert"
          >
            <Zap className="w-3 h-3 text-emerald-400 fill-emerald-400" />
            <span>Test Alert</span>
          </button>
        </div>

        {/* Notifications Scroll List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 max-h-[55vh]">
          {filteredNotifications.length === 0 ? (
            <div className="py-12 px-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-600 mx-auto mb-3">
                <Bell className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-white mb-1">No notifications found</h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto mb-4">
                You're all caught up! New official match scores, referee adjustments, and court bookings will appear here.
              </p>
              <button
                onClick={simulateIncomingNotification}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all"
              >
                Send Test Notification
              </button>
            </div>
          ) : (
            filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-3.5 rounded-2xl border transition-all relative ${
                  notif.read
                    ? 'bg-slate-950/60 border-slate-800/80 text-slate-300'
                    : 'bg-slate-950 border-emerald-500/40 shadow-md ring-1 ring-emerald-500/20'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                      {getIcon(notif.type)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5 leading-snug">
                        <span>{notif.title}</span>
                        {!notif.read && (
                          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
                        )}
                      </h4>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {notif.timestamp}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {notif.badge && (
                      <span className="text-[9px] font-bold font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-emerald-400">
                        {notif.badge}
                      </span>
                    )}
                    <button
                      onClick={() => deleteNotification(notif.id)}
                      className="p-1 rounded text-slate-600 hover:text-red-400 transition-colors"
                      title="Dismiss notification"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed mb-3 pl-9">
                  {notif.message}
                </p>

                {/* Footer Action Buttons */}
                <div className="flex items-center justify-between pl-9 pt-2 border-t border-slate-900/90 text-xs">
                  {notif.targetTab ? (
                    <button
                      onClick={() => handleActionClick(notif)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                      <span>{notif.actionLabel || 'View Details'}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  ) : (
                    <span />
                  )}

                  {!notif.read && (
                    <button
                      onClick={() => markAsRead(notif.id)}
                      className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>Mark read</span>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-3.5 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <button
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="flex items-center gap-1.5 hover:text-emerald-400 disabled:opacity-40 transition-colors font-medium"
          >
            <CheckCheck className="w-4 h-4 text-emerald-400" />
            <span>Mark all read</span>
          </button>

          <button
            onClick={clearAll}
            disabled={notifications.length === 0}
            className="flex items-center gap-1.5 hover:text-red-400 disabled:opacity-40 transition-colors font-medium"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear history</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export function NotificationToast({
  onNavigateTab,
}: {
  onNavigateTab?: (tab: string) => void;
}) {
  const { activeToast, dismissToast, markAsRead } = useNotifications();

  if (!activeToast) return null;

  const handleClick = () => {
    markAsRead(activeToast.id);
    if (activeToast.targetTab && onNavigateTab) {
      onNavigateTab(activeToast.targetTab);
    }
    dismissToast();
  };

  return (
    <div className="fixed top-16 right-4 sm:right-6 z-50 max-w-sm w-full animate-in slide-in-from-top-3 fade-in duration-200">
      <div className="p-4 rounded-2xl bg-slate-900/95 backdrop-blur-md border border-emerald-500/50 shadow-2xl shadow-emerald-500/10 flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
          <Bell className="w-4 h-4 animate-bounce" />
        </div>

        <div className="flex-1 cursor-pointer" onClick={handleClick}>
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 font-mono">
              {activeToast.badge || 'PICKLEPLAY ALERT'}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Just now</span>
          </div>

          <h4 className="text-xs font-bold text-white leading-snug">
            {activeToast.title}
          </h4>
          <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">
            {activeToast.message}
          </p>

          {activeToast.actionLabel && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 mt-2 hover:underline">
              <span>{activeToast.actionLabel}</span>
              <ArrowRight className="w-3 h-3" />
            </span>
          )}
        </div>

        <button
          onClick={dismissToast}
          className="p-1 rounded-lg text-slate-500 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

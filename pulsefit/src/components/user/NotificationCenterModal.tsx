import React from 'react';
import { useFitness } from '../../context/FitnessContext';
import { Modal } from '../common/Modal';
import { Bell, CheckCheck, Flame, Utensils, TrendingUp, Megaphone, Trash2 } from 'lucide-react';

export const NotificationCenterModal: React.FC = () => {
  const {
    isNotificationModalOpen,
    setIsNotificationModalOpen,
    notifications,
    unreadNotificationsCount,
    markNotificationAsRead,
    markAllNotificationsRead,
  } = useFitness();

  const getIcon = (type: string) => {
    switch (type) {
      case 'workout':
        return <Flame className="w-4 h-4 text-[#D9FF00]" />;
      case 'meal':
        return <Utensils className="w-4 h-4 text-[#D9FF00]" />;
      case 'progress':
        return <TrendingUp className="w-4 h-4 text-cyan-400" />;
      default:
        return <Megaphone className="w-4 h-4 text-[#D9FF00]" />;
    }
  };

  return (
    <Modal
      isOpen={isNotificationModalOpen}
      onClose={() => setIsNotificationModalOpen(false)}
      title="Alerts & System Bulletins"
      subtitle={`${unreadNotificationsCount} unread announcements and reminders`}
      maxWidth="md"
    >
      <div className="space-y-4 -m-1">
        {/* Actions header */}
        <div className="flex items-center justify-between pb-2 border-b border-white/5">
          <span className="text-xs text-white/40 font-semibold">Activity Feed</span>
          {unreadNotificationsCount > 0 && (
            <button
              onClick={markAllNotificationsRead}
              className="text-xs text-[#D9FF00] hover:text-[#D9FF00]/80 font-bold flex items-center gap-1 transition-colors"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark all as read</span>
            </button>
          )}
        </div>

        {/* Notifications list */}
        {notifications.length === 0 ? (
          <div className="text-center py-10 text-white/30">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-30 text-white" />
            <p className="text-xs">No active notifications</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {notifications.map((n) => (
              <div
                key={n._id}
                onClick={() => !n.isRead && markNotificationAsRead(n._id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  !n.isRead
                    ? 'bg-[#181818] border-[#D9FF00]/30 shadow-[0_0_10px_rgba(217,255,0,0.05)]'
                    : 'bg-[#111111] border-white/5 opacity-70'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-white/5 border border-white/10 shrink-0 mt-0.5">
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className={`text-xs font-bold truncate ${!n.isRead ? 'text-white' : 'text-white/60'}`}>
                        {n.title}
                      </h4>
                      <span className="text-[10px] text-white/30 shrink-0 font-mono">
                        {new Date(n.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-xs text-white/50 mt-1 leading-relaxed">{n.message}</p>
                  </div>
                  {!n.isRead && (
                    <span className="w-2 h-2 rounded-full bg-[#D9FF00] shrink-0 mt-1.5 shadow-[0_0_6px_rgba(217,255,0,0.8)]" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};

import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { AppNotification } from '../../types';
import { useFitness } from '../../context/FitnessContext';
import { Bell, Send, Trash2, Megaphone } from 'lucide-react';

export const AdminNotifications: React.FC = () => {
  const { showToast } = useFitness();

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'announcement' | 'workout' | 'nutrition' | 'reminder'>('announcement');
  const [targetRole, setTargetRole] = useState<'all' | 'user' | 'admin'>('all');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const res = await api.notifications.getAll();
      setNotifications(res.data.notifications);
    } catch {
      // ignore
    }
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;

    setIsLoading(true);
    try {
      await api.notifications.create({
        title,
        message,
        type,
        targetRole,
      });
      showToast('Notification broadcast successfully to all athletes!', 'success');
      setTitle('');
      setMessage('');
      loadNotifications();
    } catch (err: any) {
      showToast(err.message || 'Broadcast failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.notifications.delete(id);
      showToast('Notification removed', 'success');
      loadNotifications();
    } catch (err: any) {
      showToast(err.message || 'Delete failed', 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Push Notifications & Broadcasts</h1>
        <p className="text-xs text-white/40 mt-0.5">
          Send community announcements, workout motivation blasts, and healthy meal reminders to athletes.
        </p>
      </div>

      {/* Broadcast Form */}
      <form onSubmit={handleBroadcast} className="bg-[#111111] border border-white/5 p-5 rounded-3xl space-y-3.5 shadow-2xl">
        <div className="flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-[#D9FF00]" />
          <h2 className="text-xs font-bold text-white uppercase tracking-wider">
            Broadcast Global Message
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-white/60 block mb-1">Headline / Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Summer Shred Challenge Live Now!"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D9FF00]"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-bold text-white/60 block mb-1">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full bg-[#181818] border border-white/10 rounded-xl px-2.5 py-2 text-xs text-white font-bold focus:outline-none focus:border-[#D9FF00]"
              >
                <option value="announcement">Announcement</option>
                <option value="workout">Workout</option>
                <option value="nutrition">Nutrition</option>
                <option value="reminder">Reminder</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-white/60 block mb-1">Target Audience</label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value as any)}
                className="w-full bg-[#181818] border border-white/10 rounded-xl px-2.5 py-2 text-xs text-white font-bold focus:outline-none focus:border-[#D9FF00]"
              >
                <option value="all">Everyone</option>
                <option value="user">Athletes Only</option>
                <option value="admin">Admins Only</option>
              </select>
            </div>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-white/60 block mb-1">Notification Body</label>
          <textarea
            rows={3}
            required
            placeholder="Write your push notification message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full bg-[#181818] border border-white/10 rounded-2xl p-3 text-xs text-white focus:outline-none focus:border-[#D9FF00] resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#D9FF00] hover:bg-[#D9FF00]/90 text-black text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(217,255,0,0.3)] transition-all"
        >
          <Send className="w-4 h-4" />
          <span>{isLoading ? 'Broadcasting...' : 'Broadcast to Athletes'}</span>
        </button>
      </form>

      {/* Broadcast History */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-white uppercase tracking-wider">
          Broadcast History ({notifications.length})
        </h2>

        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n._id}
              className="p-3.5 rounded-2xl bg-[#111111] border border-white/5 flex items-start justify-between gap-3"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-[#D9FF00]/10 text-[#D9FF00] mt-0.5">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white">{n.title}</h4>
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-white/5 text-white/60">
                      {n.type}
                    </span>
                  </div>
                  <p className="text-xs text-white/50 mt-0.5">{n.message}</p>
                  <span className="text-[10px] text-white/30 block mt-1 font-mono">
                    {new Date(n.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleDelete(n._id)}
                className="p-2 text-white/30 hover:text-red-400 hover:bg-white/5 rounded-xl transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

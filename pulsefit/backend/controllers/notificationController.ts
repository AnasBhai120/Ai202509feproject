import { Request, Response } from 'express';
import { memoryStore, generateId, isMongoConnected } from '../services/dataStore.js';
import { NotificationModel } from '../models/Notification.js';
import { AuthRequest } from '../middleware/auth.js';

// @route   GET /api/notifications
// @desc    Get user notifications + global announcements
export const getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role || 'user';

    const notifications = memoryStore.notifications.filter((n) => {
      if (!n.userId) {
        // Broadcast
        return n.targetRole === 'all' || n.targetRole === userRole;
      }
      return n.userId === userId;
    });

    notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    res.json({
      success: true,
      data: {
        total: notifications.length,
        unreadCount,
        notifications,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   PATCH /api/notifications/:id/read
// @desc    Mark single notification as read
export const markAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const notif = memoryStore.notifications.find((n) => n._id.toString() === id);

    if (notif) {
      notif.isRead = true;
      if (isMongoConnected()) {
        await NotificationModel.findByIdAndUpdate(id, { isRead: true });
      }
    }

    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   PATCH /api/notifications/read-all
// @desc    Mark all user notifications as read
export const markAllAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    memoryStore.notifications.forEach((n) => {
      if (!n.userId || n.userId === userId) {
        n.isRead = true;
      }
    });

    if (isMongoConnected()) {
      await NotificationModel.updateMany({ $or: [{ userId }, { userId: null }] }, { isRead: true });
    }

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   POST /api/notifications
// @desc    Admin: Create notification / broadcast announcement
export const createNotification = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, message, type, targetRole, userId } = req.body;

    if (!title || !message) {
      res.status(400).json({ success: false, message: 'Title and message are required' });
      return;
    }

    const newNotif = {
      _id: generateId(),
      userId: userId || null,
      title: title.trim(),
      message: message.trim(),
      type: type || 'announcement',
      targetRole: targetRole || 'all',
      isRead: false,
      createdAt: new Date(),
    };

    if (isMongoConnected()) {
      try {
        await NotificationModel.create(newNotif);
      } catch (err) {
        console.warn('Mongo insert notif fallback:', err);
      }
    }
    memoryStore.notifications.unshift(newNotif);

    res.status(201).json({
      success: true,
      message: 'Notification / Announcement created successfully',
      data: { notification: newNotif },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   DELETE /api/notifications/clear-all
// @desc    Clear all notifications for current user (or all if admin)
export const clearAllNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role || 'user';

    if (userRole === 'admin') {
      memoryStore.notifications = [];
      if (isMongoConnected()) {
        await NotificationModel.deleteMany({});
      }
    } else {
      memoryStore.notifications = memoryStore.notifications.filter((n) => {
        if (!n.userId) {
          return false;
        }
        return n.userId !== userId;
      });
      if (isMongoConnected()) {
        await NotificationModel.deleteMany({ $or: [{ userId }, { userId: null }] });
      }
    }

    res.json({ success: true, message: 'All notifications and bulletins cleared successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   DELETE /api/notifications/:id
// @desc    Delete/Dismiss single notification
export const deleteNotification = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const index = memoryStore.notifications.findIndex((n) => n._id.toString() === id);

    if (index === -1) {
      res.status(404).json({ success: false, message: 'Notification not found' });
      return;
    }

    memoryStore.notifications.splice(index, 1);

    if (isMongoConnected()) {
      await NotificationModel.findByIdAndDelete(id);
    }

    res.json({ success: true, message: 'Notification dismissed successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

import { Response } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { notificationService } from '../services/notificationService.js';

export const notificationController = {
  async getNotifications(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const notifications = await notificationService.getUserNotifications(userId);
      res.json({ success: true, count: notifications.length, notifications });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async markAsRead(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const success = await notificationService.markAsRead(id, userId);
      res.json({ success, message: success ? 'Marked as read' : 'Notification not found' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async markAllAsRead(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      await notificationService.markAllAsRead(userId);
      res.json({ success: true, message: 'All notifications marked as read' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
};


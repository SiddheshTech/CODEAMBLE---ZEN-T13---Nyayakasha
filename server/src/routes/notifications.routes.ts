import { Router, Request, Response } from 'express';
import { primaryStore, NotificationRecord } from '../db/store.js';
import { notificationService } from '../services/notification.service.js';

export const notificationsRouter = Router();

/**
 * GET /api/notifications
 * Get real-time notifications for the current user/role
 */
notificationsRouter.get('/', (req: Request, res: Response) => {
  try {
    primaryStore.loadFromDisk();
    const role = (req.query.role as string) || (req.headers['x-user-role'] as string) || 'all';
    const list = primaryStore.getNotifications(role);
    const unreadCount = list.filter(n => !n.isRead).length;

    return res.json({
      success: true,
      count: list.length,
      unreadCount,
      notifications: list
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'SERVER_ERROR', message: err.message });
  }
});

/**
 * POST /api/notifications/:id/read
 * Mark a notification as read
 */
notificationsRouter.post('/:id/read', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated = primaryStore.markNotificationRead(id);
    if (!updated) {
      return res.status(404).json({ error: 'NOT_FOUND', message: `Notification #${id} not found.` });
    }
    return res.json({ success: true, notification: updated });
  } catch (err: any) {
    return res.status(500).json({ error: 'SERVER_ERROR', message: err.message });
  }
});

/**
 * POST /api/notifications/read-all
 * Mark all notifications as read for a role
 */
notificationsRouter.post('/read-all', (req: Request, res: Response) => {
  try {
    const role = req.body?.role || (req.query.role as string);
    primaryStore.markAllNotificationsRead(role);
    const list = primaryStore.getNotifications(role);
    return res.json({ success: true, message: 'All notifications marked as read', notifications: list });
  } catch (err: any) {
    return res.status(500).json({ error: 'SERVER_ERROR', message: err.message });
  }
});

/**
 * POST /api/notifications/register-device
 * Register FCM push device token
 */
notificationsRouter.post('/register-device', (req: Request, res: Response) => {
  try {
    const { userId, deviceToken } = req.body;
    if (userId && deviceToken) {
      primaryStore.registerDeviceToken(userId, deviceToken);
    }
    return res.json({ success: true, message: 'Device token registered successfully' });
  } catch (err: any) {
    return res.status(500).json({ error: 'SERVER_ERROR', message: err.message });
  }
});
/**
 * POST /api/notifications/send-test-email
 * Test sending email with real SMTP credentials
 */
notificationsRouter.post('/send-test-email', async (req: Request, res: Response) => {
  try {
    const { recipient, subject, body } = req.body;
    const targetEmail = recipient || process.env.SMTP_USER || 'guptasargam954@gmail.com';
    const emailSubject = subject || 'Nyayakasha Security System - SMTP Verification Test';
    const emailBody = body || 'Your updated Gmail App Password SMTP configuration is active and verified!';

    const sent = await notificationService.sendEmail(targetEmail, emailSubject, emailBody);
    if (sent) {
      return res.json({ success: true, message: `Email successfully dispatched to ${targetEmail}` });
    } else {
      return res.status(500).json({ success: false, message: `Failed sending email to ${targetEmail}. Check server credentials for SMTP_USER/GMAIL_USER and GMAIL_APP_PASS.` });
    }
  } catch (err: any) {
    return res.status(500).json({ error: 'SERVER_ERROR', message: err.message });
  }
});

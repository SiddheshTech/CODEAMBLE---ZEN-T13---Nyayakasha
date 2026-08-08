import { Router } from 'express';
import { primaryStore } from '../db/store.js';
export const notificationsRouter = Router();
/**
 * GET /api/notifications
 * Get real-time notifications for the current user/role
 */
notificationsRouter.get('/', (req, res) => {
    try {
        primaryStore.loadFromDisk();
        const role = req.query.role || req.headers['x-user-role'] || 'all';
        const list = primaryStore.getNotifications(role);
        const unreadCount = list.filter(n => !n.isRead).length;
        return res.json({
            success: true,
            count: list.length,
            unreadCount,
            notifications: list
        });
    }
    catch (err) {
        return res.status(500).json({ error: 'SERVER_ERROR', message: err.message });
    }
});
/**
 * POST /api/notifications/:id/read
 * Mark a notification as read
 */
notificationsRouter.post('/:id/read', (req, res) => {
    try {
        const { id } = req.params;
        const updated = primaryStore.markNotificationRead(id);
        if (!updated) {
            return res.status(404).json({ error: 'NOT_FOUND', message: `Notification #${id} not found.` });
        }
        return res.json({ success: true, notification: updated });
    }
    catch (err) {
        return res.status(500).json({ error: 'SERVER_ERROR', message: err.message });
    }
});
/**
 * POST /api/notifications/read-all
 * Mark all notifications as read for a role
 */
notificationsRouter.post('/read-all', (req, res) => {
    try {
        const role = req.body?.role || req.query.role;
        primaryStore.markAllNotificationsRead(role);
        const list = primaryStore.getNotifications(role);
        return res.json({ success: true, message: 'All notifications marked as read', notifications: list });
    }
    catch (err) {
        return res.status(500).json({ error: 'SERVER_ERROR', message: err.message });
    }
});
/**
 * POST /api/notifications/register-device
 * Register FCM push device token
 */
notificationsRouter.post('/register-device', (req, res) => {
    try {
        const { userId, deviceToken } = req.body;
        if (userId && deviceToken) {
            primaryStore.registerDeviceToken(userId, deviceToken);
        }
        return res.json({ success: true, message: 'Device token registered successfully' });
    }
    catch (err) {
        return res.status(500).json({ error: 'SERVER_ERROR', message: err.message });
    }
});

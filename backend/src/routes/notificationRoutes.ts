import express, { Router } from 'express';
import { authMiddleware } from '../middleware/requireAuth';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadCount
} from '../controllers/notificationController';

const router: Router = express.Router();

// All notification routes require authentication
router.use(authMiddleware);

// Get unread notification count (must be before :id routes)
router.get('/unread-count', getUnreadCount);

// Mark all notifications as read (must be before :id routes)
router.patch('/read-all', markAllNotificationsAsRead);

// Get all notifications for the user
router.get('/', getNotifications);

// Mark a specific notification as read
router.patch('/:id/read', markNotificationAsRead);

export default router;

import { Request, Response } from 'express';
import { getDatabase } from '../models/database';

interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    name: string;
  };
}

export async function getNotifications(req: AuthRequest, res: Response) {
  try {
    const db = getDatabase();
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Get all notifications for the user, sorted by latest first
    const notifications = await db.all(
      `SELECT * FROM notifications 
       WHERE user_id = ? 
       ORDER BY created_at DESC`,
      [userId]
    );

    // Count unread notifications
    const unreadCount = await db.get(
      `SELECT COUNT(*) as count FROM notifications 
       WHERE user_id = ? AND is_read = false`,
      [userId]
    );

    return res.status(200).json({
      message: 'Notifications retrieved successfully',
      notifications: notifications || [],
      unreadCount: unreadCount?.count || 0
    });
  } catch (error) {
    console.error('Error retrieving notifications:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function markNotificationAsRead(req: AuthRequest, res: Response) {
  try {
    const db = getDatabase();
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Get notification and verify it belongs to user
    const notification = await db.get(
      'SELECT * FROM notifications WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Mark as read
    await db.run(
      'UPDATE notifications SET is_read = true WHERE id = ?',
      [id]
    );

    const updated = await db.get(
      'SELECT * FROM notifications WHERE id = ?',
      [id]
    );

    return res.status(200).json({
      message: 'Notification marked as read',
      notification: updated
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function markAllNotificationsAsRead(req: AuthRequest, res: Response) {
  try {
    const db = getDatabase();
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Mark all unread notifications as read
    await db.run(
      'UPDATE notifications SET is_read = true WHERE user_id = ? AND is_read = false',
      [userId]
    );

    // Get updated notifications
    const notifications = await db.all(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );

    return res.status(200).json({
      message: 'All notifications marked as read',
      notifications: notifications || []
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function getUnreadCount(req: AuthRequest, res: Response) {
  try {
    const db = getDatabase();
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const result = await db.get(
      `SELECT COUNT(*) as count FROM notifications 
       WHERE user_id = ? AND is_read = false`,
      [userId]
    );

    return res.status(200).json({
      unreadCount: result?.count || 0
    });
  } catch (error) {
    console.error('Error retrieving unread count:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

// Internal function to create a notification (called by other controllers)
export async function createNotification(
  userId: number,
  agreementId: number,
  type: 'sent' | 'signed' | 'rejected' | 'pdf_ready',
  title: string,
  message: string
): Promise<void> {
  try {
    const db = getDatabase();
    await db.run(
      `INSERT INTO notifications (user_id, agreement_id, type, title, message, is_read)
       VALUES (?, ?, ?, ?, ?, false)`,
      [userId, agreementId, type, title, message]
    );
    console.log(`✅ Notification created: ${type} for user ${userId}`);
  } catch (error) {
    console.error('Error creating notification:', error);
  }
}

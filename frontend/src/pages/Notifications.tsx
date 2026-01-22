import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCircle, XCircle, Send, FileText, ArrowLeft } from 'lucide-react';
import '../styles/Notifications.css';

interface Notification {
  id: number;
  agreement_id: number;
  type: 'sent' | 'signed' | 'rejected' | 'pdf_ready';
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

const NotificationsPage: React.FC = () => {
  const { token, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      navigate('/login');
      return;
    }

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [isAuthenticated, token, navigate]);

  const fetchNotifications = async () => {
    try {
      console.log('Fetching notifications with token:', token?.substring(0, 20) + '...');
      
      const response = await fetch('http://localhost:5000/api/notifications', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Notifications response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 100)}`);
      }

      const data = await response.json();
      console.log('Notifications data:', data);
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
      setError(null);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err instanceof Error ? err.message : 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      const response = await fetch(`http://localhost:5000/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }

      // Update local state
      setNotifications(notifications.map(n =>
        n.id === notificationId ? { ...n, is_read: true } : n
      ));
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/notifications/read-all', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to mark all as read');
      }

      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      handleMarkAsRead(notification.id);
    }

    // Navigate based on notification type
    switch (notification.type) {
      case 'sent':
      case 'rejected':
        navigate(`/agreements/${notification.agreement_id}`);
        break;
      case 'signed':
      case 'pdf_ready':
        navigate('/documents');
        break;
      default:
        break;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'sent':
        return <Send size={20} className="icon-send" />;
      case 'signed':
        return <CheckCircle size={20} className="icon-signed" />;
      case 'rejected':
        return <XCircle size={20} className="icon-rejected" />;
      case 'pdf_ready':
        return <FileText size={20} className="icon-pdf" />;
      default:
        return <Bell size={20} />;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const goBack = () => {
    navigate('/dashboard');
  };

  return (
    <div className="notifications-page">
      <div className="notifications-container">
        {/* Header */}
        <div className="notifications-header">
          <button className="back-button" onClick={goBack} title="Go back">
            <ArrowLeft size={24} />
          </button>
          <div className="header-content">
            <h1>🔔 Notifications</h1>
            <p>{unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All notifications marked as read'}</p>
          </div>
          {unreadCount > 0 && (
            <button className="mark-all-button" onClick={handleMarkAllAsRead}>
              Mark all as read
            </button>
          )}
        </div>

        {/* Content */}
        <div className="notifications-content">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading notifications...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <p>{error}</p>
              <button onClick={fetchNotifications} className="retry-button">
                Retry
              </button>
            </div>
          ) : notifications.length === 0 ? (
            <div className="empty-state">
              <Bell size={64} />
              <h2>No Notifications</h2>
              <p>You're all caught up! Check back later for updates.</p>
            </div>
          ) : (
            <div className="notifications-list">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-item ${notification.is_read ? 'read' : 'unread'}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-icon">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="notification-content">
                    <h3 className="notification-title">{notification.title}</h3>
                    <p className="notification-message">{notification.message}</p>
                    <span className="notification-time">
                      {formatTime(notification.created_at)}
                    </span>
                  </div>
                  {!notification.is_read && (
                    <div className="unread-indicator"></div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;

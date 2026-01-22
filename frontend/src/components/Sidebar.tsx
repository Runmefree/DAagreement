import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  LayoutDashboard,
  FileText,
  Bell,
  User,
  Settings,
  HelpCircle,
  LogOut,
  ChevronLeft
} from 'lucide-react';
import '../styles/Sidebar.css';

interface SidebarProps {
  onLogout?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, token } = useAuth();
  
  const [isExpanded, setIsExpanded] = useState(() => {
    const saved = localStorage.getItem('sidebarExpanded');
    return saved !== null ? JSON.parse(saved) : false;
  });
  
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  // Fetch unread count on mount and refresh
  useEffect(() => {
    if (token) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 10000); // Refresh every 10 seconds
      return () => clearInterval(interval);
    }
  }, [token]);

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/notifications/unread-count`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUnreadNotifications(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  // Save sidebar state to localStorage
  useEffect(() => {
    localStorage.setItem('sidebarExpanded', JSON.stringify(isExpanded));
  }, [isExpanded]);

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    logout();
    if (onLogout) {
      onLogout();
    }
    navigate('/');
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard',
      badge: null
    },
    {
      id: 'documents',
      label: 'Documents',
      icon: FileText,
      path: '/documents',
      badge: null
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      path: '/notifications',
      badge: unreadNotifications > 0 ? unreadNotifications : null
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      path: '/profile',
      badge: null
    }
  ];

  const systemActions = [
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      path: '/settings'
    },
    {
      id: 'support',
      label: 'Support',
      icon: HelpCircle,
      path: '/support'
    }
  ];

  return (
    <>
      <div className={`sidebar ${isExpanded ? 'expanded' : 'collapsed'}`}>
        {/* Logo / Toggle Button */}
        <div className="sidebar-logo">
          <button
            className="logo-button"
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            <div className="logo-icon-wrapper">
              <Shield size={28} className="shield-icon" />
            </div>
            {isExpanded && (
              <div className="logo-text-wrapper">
                <span className="logo-main">Digital Consent</span>
                <span className="logo-sub">Agreement Tracker</span>
              </div>
            )}
          </button>
          {isExpanded && (
            <button
              className="collapse-button"
              onClick={toggleSidebar}
              aria-label="Close sidebar"
            >
              <ChevronLeft size={20} />
            </button>
          )}
        </div>

        {/* Primary Navigation */}
        <nav className="sidebar-nav-primary">
          <ul>
            {navItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <li key={item.id}>
                  <button
                    className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                    onClick={() => handleNavigation(item.path)}
                    title={!isExpanded ? item.label : ''}
                    aria-label={item.label}
                    aria-current={isActive(item.path) ? 'page' : undefined}
                  >
                    <span className="nav-icon">
                      <IconComponent size={22} />
                      {item.badge !== null && (
                        <span className="badge">{item.badge}</span>
                      )}
                    </span>
                    {isExpanded && (
                      <span className="nav-label">{item.label}</span>
                    )}
                  </button>
                  {!isExpanded && <div className="tooltip">{item.label}</div>}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Divider / Spacer */}
        <div className="sidebar-divider"></div>

        {/* System Actions */}
        <nav className="sidebar-nav-system">
          <ul>
            {systemActions.map((item) => {
              const IconComponent = item.icon;
              return (
                <li key={item.id}>
                  <button
                    className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                    onClick={() => handleNavigation(item.path)}
                    title={!isExpanded ? item.label : ''}
                    aria-label={item.label}
                    aria-current={isActive(item.path) ? 'page' : undefined}
                  >
                    <span className="nav-icon">
                      <IconComponent size={22} />
                    </span>
                    {isExpanded && (
                      <span className="nav-label">{item.label}</span>
                    )}
                  </button>
                  {!isExpanded && <div className="tooltip">{item.label}</div>}
                </li>
              );
            })}

            {/* Logout */}
            <li>
              <button
                className="nav-item logout"
                onClick={handleLogoutClick}
                title={!isExpanded ? 'Logout' : ''}
                aria-label="Logout"
              >
                <span className="nav-icon">
                  <LogOut size={22} />
                </span>
                {isExpanded && (
                  <span className="nav-label">Logout</span>
                )}
              </button>
              {!isExpanded && <div className="tooltip">Logout</div>}
            </li>
          </ul>
        </nav>

        {/* User Avatar / Profile Button (Bottom Pinned) */}
        {user && (
          <div className="sidebar-avatar">
            <button
              className="avatar-button"
              onClick={() => handleNavigation('/profile')}
              title={user.name}
              aria-label="User profile"
            >
              <div className="avatar-circle">
                {user.name.charAt(0).toUpperCase()}{user.name.split(' ')[1]?.charAt(0).toUpperCase() || ''}
              </div>
              <div className="status-indicator"></div>
              {isExpanded && (
                <div className="avatar-info">
                  <p className="avatar-name">{user.name}</p>
                  <p className="avatar-email">{user.email}</p>
                </div>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="modal-overlay" onClick={cancelLogout}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Confirm Logout</h3>
            <p>Are you sure you want to logout?</p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={cancelLogout}>
                Cancel
              </button>
              <button className="btn-logout" onClick={confirmLogout}>
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;

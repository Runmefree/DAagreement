import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import '../styles/Dashboard.css';

interface Agreement {
  id: number;
  agreement_type: string;
  recipient_name: string;
  status: string;
  created_at: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [menuOpen, setMenuOpen] = useState<number | null>(null);

  useEffect(() => {
    if (user) {
      fetchAgreements();
    }
  }, [user]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const fetchAgreements = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/agreements`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch agreements');
      }

      const data = await response.json();
      setAgreements(data.agreements || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load agreements');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleCreateAgreement = () => {
    navigate('/create-agreement');
  };

  const handleViewAgreement = (id: number) => {
    navigate(`/agreements/${id}`);
  };

  const handleSendAgreement = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/agreements/${id}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to send agreement');
      }

      // Update local state
      setAgreements(agreements.map(a => 
        a.id === id ? { ...a, status: 'pending' } : a
      ));
      setMenuOpen(null);
      setSuccess('Agreement sent successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send agreement');
    }
  };

  const handleDeleteAgreement = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this agreement?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/agreements/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete agreement');
      }

      setAgreements(agreements.filter(a => a.id !== id));
      setMenuOpen(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete agreement');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'draft':
        return 'status-draft';
      case 'sent':
        return 'status-sent';
      case 'signed':
        return 'status-signed';
      default:
        return 'status-default';
    }
  };

  if (!user) {
    return (
      <div className="dashboard-container">
        <p>Please log in first</p>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar onLogout={handleLogout} />
      <div className="dashboard-container">
        <div className="dashboard-nav">
          <h2>Dashboard</h2>
          <div className="nav-buttons">
            <button className="btn btn-create" onClick={handleCreateAgreement}>
              Create Agreement
            </button>
          </div>
        </div>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      <div className="dashboard-content">
        <div className="welcome-card">
          <h1>Welcome, {user.name}!</h1>
          <div className="user-info">
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>User ID:</strong> {user.id}</p>
          </div>
        </div>

        <div className="agreements-section">
          <div className="section-header">
            <h2>Your Agreements</h2>
            <button className="btn btn-primary-large" onClick={handleCreateAgreement}>
              + New Agreement
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}

          {isLoading ? (
            <div className="loading">Loading agreements...</div>
          ) : agreements.length === 0 ? (
            <div className="empty-state">
              <p>No agreements yet</p>
              <p className="empty-text">Create your first agreement to get started</p>
              <button className="btn btn-primary" onClick={handleCreateAgreement}>
                Create Agreement
              </button>
            </div>
          ) : (
            <div className="agreements-table">
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Party (Recipient)</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {agreements.map(agreement => (
                    <tr key={agreement.id}>
                      <td className="title-cell">{agreement.agreement_type}</td>
                      <td>{agreement.recipient_name}</td>
                      <td>
                        <span className={`status-badge ${getStatusClass(agreement.status)}`}>
                          {agreement.status.charAt(0).toUpperCase() + agreement.status.slice(1)}
                        </span>
                      </td>
                      <td>{formatDate(agreement.created_at)}</td>
                      <td className="actions-cell">
                        <div className="actions-group">
                          <button 
                            className="action-btn view-btn"
                            onClick={() => handleViewAgreement(agreement.id)}
                            title="View agreement"
                          >
                            View
                          </button>
                          {agreement.status === 'draft' && (
                            <button 
                              className="action-btn send-btn"
                              onClick={() => handleSendAgreement(agreement.id)}
                              title="Send agreement"
                            >
                              Send
                            </button>
                          )}
                          <div className="menu-container">
                            <button 
                              className="action-btn menu-btn"
                              onClick={() => setMenuOpen(menuOpen === agreement.id ? null : agreement.id)}
                              title="More options"
                            >
                              ⋮
                            </button>
                            {menuOpen === agreement.id && (
                              <div className="dropdown-menu">
                                <button 
                                  className="menu-item"
                                  onClick={() => {
                                    const link = `${window.location.origin}/agreements/${agreement.id}`;
                                    navigator.clipboard.writeText(link);
                                    alert('Link copied to clipboard');
                                    setMenuOpen(null);
                                  }}
                                >
                                  Copy Link
                                </button>
                                <button 
                                  className="menu-item delete"
                                  onClick={() => handleDeleteAgreement(agreement.id)}
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
};

export default Dashboard;

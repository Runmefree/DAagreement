import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/ViewAgreement.css';

interface Agreement {
  id: number;
  agreement_type: string;
  start_date: string;
  end_date: string;
  terms_conditions: string;
  payment_amount: number;
  jurisdiction: string;
  recipient_name: string;
  recipient_email: string;
  status: string;
  creator_id: number;
  created_at: string;
  updated_at: string;
}

const ViewAgreement: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [agreement, setAgreement] = useState<Agreement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchAgreement();
  }, [id]);

  const fetchAgreement = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/agreements/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          setError('Agreement not found');
        } else if (response.status === 403) {
          setError('You do not have permission to view this agreement');
        } else {
          setError('Failed to load agreement');
        }
        return;
      }

      const data = await response.json();
      
      // Check if user is the creator
      if (data.agreement.creator_id !== parseInt(user?.id || '0')) {
        setError('You do not have permission to view this agreement');
        return;
      }

      setAgreement(data.agreement);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load agreement');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendAgreement = async () => {
    if (!agreement) return;
    
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/agreements/${agreement.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: 'sent'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send agreement');
      }

      const data = await response.json();
      setAgreement(data.agreement);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send agreement');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteAgreement = async () => {
    if (!agreement || !window.confirm('Are you sure you want to delete this agreement?')) return;
    
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/agreements/${agreement.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete agreement');
      }

      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete agreement');
      setActionLoading(false);
    }
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/agreements/${agreement?.id}`;
    navigator.clipboard.writeText(link);
    alert('Agreement link copied to clipboard');
  };

  if (isLoading) {
    return (
      <div className="view-agreement-container">
        <div className="loading">Loading agreement...</div>
      </div>
    );
  }

  if (error || !agreement) {
    return (
      <div className="view-agreement-container">
        <div className="error-message">{error || 'Agreement not found'}</div>
        <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadgeClass = (status: string) => {
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

  return (
    <div className="view-agreement-container">
      <div className="view-agreement-wrapper">
        <div className="agreement-header">
          <div className="header-title">
            <h1>{agreement.agreement_type}</h1>
            <span className={`status-badge ${getStatusBadgeClass(agreement.status)}`}>
              {agreement.status.charAt(0).toUpperCase() + agreement.status.slice(1)}
            </span>
          </div>
          <div className="header-actions">
            <button 
              className="btn btn-secondary"
              onClick={() => navigate('/dashboard')}
            >
              Back to Dashboard
            </button>
            {agreement.status === 'draft' && (
              <button 
                className="btn btn-primary"
                onClick={handleSendAgreement}
                disabled={actionLoading}
              >
                {actionLoading ? 'Sending...' : 'Send Agreement'}
              </button>
            )}
          </div>
        </div>

        <div className="agreement-details">
          <div className="detail-section">
            <h2>Agreement Information</h2>
            <div className="detail-grid">
              <div className="detail-item">
                <label>Reference ID</label>
                <p>#{agreement.id}</p>
              </div>
              <div className="detail-item">
                <label>Status</label>
                <p className={`status-text ${getStatusBadgeClass(agreement.status)}`}>
                  {agreement.status.charAt(0).toUpperCase() + agreement.status.slice(1)}
                </p>
              </div>
              <div className="detail-item">
                <label>Agreement Type</label>
                <p>{agreement.agreement_type}</p>
              </div>
              <div className="detail-item">
                <label>Jurisdiction</label>
                <p>{agreement.jurisdiction}</p>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h2>Parties</h2>
            <div className="detail-grid">
              <div className="detail-item">
                <label>Recipient Name</label>
                <p>{agreement.recipient_name}</p>
              </div>
              <div className="detail-item">
                <label>Recipient Email</label>
                <p>{agreement.recipient_email}</p>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h2>Dates</h2>
            <div className="detail-grid">
              <div className="detail-item">
                <label>Start Date</label>
                <p>{formatDate(agreement.start_date)}</p>
              </div>
              <div className="detail-item">
                <label>End Date</label>
                <p>{formatDate(agreement.end_date)}</p>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h2>Financial Terms</h2>
            <div className="detail-item">
              <label>Payment Amount</label>
              <p className="amount">${parseFloat(agreement.payment_amount.toString()).toFixed(2)}</p>
            </div>
          </div>

          <div className="detail-section">
            <h2>Terms & Conditions</h2>
            <div className="terms-box">
              {agreement.terms_conditions}
            </div>
          </div>

          <div className="detail-section">
            <h2>Audit Trail</h2>
            <div className="audit-trail">
              <div className="audit-item">
                <div className="audit-icon">✓</div>
                <div className="audit-content">
                  <p className="audit-action">Agreement Created</p>
                  <p className="audit-date">{formatDate(agreement.created_at)}</p>
                </div>
              </div>
              {agreement.status !== 'draft' && (
                <div className="audit-item">
                  <div className="audit-icon">→</div>
                  <div className="audit-content">
                    <p className="audit-action">Agreement Sent</p>
                    <p className="audit-date">{formatDate(agreement.updated_at)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="agreement-footer">
          <button 
            className="btn btn-secondary"
            onClick={handleCopyLink}
          >
            Copy Agreement Link
          </button>
          <button 
            className="btn btn-danger"
            onClick={handleDeleteAgreement}
            disabled={actionLoading}
          >
            {actionLoading ? 'Deleting...' : 'Delete Agreement'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewAgreement;

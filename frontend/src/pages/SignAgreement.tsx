import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SignatureInput from '../components/SignatureInput';
import '../styles/SignAgreement.css';

interface Agreement {
  id: number;
  agreement_type: string;
  terms_conditions: string;
  payment_amount: string;
  jurisdiction: string;
  recipient_name: string;
  status: string;
  created_at: string;
}

export const SignAgreement: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [agreement, setAgreement] = useState<Agreement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    signer_name: '',
    signature_type: 'typed',
    signature_data: '',
    agreement_confirmed: false,
    rejection_reason: ''
  });

  const [showRejectForm, setShowRejectForm] = useState(false);

  // Fetch agreement data
  useEffect(() => {
    const fetchAgreement = async () => {
      try {
        setLoading(true);
        console.log(`Fetching agreement for signing: ${id}`);
        const apiUrl = import.meta.env.VITE_API_URL || 'https://dagreement.onrender.com';
        const response = await fetch(`${apiUrl}/api/agreements/sign/${id}`);

        if (!response.ok) {
          throw new Error('Failed to load agreement');
        }

        const data = await response.json();
        console.log('Agreement data received:', data.agreement);
        console.log('Agreement status:', data.agreement?.status);
        setAgreement(data.agreement);
        setError('');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load agreement');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAgreement();
    }
  }, [id]);

  const handleSignerNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, signer_name: e.target.value });
  };

  const handleSignatureTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({
      ...formData,
      signature_type: e.target.value,
      signature_data: ''
    });
  };

  const handleSignatureChange = (signatureData: string) => {
    setFormData({ ...formData, signature_data: signatureData });
  };

  const handleAgreementConfirmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, agreement_confirmed: e.target.checked });
  };

  const handleSignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.signer_name.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!formData.signature_data && formData.signature_type !== 'typed') {
      setError('Please provide a signature');
      return;
    }

    if (!formData.agreement_confirmed) {
      setError('Please confirm you agree to the terms');
      return;
    }

    // For typed signature, use the signer name
    const signatureData = formData.signature_type === 'typed' ? formData.signer_name : formData.signature_data;

    try {
      setSubmitting(true);
      setError('');

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/agreements/sign/${id}/sign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          signer_name: formData.signer_name,
          signature_type: formData.signature_type,
          signature_data: signatureData
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to sign agreement');
      }

      // Success - redirect to success page
      navigate('/agreement-signed-success', { state: { agreementId: id } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign agreement');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError('');

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/agreements/sign/${id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          rejection_reason: formData.rejection_reason
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to reject agreement');
      }

      // Success - redirect to rejection page
      navigate('/agreement-rejected-success', { state: { agreementId: id } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject agreement');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="sign-agreement-container">
        <div className="loading-spinner">
          <p>Loading agreement...</p>
        </div>
      </div>
    );
  }

  if (!agreement) {
    return (
      <div className="sign-agreement-container">
        <div className="error-container">
          <h2>Agreement Not Found</h2>
          <p>{error || 'The agreement you are looking for does not exist.'}</p>
          <button onClick={() => navigate('/')} className="btn-primary">
            Return Home
          </button>
        </div>
      </div>
    );
  }

  if (agreement.status !== 'pending' && agreement.status !== 'draft') {
    const messageMap: { [key: string]: string } = {
      'signed': 'Signature completed successfully. This agreement can no longer be edited or signed again.',
      'rejected': 'This agreement has been rejected.',
    };
    
    return (
      <div className="sign-agreement-container">
        <div className="error-container">
          <h2>Cannot Sign Agreement</h2>
          <p>{messageMap[agreement.status] || `This agreement is no longer pending. Current status: ${agreement.status}`}</p>
          <button onClick={() => navigate('/')} className="btn-primary">
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="sign-agreement-container">
      <div className="sign-agreement-card">
        {/* Header */}
        <div className="sign-header">
          <h1>Digital Agreement Signing</h1>
          <p className="agreement-reference">Ref ID: #{agreement.id}</p>
        </div>

        {/* Agreement Details */}
        <div className="agreement-details">
          <div className="detail-section">
            <h3>{agreement.agreement_type}</h3>
            <p className="agreement-date">Created: {new Date(agreement.created_at).toLocaleDateString()}</p>
          </div>

          <div className="detail-row">
            <div className="detail-item">
              <label>Recipient Name</label>
              <p>{agreement.recipient_name}</p>
            </div>
            <div className="detail-item">
              <label>Jurisdiction</label>
              <p>{agreement.jurisdiction}</p>
            </div>
          </div>

          {agreement.payment_amount && agreement.payment_amount !== 'N/A' && (
            <div className="detail-row">
              <div className="detail-item">
                <label>Payment Amount</label>
                <p>{agreement.payment_amount}</p>
              </div>
            </div>
          )}

          <div className="detail-item full-width">
            <label>Terms & Conditions</label>
            <div className="terms-text">
              {agreement.terms_conditions}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        {/* Tabs for Sign / Reject */}
        <div className="action-tabs">
          <button
            className={`tab-btn ${!showRejectForm ? 'active' : ''}`}
            onClick={() => setShowRejectForm(false)}
          >
            Sign Agreement
          </button>
          <button
            className={`tab-btn ${showRejectForm ? 'active' : ''}`}
            onClick={() => setShowRejectForm(true)}
          >
            Reject Agreement
          </button>
        </div>

        {!showRejectForm ? (
          /* Sign Form */
          <form onSubmit={handleSignSubmit} className="sign-form">
            <div className="form-group">
              <label htmlFor="signer-name">Your Name *</label>
              <input
                id="signer-name"
                type="text"
                value={formData.signer_name}
                onChange={handleSignerNameChange}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="signature-type">Signature Type *</label>
              <select
                id="signature-type"
                value={formData.signature_type}
                onChange={handleSignatureTypeChange}
              >
                <option value="typed">Typed Name</option>
                <option value="drawn">Draw Signature</option>
                <option value="uploaded">Upload Image</option>
              </select>
            </div>

            <SignatureInput
              signatureType={formData.signature_type}
              onSignatureChange={handleSignatureChange}
            />

            <div className="form-group checkbox-group">
              <input
                id="agreement-confirmed"
                type="checkbox"
                checked={formData.agreement_confirmed}
                onChange={handleAgreementConfirmChange}
              />
              <label htmlFor="agreement-confirmed">
                I have read and agree to all terms and conditions outlined in this agreement
              </label>
            </div>

            <button
              type="submit"
              className="btn-primary btn-large"
              disabled={submitting}
            >
              {submitting ? 'Signing Agreement...' : 'Sign Agreement'}
            </button>
          </form>
        ) : (
          /* Reject Form */
          <form onSubmit={handleRejectSubmit} className="reject-form">
            <div className="form-group">
              <label htmlFor="rejection-reason">Reason for Rejection (Optional)</label>
              <textarea
                id="rejection-reason"
                value={formData.rejection_reason}
                onChange={(e) => setFormData({ ...formData, rejection_reason: e.target.value })}
                placeholder="Please provide any feedback or reason for rejecting this agreement"
                rows={5}
              />
            </div>

            <p className="reject-warning">
              ⚠️ By rejecting this agreement, you acknowledge that you have reviewed it and choose not to sign it at this time.
            </p>

            <button
              type="submit"
              className="btn-danger btn-large"
              disabled={submitting}
            >
              {submitting ? 'Rejecting Agreement...' : 'Reject Agreement'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default SignAgreement;

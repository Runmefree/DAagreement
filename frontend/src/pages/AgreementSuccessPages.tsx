import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/SuccessPages.css';

export const AgreementSignedSuccess: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const agreementId = location.state?.agreementId;

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/');
    }, 8000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="success-container">
      <div className="success-card">
        <div className="success-icon">✓</div>
        <h1>Agreement Signed Successfully!</h1>
        <p className="success-message">
          Thank you for signing the agreement. A signed copy has been sent to both parties via email.
        </p>
        <div className="success-details">
          <p>
            <strong>Reference ID:</strong> #{agreementId}
          </p>
          <p>
            You can access your signed agreement from your email inbox or by logging into your dashboard.
          </p>
        </div>
        <button onClick={() => navigate('/')} className="btn-primary">
          Return to Home
        </button>
      </div>
    </div>
  );
};

export const AgreementRejectedSuccess: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const agreementId = location.state?.agreementId;

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/');
    }, 8000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="success-container reject">
      <div className="success-card">
        <div className="reject-icon">✗</div>
        <h1>Agreement Rejected</h1>
        <p className="success-message">
          The agreement has been rejected. The creator has been notified of your decision.
        </p>
        <div className="success-details">
          <p>
            <strong>Reference ID:</strong> #{agreementId}
          </p>
          <p>
            A notification email has been sent to the agreement creator.
          </p>
        </div>
        <button onClick={() => navigate('/')} className="btn-primary">
          Return to Home
        </button>
      </div>
    </div>
  );
};

export default AgreementSignedSuccess;

import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/SuccessPage.css';

const SignupSuccessPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="success-container">
      <div className="success-card">
        <div className="success-icon">✓</div>
        <h1>Signup Successful!</h1>
        <p>Your account has been created successfully.</p>
        
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/dashboard')}
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
};

export default SignupSuccessPage;

import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/SuccessPage.css';

const LoginFailurePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="failure-container">
      <div className="failure-card">
        <div className="failure-icon">✕</div>
        <h1>Login Failed</h1>
        <p>There was an issue logging in. Please try again.</p>
        
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/login')}
        >
          Back to Login
        </button>
      </div>
    </div>
  );
};

export default LoginFailurePage;

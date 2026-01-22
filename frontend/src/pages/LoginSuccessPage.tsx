import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/SuccessPage.css';

const LoginSuccessPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="success-container">
      <div className="success-card">
        <div className="success-icon">✓</div>
        <h1>Login Successful!</h1>
        <p>You have successfully logged in to your account.</p>
        
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

export default LoginSuccessPage;

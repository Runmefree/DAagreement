import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/LandingPage.css';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      <div className="landing-card">
        <h1>Welcome to Auth App</h1>
        <p>Secure authentication with email or Google</p>
        
        <div className="button-group">
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/login')}
          >
            Log In
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => navigate('/signup')}
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;

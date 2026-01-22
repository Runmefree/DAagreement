import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/SignupPage.css';

declare global {
  interface Window {
    google: any;
  }
}

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { signup, googleLogin, isLoading, error } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    // Initialize Google Sign-In button
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: '357095799558-j0sipl6qhovh51003ac47nfpimr6hgki.apps.googleusercontent.com',
        callback: handleGoogleSuccess
      });
      
      const googleButton = document.getElementById('google-button-signup');
      if (googleButton) {
        window.google.accounts.id.renderButton(googleButton, {
          theme: 'outline',
          size: 'large',
          width: '100%'
        });
      }
    }
  }, []);

  const handleGoogleSuccess = async (response: any) => {
    try {
      setLocalError('');
      if (response.credential) {
        await googleLogin(response.credential);
        navigate('/signup-success');
      }
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Google signup failed');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    
    if (!name.trim() || !email.trim() || !password.trim()) {
      setLocalError('Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }
    
    try {
      await signup(email, password, name);
      navigate('/signup-success');
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Signup failed');
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <h1>Sign Up</h1>
        
        {(error || localError) && (
          <div className="error-message">{error || localError}</div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        
        <div className="divider">or</div>
        
        <div id="google-button-signup"></div>
        
        <p className="login-link">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;

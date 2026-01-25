import React from 'react';
import Sidebar from '../components/Sidebar';
import { useNavigate } from 'react-router-dom';
import '../styles/ProtectedPage.css';

const Support: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="dashboard-layout">
      <Sidebar onLogout={() => navigate('/')} />
      <div className="dashboard-container">
        <div className="dashboard-nav">
          <h2>Support & Help</h2>
        </div>
        <div className="dashboard-content">
          <div className="page-placeholder">
            <h3>Help & Documentation</h3>
            <p>Support resources coming soon</p>
            
            <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
              <h4 style={{ marginBottom: '10px' }}>Share Your Feedback</h4>
              <p style={{ marginBottom: '15px', color: '#666' }}>
                We'd love to hear from you! Please share your feedback and suggestions to help us improve our service.
              </p>
              <a 
                href="https://forms.gle/AqG1eS4t4Vs6oAAp7" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{
                  display: 'inline-block',
                  padding: '10px 20px',
                  backgroundColor: '#667eea',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '5px',
                  fontWeight: '600',
                  transition: 'background-color 0.3s'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#5568d3')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#667eea')}
              >
                Submit Feedback
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;

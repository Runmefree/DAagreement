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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;

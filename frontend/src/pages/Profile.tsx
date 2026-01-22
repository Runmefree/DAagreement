import React from 'react';
import Sidebar from '../components/Sidebar';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/ProtectedPage.css';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="dashboard-layout">
      <Sidebar onLogout={() => navigate('/')} />
      <div className="dashboard-container">
        <div className="dashboard-nav">
          <h2>Profile</h2>
        </div>
        <div className="dashboard-content">
          <div className="page-placeholder">
            <h3>User Profile</h3>
            {user && (
              <div>
                <p><strong>Name:</strong> {user.name}</p>
                <p><strong>Email:</strong> {user.email}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

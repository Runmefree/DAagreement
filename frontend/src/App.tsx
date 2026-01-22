import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LandingPage from './pages/LandingPagePro';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import LoginSuccessPage from './pages/LoginSuccessPage';
import LoginFailurePage from './pages/LoginFailurePage';
import SignupSuccessPage from './pages/SignupSuccessPage';
import Dashboard from './pages/Dashboard';
import CreateAgreement from './pages/CreateAgreement';
import ViewAgreement from './pages/ViewAgreement';
import SignAgreement from './pages/SignAgreement';
import Documents from './pages/Documents';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Support from './pages/Support';
import { AgreementSignedSuccess, AgreementRejectedSuccess } from './pages/AgreementSuccessPages';
import './styles/global.css';

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login-success" element={<LoginSuccessPage />} />
          <Route path="/login-failure" element={<LoginFailurePage />} />
          <Route path="/signup-success" element={<SignupSuccessPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/agreements/:id" element={<ViewAgreement />} />
          <Route path="/create-agreement" element={<CreateAgreement />} />
          <Route path="/sign/:id" element={<SignAgreement />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/support" element={<Support />} />
          <Route path="/agreement-signed-success" element={<AgreementSignedSuccess />} />
          <Route path="/agreement-rejected-success" element={<AgreementRejectedSuccess />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;

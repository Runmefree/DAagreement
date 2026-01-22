import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/LandingPagePro.css';
import { FileText, CheckCircle, Shield, Clock, Lock, Bell } from 'lucide-react';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-pro">
      {/* Navigation Bar */}
      <nav className="navbar-pro">
        <div className="navbar-pro-container">
          <div className="navbar-pro-left">
            <div className="navbar-pro-logo">📋</div>
            <span className="navbar-pro-text">Digital Consent & Agreement Tracker</span>
          </div>
          <div className="navbar-pro-right">
            <button className="nav-pro-login" onClick={() => navigate('/login')}>Login</button>
            <button className="nav-pro-signup" onClick={() => navigate('/signup')}>Sign Up</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-pro">
        <div className="hero-pro-container">
          <div className="hero-pro-content">
            <h1 className="hero-pro-title">Create, Sign, and Track Agreements Digitally</h1>
            <p className="hero-pro-subtitle">A secure platform to manage digital consent, e-signatures, and legally traceable agreements — all in one place.</p>
            <div className="hero-pro-buttons">
              <button className="btn-pro-primary" onClick={() => navigate('/signup')}>Get Started</button>
              <button className="btn-pro-secondary" onClick={() => navigate('/login')}>Login</button>
            </div>
          </div>
          <div className="hero-pro-visual">
            <img src="/019ee5d0-1646-4cd8-a924-df0598fe0670.png" alt="Digital Signing on Tablet" className="hero-pro-image" />
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="trust-row-pro">
        <div className="trust-row-container">
          <div className="trust-item">
            <Shield size={32} className="trust-icon" />
            <span>Secure Digital Signatures</span>
          </div>
          <div className="trust-item">
            <FileText size={32} className="trust-icon" />
            <span>Legally Traceable Audit Logs</span>
          </div>
          <div className="trust-item">
            <Clock size={32} className="trust-icon" />
            <span>No Paperwork Required</span>
          </div>
          <div className="trust-item">
            <Lock size={32} className="trust-icon" />
            <span>System-Generated PDFs</span>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-pro">
        <div className="how-pro-container">
          <h2 className="section-pro-title">How It Works</h2>
          <div className="steps-pro-grid">
            <div className="step-pro-card">
              <div className="step-pro-number">1</div>
              <h3>Create an Agreement</h3>
              <p>Fill in agreement details and add recipients.</p>
            </div>
            <div className="step-pro-card">
              <div className="step-pro-number">2</div>
              <h3>Send & Sign Digitally</h3>
              <p>Recipients receive an email and sign securely.</p>
            </div>
            <div className="step-pro-card">
              <div className="step-pro-number">3</div>
              <h3>Track & Store</h3>
              <p>Signed PDFs are emailed and stored safely.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="features-pro">
        <div className="features-pro-container">
          <h2 className="section-pro-title">Powerful Features</h2>
          <div className="features-pro-grid">
            <div className="feature-pro-card">
              <FileText className="feature-pro-icon" />
              <h3>Agreement Creation</h3>
              <p>Easy-to-use forms to create custom agreements</p>
            </div>
            <div className="feature-pro-card">
              <CheckCircle className="feature-pro-icon" />
              <h3>Digital Signatures</h3>
              <p>Secure and legally binding e-signature capture</p>
            </div>
            <div className="feature-pro-card">
              <Bell className="feature-pro-icon" />
              <h3>Email Delivery</h3>
              <p>Automatic email notifications to all parties</p>
            </div>
            <div className="feature-pro-card">
              <FileText className="feature-pro-icon" />
              <h3>Signed PDF Records</h3>
              <p>Immutable PDF storage with full audit trail</p>
            </div>
            <div className="feature-pro-card">
              <Bell className="feature-pro-icon" />
              <h3>Real-Time Notifications</h3>
              <p>Instant updates on agreement status changes</p>
            </div>
            <div className="feature-pro-card">
              <Lock className="feature-pro-icon" />
              <h3>Secure Access Control</h3>
              <p>Role-based permissions and data encryption</p>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Trust */}
      <section className="security-pro">
        <div className="security-pro-container">
          <h2 className="section-pro-title">Built for Trust & Legal Traceability</h2>
          <div className="security-pro-list">
            <div className="security-pro-item">
              <div className="security-pro-check">✓</div>
              <span>IP address captured on signing</span>
            </div>
            <div className="security-pro-item">
              <div className="security-pro-check">✓</div>
              <span>Timestamped digital signatures</span>
            </div>
            <div className="security-pro-item">
              <div className="security-pro-check">✓</div>
              <span>Immutable signed PDFs</span>
            </div>
            <div className="security-pro-item">
              <div className="security-pro-check">✓</div>
              <span>Full audit trail per agreement</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-pro">
        <div className="cta-pro-container">
          <h2>Ready to manage agreements digitally?</h2>
          <button className="btn-pro-large" onClick={() => navigate('/signup')}>Create Your Free Account</button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer-pro">
        <div className="footer-pro-container">
          <div className="footer-pro-top">
            <div className="footer-pro-brand">
              <h3>📋 Digital Consent & Agreement Tracker</h3>
              <p>Secure platform for creating, signing, and tracking digital agreements with full legal traceability.</p>
            </div>
            <div className="footer-pro-links">
              <a onClick={() => navigate('/login')}>Login</a>
              <a onClick={() => navigate('/signup')}>Sign Up</a>
              <a href="#support">Support</a>
              <a href="#privacy">Privacy Policy</a>
              <a href="#terms">Terms of Service</a>
            </div>
          </div>
          <div className="footer-pro-bottom">
            <p>© 2026 Digital Consent & Agreement Tracker</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

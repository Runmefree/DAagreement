import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Download, Eye, FileText, ArrowLeft } from 'lucide-react';
import '../styles/Documents.css';

interface SignedDocument {
  id: number;
  title: string;
  agreement_type: string;
  recipient_name: string;
  recipient_email: string;
  signed_at: string;
  signed_pdf_url: string;
  creator_id: number;
}

const Documents: React.FC = () => {
  const { isAuthenticated, token } = useAuth();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<SignedDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If not authenticated and no token, redirect to login
    if (!isAuthenticated || !token) {
      navigate('/login');
      return;
    }

    fetchSignedDocuments();
  }, [isAuthenticated, token, navigate]);

  const fetchSignedDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!token) {
        setError('No authentication token found');
        return;
      }
      
      console.log('Fetching signed documents with token:', token.substring(0, 20) + '...');
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/agreements/documents/signed`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers.get('content-type'));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 100)}`);
      }

      const data = await response.json();
      console.log('Documents loaded:', data);
      setDocuments(data.agreements || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError(err instanceof Error ? err.message : 'Failed to load documents');
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewPDF = async (document: SignedDocument) => {
    // Fetch PDF from database and open in browser
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/agreements/pdf/${document.id}/signed`, {
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (err) {
      console.error('Error viewing PDF:', err);
      alert('Failed to view PDF');
    }
  };

  const handleDownloadPDF = async (document: SignedDocument) => {
    // Fetch PDF from database and download
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/agreements/pdf/${document.id}/signed`, {
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const fileName = `${document.title}.pdf`;
      const link = window.document.createElement('a');
      link.href = url;
      link.download = fileName;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading PDF:', err);
      alert('Failed to download PDF');
    }
  };

  const goBack = () => {
    navigate('/dashboard');
  };

  return (
    <div className="documents-page">
      <div className="documents-container">
        {/* Header */}
        <div className="documents-header">
          <button className="back-button" onClick={goBack} title="Go back">
            <ArrowLeft size={24} />
          </button>
          <div className="header-content">
            <h1>📄 Documents</h1>
            <p>Your signed agreements and documents</p>
          </div>
        </div>

        {/* Content */}
        <div className="documents-content">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading documents...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <p>{error}</p>
              <button onClick={fetchSignedDocuments} className="retry-button">
                Retry
              </button>
            </div>
          ) : documents.length === 0 ? (
            <div className="empty-state">
              <FileText size={64} />
              <h2>No Documents Yet</h2>
              <p>You don't have any signed documents yet.</p>
              <p style={{ fontSize: '12px', color: '#ccc', marginTop: '10px' }}>
                Documents appear here once agreements are signed.
              </p>
              <button onClick={() => navigate('/dashboard')} className="primary-button">
                Back to Dashboard
              </button>
            </div>
          ) : (
            <div className="documents-grid">
              {documents.map((document) => (
                <div key={document.id} className="document-card">
                  <div className="document-icon">
                    <FileText size={48} />
                  </div>
                  <div className="document-info">
                    <h3 className="document-title">{document.title}</h3>
                    <p className="document-type">{document.agreement_type}</p>
                    <p className="document-recipient">
                      Signed by: <strong>{document.recipient_name}</strong>
                    </p>
                    <p className="document-date">
                      Signed: {new Date(document.signed_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="document-actions">
                    <button
                      className="action-button view-button"
                      onClick={() => handleViewPDF(document)}
                      title="View PDF"
                    >
                      <Eye size={20} />
                      <span>View</span>
                    </button>
                    <button
                      className="action-button download-button"
                      onClick={() => handleDownloadPDF(document)}
                      title="Download PDF"
                    >
                      <Download size={20} />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Documents;

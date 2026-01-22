import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/CreateAgreement.css';

const agreementTypes = [
  'Leave and License Agreement',
  'Lease Agreement',
  'Tenancy Agreement',
  'Sub-Lease Agreement',
  'Commercial Lease Agreement',
  'PG / Hostel Agreement',
  'Service Agreement',
  'Employment Agreement',
  'Partnership Agreement',
  'Non-Disclosure Agreement (NDA)',
  'Vendor / Supplier Agreement',
  'Franchise Agreement',
  'Loan Agreement',
  'Sale Agreement',
  'Power of Attorney Agreement'
];



interface AgreementFormData {
  agreementType: string;
  agreementTitle: string;
  startDate: string;
  endDate: string;
  termsConditions: string;
  paymentAmount: string;
  jurisdiction: string;
  recipientName: string;
  recipientEmail: string;
  confirmation: boolean;
}

interface FormErrors {
  [key: string]: string;
}

const CreateAgreement: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState<AgreementFormData>({
    agreementType: '',
    agreementTitle: '',
    startDate: '',
    endDate: '',
    termsConditions: '',
    paymentAmount: '',
    jurisdiction: '',
    recipientName: '',
    recipientEmail: '',
    confirmation: false
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.agreementType) {
      newErrors.agreementType = 'Agreement type is required';
    }

    if (!formData.agreementTitle) {
      newErrors.agreementTitle = 'Agreement title is required';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      if (startDate >= endDate) {
        newErrors.endDate = 'End date must be after start date';
      }
    }

    if (!formData.termsConditions || formData.termsConditions.trim().length === 0) {
      newErrors.termsConditions = 'Terms & conditions are required';
    }

    if (!formData.paymentAmount) {
      newErrors.paymentAmount = 'Payment amount is required';
    } else if (isNaN(Number(formData.paymentAmount)) || Number(formData.paymentAmount) < 0) {
      newErrors.paymentAmount = 'Payment amount must be a valid positive number';
    }

    if (!formData.jurisdiction || formData.jurisdiction.trim().length === 0) {
      newErrors.jurisdiction = 'Jurisdiction is required';
    }

    if (!formData.recipientName || formData.recipientName.trim().length === 0) {
      newErrors.recipientName = 'Recipient name is required';
    }

    if (!formData.recipientEmail || formData.recipientEmail.trim().length === 0) {
      newErrors.recipientEmail = 'Recipient email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.recipientEmail)) {
      newErrors.recipientEmail = 'Please enter a valid email address';
    }

    if (!formData.confirmation) {
      newErrors.confirmation = 'You must confirm that all information is correct';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
      if (errors[name]) {
        const newErrors = { ...errors };
        delete newErrors[name];
        setErrors(newErrors);
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
      if (errors[name]) {
        const newErrors = { ...errors };
        delete newErrors[name];
        setErrors(newErrors);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const agreementData = {
        agreementType: formData.agreementType,
        title: formData.agreementTitle,
        startDate: formData.startDate,
        endDate: formData.endDate,
        termsConditions: formData.termsConditions,
        paymentAmount: formData.paymentAmount,
        jurisdiction: formData.jurisdiction,
        recipientName: formData.recipientName,
        recipientEmail: formData.recipientEmail,
        confirmation: formData.confirmation
      };

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/agreements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(agreementData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create agreement');
      }

      setSuccess('Agreement created successfully! Redirecting to dashboard...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create agreement');
      console.error('Error creating agreement:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

  if (!user) {
    return (
      <div className="create-agreement-container">
        <p>Please log in first</p>
      </div>
    );
  }

  return (
    <div className="create-agreement-container">
      <div className="create-agreement-wrapper">
        <div className="create-agreement-header">
          <h1>Create New Agreement</h1>
          <p>Fill in all the details to create a new agreement</p>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit} className="agreement-form">
          {/* Agreement Type */}
          <div className="form-group">
            <label htmlFor="agreementType" className="label-required">
              Agreement Type
            </label>
            <select
              id="agreementType"
              name="agreementType"
              value={formData.agreementType}
              onChange={handleInputChange}
              className={`form-input ${errors.agreementType ? 'input-error' : ''}`}
            >
              <option value="">-- Select Agreement Type --</option>
              {agreementTypes.map(type => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {errors.agreementType && <span className="error-text">{errors.agreementType}</span>}
          </div>

          {/* Agreement Title */}
          <div className="form-group">
            <label htmlFor="agreementTitle" className="label-required">
              Agreement Title
            </label>
            <input
              type="text"
              id="agreementTitle"
              name="agreementTitle"
              value={formData.agreementTitle}
              onChange={handleInputChange}
              placeholder="Enter agreement title (e.g., Service Agreement, Rental Agreement)..."
              className={`form-input ${errors.agreementTitle ? 'input-error' : ''}`}
            />
            {errors.agreementTitle && <span className="error-text">{errors.agreementTitle}</span>}
          </div>

          {/* Start Date */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startDate" className="label-required">
                Starting Date
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                className={`form-input ${errors.startDate ? 'input-error' : ''}`}
              />
              {errors.startDate && <span className="error-text">{errors.startDate}</span>}
            </div>

            {/* End Date */}
            <div className="form-group">
              <label htmlFor="endDate" className="label-required">
                Ending Date
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                className={`form-input ${errors.endDate ? 'input-error' : ''}`}
              />
              {errors.endDate && <span className="error-text">{errors.endDate}</span>}
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="form-group">
            <label htmlFor="termsConditions" className="label-required">
              Terms & Conditions
            </label>
            <textarea
              id="termsConditions"
              name="termsConditions"
              value={formData.termsConditions}
              onChange={handleInputChange}
              placeholder="Enter terms and conditions..."
              rows={6}
              className={`form-textarea ${errors.termsConditions ? 'input-error' : ''}`}
            ></textarea>
            {errors.termsConditions && <span className="error-text">{errors.termsConditions}</span>}
          </div>

          {/* Payment Amount */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="paymentAmount" className="label-required">
                Payment Amount
              </label>
              <input
                type="number"
                id="paymentAmount"
                name="paymentAmount"
                value={formData.paymentAmount}
                onChange={handleInputChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                className={`form-input ${errors.paymentAmount ? 'input-error' : ''}`}
              />
              {errors.paymentAmount && <span className="error-text">{errors.paymentAmount}</span>}
            </div>

            {/* Jurisdiction */}
            <div className="form-group">
              <label htmlFor="jurisdiction" className="label-required">
                Jurisdiction
              </label>
              <input
                type="text"
                id="jurisdiction"
                name="jurisdiction"
                value={formData.jurisdiction}
                onChange={handleInputChange}
                placeholder="e.g., New York, USA"
                className={`form-input ${errors.jurisdiction ? 'input-error' : ''}`}
              />
              {errors.jurisdiction && <span className="error-text">{errors.jurisdiction}</span>}
            </div>
          </div>

          {/* Recipient Details */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="recipientName" className="label-required">
                Recipient Name
              </label>
              <input
                type="text"
                id="recipientName"
                name="recipientName"
                value={formData.recipientName}
                onChange={handleInputChange}
                placeholder="Full name"
                className={`form-input ${errors.recipientName ? 'input-error' : ''}`}
              />
              {errors.recipientName && <span className="error-text">{errors.recipientName}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="recipientEmail" className="label-required">
                Recipient Email
              </label>
              <input
                type="email"
                id="recipientEmail"
                name="recipientEmail"
                value={formData.recipientEmail}
                onChange={handleInputChange}
                placeholder="email@example.com"
                className={`form-input ${errors.recipientEmail ? 'input-error' : ''}`}
              />
              {errors.recipientEmail && <span className="error-text">{errors.recipientEmail}</span>}
            </div>
          </div>

          {/* Confirmation Checkbox */}
          <div className="form-group checkbox-group">
            <label htmlFor="confirmation" className="checkbox-label">
              <input
                type="checkbox"
                id="confirmation"
                name="confirmation"
                checked={formData.confirmation}
                onChange={handleInputChange}
                className={`checkbox-input ${errors.confirmation ? 'input-error' : ''}`}
              />
              <span className="checkbox-text">
                I confirm that all information provided is correct and accurate
              </span>
            </label>
            {errors.confirmation && <span className="error-text">{errors.confirmation}</span>}
          </div>

          {/* Submit Buttons */}
          <div className="form-actions">
            <button
              type="button"
              onClick={handleCancel}
              className="btn btn-secondary"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Agreement...' : 'Create Agreement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAgreement;

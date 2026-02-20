import { useState, useEffect } from 'react';
import NITValidation from './components/NITValidation';
import CompanyRegistration from './components/CompanyRegistration';
import './App.css';

function App() {
  const [currentStep, setCurrentStep] = useState('nit-validation'); // 'nit-validation' | 'registration' | 'success'
  const [validatedIdentification, setValidatedIdentification] = useState(null);
  const [registeredCompany, setRegisteredCompany] = useState(null);
  const [apiStatus, setApiStatus] = useState('checking');

  // Check API health on mount
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/health');
        if (response.ok) {
          setApiStatus('connected');
        } else {
          setApiStatus('disconnected');
        }
      } catch {
        setApiStatus('disconnected');
      }
    };

    checkHealth();
  }, []);

  const handleNITValidationSuccess = (result) => {
    if (typeof result === 'string') {
      setValidatedIdentification({ identificationType: 'NIT', identificationNumber: result, existingCompany: null });
    } else {
      setValidatedIdentification(result);
    }
    setCurrentStep('registration');
  };

  const handleNITValidationError = (error) => {
    // Ignore expected 'Company not found' responses (they mean proceed to registration)
    if (typeof error === 'string' && /Company not found/i.test(error)) return;
    console.error('Validation error:', error);
  };

  const handleRegistrationSuccess = (companyData) => {
    setRegisteredCompany(companyData);
    setCurrentStep('success');
  };

  const handleBackToValidation = () => {
    setValidatedIdentification(null);
    setCurrentStep('nit-validation');
  };

  const handleStartOver = () => {
    setValidatedIdentification(null);
    setRegisteredCompany(null);
    setCurrentStep('nit-validation');
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>Company Management System</h1>
          <div className={`api-status ${apiStatus}`}>
            <span className="status-dot"></span>
            {apiStatus === 'connected'
              ? 'API Connected'
              : apiStatus === 'checking'
                ? 'Checking...'
                : 'API Disconnected'}
          </div>
        </div>
      </header>

      <main className="app-content">
        {currentStep === 'nit-validation' && (
          <NITValidation
            onValidationSuccess={handleNITValidationSuccess}
            onValidationError={handleNITValidationError}
          />
        )}

        {currentStep === 'registration' && (
          <CompanyRegistration
            nit={validatedIdentification ? validatedIdentification.identificationNumber : null}
            identificationType={validatedIdentification ? validatedIdentification.identificationType : 'NIT'}
            existingCompany={validatedIdentification ? validatedIdentification.existingCompany : null}
            onSuccess={handleRegistrationSuccess}
            onBack={handleBackToValidation}
          />
        )}

        {currentStep === 'success' && registeredCompany && (
          <div className="success-container">
            <div className="success-card">
              <div className="success-icon">✓</div>
              <h2 className="success-title">Registration Complete!</h2>

              <div className="company-summary">
                <h3>Company Information</h3>
                <div className="summary-item">
                  <span className="label">NIT:</span>
                  <span className="value">{registeredCompany.nit}</span>
                </div>
                <div className="summary-item">
                  <span className="label">Company Name:</span>
                  <span className="value">{registeredCompany.name}</span>
                </div>
                <div className="summary-item">
                  <span className="label">Email:</span>
                  <span className="value">{registeredCompany.email}</span>
                </div>
                <div className="summary-item">
                  <span className="label">Phone:</span>
                  <span className="value">{registeredCompany.phone}</span>
                </div>
                <div className="summary-item">
                  <span className="label">Address:</span>
                  <span className="value">{registeredCompany.address}</span>
                </div>
                <div className="summary-item">
                  <span className="label">Status:</span>
                  <span className="value status-active">
                    {registeredCompany.status}
                  </span>
                </div>
              </div>

              <p className="success-message">
                Your company has been successfully registered and is now active
                in the system. You can now access your company dashboard and
                manage your profile.
              </p>

              <button className="btn btn-primary" onClick={handleStartOver}>
                Register Another Company
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>
          &copy; 2026 Company Management System. All rights reserved. | Node.js
          v20+ • Express.js • React 18+ • Vite
        </p>
      </footer>
    </div>
  );
}

export default App;

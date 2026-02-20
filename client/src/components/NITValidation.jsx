import { useState } from 'react';
import { validateNIT, getCompanyByNIT } from '../services/api';
import './NITValidation.css';

/**
 * NITValidation Component
 * First step of company registration: validates company NIT
 */
export function NITValidation({ onValidationSuccess, onValidationError }) {
  const [identificationType, setIdentificationType] = useState('NIT');
  const [nit, setNit] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleNITChange = (e) => {
    const value = e.target.value;
    // Allow only numbers
    if (/^\d*$/.test(value)) {
      setNit(value);
    }
    setError('');
    setSuccess('');
  };

  const handleTypeChange = (e) => {
    setIdentificationType(e.target.value);
    setError('');
    setSuccess('');
    setNit('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);
    try {
      if (!nit.trim()) {
        throw new Error('Please enter the identification number');
      }

      // First attempt to find an existing company by this identification
      const existing = await getCompanyByNIT(nit);

      // If company exists -> block registration; it's already registered
      if (existing && existing.success) {
        const msg = 'This company is already registered. You cannot register the same NIT twice.';
        setError(msg);
        if (onValidationError) onValidationError(msg);
        return;
      }

      // If the backend returned 404 (Company not found) that is expected when registering a new company.
      // Treat it as "not found" and continue to registration flow instead of showing an error.
      if (existing && existing.status === 404) {
        // no action needed, proceed to validation
      } else if (existing && existing.code && existing.code !== '' && existing.code !== '0') {
        // Other service-level errors: show message and stop
        const msg = existing.message || 'Validation service returned an error';
        setError(msg);
        if (onValidationError) onValidationError(msg);
        return;
      }

      // If the identification type is NIT, validate format with the validation service
      if (identificationType === 'NIT') {
        const result = await validateNIT(nit);

        // Service-level failure (non-zero code)
        if (result && result.code && result.code !== '' && result.code !== '0') {
          const msg = result.message || 'NIT validation service returned an error';
          setError(msg);
          if (onValidationError) onValidationError(msg);
          return;
        }

        if (!result || !result.valid) {
          const msg = (result && result.message) || 'NIT validation failed';
          setError(msg);
          if (onValidationError) onValidationError(msg);
          return;
        }
      }

      // No existing company found — proceed to registration
      setSuccess('Identification accepted. Continue to register the company.');
      if (onValidationSuccess) {
        setTimeout(() => {
          onValidationSuccess({
            identificationType,
            identificationNumber: nit,
            existingCompany: null,
          });
        }, 700);
      }
    } catch (err) {
      const errorMessage = err.message || 'An error occurred during validation';
      setError(errorMessage);
      if (onValidationError) {
        onValidationError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="nit-validation-container">
      <div className="validation-card">
        <h2 className="validation-title">Company Registration</h2>
        <p className="validation-subtitle">
          Enter your company's NIT (Tax Identification Number) to get started
        </p>

        <form onSubmit={handleSubmit} className="validation-form">
          <div className="form-row">
            <div className="form-group form-group-half">
              <label htmlFor="idType" className="form-label">
                Identification Type
              </label>
              <select
                id="idType"
                value={identificationType}
                onChange={handleTypeChange}
                className="form-input"
                disabled={isLoading}
              >
                <option value="NIT">NIT</option>
                <option value="Foreign">Foreign Identification</option>
                <option value="Other">Other Identification</option>
              </select>
            </div>

            <div className="form-group form-group-half">
              <label htmlFor="nit" className="form-label">
                Identification Number
              </label>
              <input
                id="nit"
                type="text"
                value={nit}
                onChange={handleNITChange}
                placeholder="Enter numbers only"
                className="form-input"
                disabled={isLoading}
                autoFocus
              />
              <small className="form-hint">Numbers only</small>
            </div>
          </div>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading || !nit.trim()}
          >
            {isLoading ? 'Validating...' : 'Continue'}
          </button>
        </form>

        <div className="validation-info">
          <h4>What is NIT?</h4>
          <p>
            NIT (Número de Identificación Tributaria) is the Colombian tax
            identification number for companies. It uniquely identifies your
            business with the Colombian tax authority (DIAN).
          </p>
        </div>
      </div>
    </div>
  );
}

export default NITValidation;

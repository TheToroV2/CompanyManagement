import { useState } from 'react';
import { registerCompany } from '../services/api';
import './CompanyRegistration.css';
/**
 * CompanyRegistration Component
 * Second step of company registration: captures company details
 */
export function CompanyRegistration({ nit, onSuccess, onBack, identificationType = 'NIT', existingCompany = null }) {
  const [formData, setFormData] = useState({
    identificationType,
    identificationNumber: nit || '',
    companyName: existingCompany ? existingCompany.name || '' : '',
    firstName: '',
    secondName: '',
    firstLastName: '',
    secondLastName: '',
    email: '',
    phone: '',
    address: '',
    authorizePhone: 'no',
    authorizeEmail: 'no',
    // structured address pieces
    addressViaType: 'Carrera',
    addressNumber1: '',
    addressLetter1: '',
    addressNumber2: '',
    addressLetter2: '',
    addressComplement: '',
    city: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formErrors, setFormErrors] = useState({});

  // Validate form fields and collect per-field error messages
  const validateForm = () => {
    const errors = {};

    if (!formData.identificationNumber || !/^[0-9]+$/.test(formData.identificationNumber)) {
      errors.identificationNumber = 'Identification number is required and must contain only numbers';
    }

    const isCompanyNameRequired = formData.identificationType === 'NIT' || formData.identificationType === 'Foreign';
    if (isCompanyNameRequired) {
      if (!formData.companyName || !formData.companyName.trim()) {
        errors.companyName = 'Company name is required for this identification type';
      }
    } else {
      if (!formData.firstName || !formData.firstName.trim()) errors.firstName = 'First name is required';
      // Second name is optional
      if (!formData.firstLastName || !formData.firstLastName.trim()) errors.firstLastName = 'First last name is required';
      if (!formData.secondLastName || !formData.secondLastName.trim()) errors.secondLastName = 'Second last name is required';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) errors.email = 'A valid email address is required';

    if (!formData.phone || formData.phone.replace(/[\s\-()]/g, '').length < 7) errors.phone = 'Invalid phone number';

    if (!formData.city || !formData.city.trim()) errors.city = 'City is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Enforce numeric-only and alphabetic-only fields per requirements
    const numericOnlyFields = new Set(['phone', 'addressNumber1', 'addressNumber2']);
    const alphaOnlyFields = new Set([
      'firstName',
      'secondName',
      'firstLastName',
      'secondLastName',
      'addressLetter1',
      'addressLetter2',
      'city',
    ]);

    let newValue = value;

    // Numeric-only: remove letter characters but keep symbols like + - ( ) and spaces
    if (numericOnlyFields.has(name)) {
      newValue = newValue.replace(/[A-Za-zÀ-ÖØ-öø-ÿ]/g, '');
    }

    // Alphabetic-only: remove digits
    if (alphaOnlyFields.has(name)) {
      newValue = newValue.replace(/[0-9]/g, '');
    }

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));
    setError('');
    setFormErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      // Client-side validation first
      const valid = validateForm();
      if (!valid) {
        setError('Please fix the highlighted fields before continuing');
        setIsLoading(false);
        return;
      }

      // compose address from structured fields with formatting symbols (# and -)
      const composedAddress = `${formData.addressViaType || ''} ${formData.addressNumber1 || ''}${formData.addressLetter1 ? formData.addressLetter1 : ''} # ${formData.addressNumber2 || ''}${formData.addressLetter2 ? formData.addressLetter2 : ''} - ${formData.addressComplement || ''}`.replace(/\s+/g, ' ').trim();
      const finalPayload = { ...formData, address: composedAddress };

      const result = await registerCompany(finalPayload);

      // If service returned a code indicating error, or success false, show server errors
      if (!result || !result.success || (result.code && result.code !== '' && result.code !== '0')) {
        setFormErrors(result && result.errors ? result.errors : {});
        setError((result && result.message) || 'Registration failed');
        setIsLoading(false);
        return;
      }

      // success path
      setFormErrors({});
      setSuccess('Company registered successfully.');
      if (onSuccess) {
        setTimeout(() => {
          onSuccess(result.data);
        }, 2000);
      }
    } catch (err) {
      setError(err.message || 'An error occurred during registration');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    if (typeof onBack === 'function') return onBack();
    if (window && window.history && typeof window.history.back === 'function') return window.history.back();
  };

  return (
    <div className="registration-container">
      <div className="registration-card">
        <h2 className="registration-title">Company Details</h2>
        <p className="registration-subtitle">
          Enter your company information to complete the registration
        </p>

        <form onSubmit={handleSubmit} className="registration-form">
          <div className="form-row">
            <div className="form-group form-group-half">
              <label htmlFor="identificationNumber" className="form-label">
                Identification Number
              </label>
              <input
                id="identificationNumber"
                type="text"
                name="identificationNumber"
                value={formData.identificationNumber}
                disabled
                className="form-input form-input-disabled"
              />
              <small className="form-hint">Validated in previous step</small>
            </div>

            <div className="form-group form-group-half">
              { (formData.identificationType === 'NIT' || formData.identificationType === 'Foreign') ? (
                <>
                  <label htmlFor="companyName" className="form-label">Company Name *</label>
                  <input
                    id="companyName"
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    placeholder="Enter company name"
                    className="form-input"
                    disabled={isLoading}
                  />
                  {formErrors.companyName && <div className="field-error">{formErrors.companyName}</div>}
                </>
              ) : (
                <>
                  <label className="form-label">Company / Personal</label>
                  <div className="form-note">Provide personal name fields below</div>
                </>
              )}
            </div>
          </div>

          {formData.identificationType !== 'NIT' && formData.identificationType !== 'Foreign' && (
            <>
              <div className="form-row">
                <div className="form-group form-group-half">
                  <label htmlFor="firstName" className="form-label">First Name *</label>
                  <input id="firstName" type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className="form-input" disabled={isLoading} />
                  {formErrors.firstName && <div className="field-error">{formErrors.firstName}</div>}
                </div>
                <div className="form-group form-group-half">
                  <label htmlFor="secondName" className="form-label">Second Name (optional)</label>
                  <input id="secondName" type="text" name="secondName" value={formData.secondName} onChange={handleInputChange} className="form-input" disabled={isLoading} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group form-group-half">
                  <label htmlFor="firstLastName" className="form-label">First Last Name *</label>
                  <input id="firstLastName" type="text" name="firstLastName" value={formData.firstLastName} onChange={handleInputChange} className="form-input" disabled={isLoading} />
                  {formErrors.firstLastName && <div className="field-error">{formErrors.firstLastName}</div>}
                </div>
                <div className="form-group form-group-half">
                  <label htmlFor="secondLastName" className="form-label">Second Last Name *</label>
                  <input id="secondLastName" type="text" name="secondLastName" value={formData.secondLastName} onChange={handleInputChange} className="form-input" disabled={isLoading} />
                  {formErrors.secondLastName && <div className="field-error">{formErrors.secondLastName}</div>}
                </div>
              </div>
            </>
          )}

          <div className="form-row">
            <div className="form-group form-group-half">
              <label htmlFor="email" className="form-label">
                Email Address *
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="company@example.com"
                className="form-input"
                disabled={isLoading}
                required
              />
              {formErrors.email && <div className="field-error">{formErrors.email}</div>}
            </div>

            <div className="form-group form-group-half">
              <label htmlFor="phone" className="form-label">
                Phone Number *
              </label>
              <input
                id="phone"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+57 (XXX) XXX-XXXX"
                className="form-input"
                disabled={isLoading}
                required
              />
              {formErrors.phone && <div className="field-error">{formErrors.phone}</div>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Business Address *</label>

            <div className="address-grid">
              <div className="address-field">
                <label className="small-label">Vía</label>
                <select name="addressViaType" value={formData.addressViaType} onChange={handleInputChange} className="form-input small-select" disabled={isLoading}>
                  <option>Carrera</option>
                  <option>Calle</option>
                  <option>Avenida</option>
                  <option>Transversal</option>
                </select>
              </div>

              <div className="address-field">
                <label className="small-label">Nro</label>
                <input type="text" name="addressNumber1" value={formData.addressNumber1} onChange={handleInputChange} className="form-input small-input" disabled={isLoading} />
              {formErrors.addressNumber1 && <div className="field-error">{formErrors.addressNumber1}</div>}
              </div>

              <div className="address-field">
                <label className="small-label">Letra</label>
                <input type="text" name="addressLetter1" value={formData.addressLetter1} onChange={handleInputChange} className="form-input small-input" disabled={isLoading} />
              {formErrors.addressLetter1 && <div className="field-error">{formErrors.addressLetter1}</div>}
              </div>

              <div className="address-field">
                <label className="small-label">Nro</label>
                <input type="text" name="addressNumber2" value={formData.addressNumber2} onChange={handleInputChange} className="form-input small-input" disabled={isLoading} />
              {formErrors.addressNumber2 && <div className="field-error">{formErrors.addressNumber2}</div>}
              </div>

              <div className="address-field">
                <label className="small-label">Letra</label>
                <input type="text" name="addressLetter2" value={formData.addressLetter2} onChange={handleInputChange} className="form-input small-input" disabled={isLoading} />
              {formErrors.addressLetter2 && <div className="field-error">{formErrors.addressLetter2}</div>}
              </div>

              <div className="address-field address-complement">
                <label className="small-label">Nro y complementos</label>
                <input type="text" name="addressComplement" value={formData.addressComplement} onChange={handleInputChange} className="form-input" disabled={isLoading} />
              {formErrors.address && <div className="field-error">{formErrors.address}</div>}
              {formErrors.addressComplement && <div className="field-error">{formErrors.addressComplement}</div>}
              </div>
            </div>

            <div className="address-line">
              <input type="text" name="city" value={formData.city} onChange={handleInputChange} placeholder="Municipio - Departamento - Ciudad" className="form-input" disabled={isLoading} />
              {formErrors.city && <div className="field-error">{formErrors.city}</div>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group form-group-half">
              <label className="form-label">I authorize sending messages to the cell phone provided:</label>
              <div className="radio-group">
                <label>
                  <input type="radio" name="authorizePhone" value="yes" checked={formData.authorizePhone === 'yes'} onChange={handleInputChange} disabled={isLoading} /> Yes
                </label>
                <label>
                  <input type="radio" name="authorizePhone" value="no" checked={formData.authorizePhone === 'no'} onChange={handleInputChange} disabled={isLoading} /> No
                </label>
              </div>
            </div>

            <div className="form-group form-group-half">
              <label className="form-label">I authorize messages to be sent to the following e-mail address:</label>
              <div className="radio-group">
                <label>
                  <input type="radio" name="authorizeEmail" value="yes" checked={formData.authorizeEmail === 'yes'} onChange={handleInputChange} disabled={isLoading} /> Yes
                </label>
                <label>
                  <input type="radio" name="authorizeEmail" value="no" checked={formData.authorizeEmail === 'no'} onChange={handleInputChange} disabled={isLoading} /> No
                </label>
              </div>
            </div>
          </div>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onBack}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Registering...' : 'Complete Registration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CompanyRegistration;

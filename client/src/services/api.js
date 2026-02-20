/**
 * API Client
 * Handles all communication with the backend server
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

/**
 * Validate company NIT
 * @param {string} nit - Company identification number
 * @returns {Promise<object>} - Validation result
 */
export async function validateNIT(nit) {
  try {
    const response = await fetch(`${API_BASE_URL}/validation/nit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nit: nit.trim() }),
    });

    // parse body safely
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        success: false,
        status: response.status,
        code: data.code !== undefined ? String(data.code) : String(response.status),
        message: data.message || 'Validation failed',
        data,
      };
    }

    return {
      success: true,
      status: response.status,
      code: data.code !== undefined ? String(data.code) : '0',
      message: data.message || '',
      valid: data.valid !== undefined ? data.valid : true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      status: 0,
      code: 'ERR',
      message: `NIT validation error: ${error.message}`,
    };
  }
}

/**
 * Register a new company
 * @param {object} companyData - Company information
 * @returns {Promise<object>} - Registration result
 */
export async function registerCompany(companyData) {
  try {
    const response = await fetch(`${API_BASE_URL}/companies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(companyData),
    });

    // parse body safely
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        success: false,
        status: response.status,
        message: data.message || 'Registration failed',
        errors: data.errors || null,
        data: data,
      };
    }

    return {
      success: true,
      status: response.status,
      ...data,
    };
  } catch (error) {
    // network or unexpected error
    return {
      success: false,
      status: 0,
      message: `Company registration error: ${error.message}`,
    };
  }
}

/**
 * Get all companies
 * @returns {Promise<object>} - List of companies
 */
export async function getCompanies() {
  try {
    const response = await fetch(`${API_BASE_URL}/companies`);

    if (!response.ok) {
      throw new Error('Failed to fetch companies');
    }

    return await response.json();
  } catch (error) {
    throw new Error(`Get companies error: ${error.message}`);
  }
}

/**
 * Get company by NIT
 * @param {string} nit - Company identification number
 * @returns {Promise<object>} - Company data
 */
export async function getCompanyByNIT(nit) {
  try {
    const response = await fetch(`${API_BASE_URL}/companies/${nit}`);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        success: false,
        status: response.status,
        code: data.code !== undefined ? String(data.code) : String(response.status),
        message: data.message || 'Company not found',
        data,
      };
    }

    return {
      success: true,
      status: response.status,
      code: data.code !== undefined ? String(data.code) : '0',
      message: data.message || '',
      data,
    };
  } catch (error) {
    return {
      success: false,
      status: 0,
      code: 'ERR',
      message: `Get company error: ${error.message}`,
    };
  }
}

/**
 * Check API health
 * @returns {Promise<object>} - Health status
 */
export async function checkHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/validation/health`);

    if (!response.ok) {
      throw new Error('Health check failed');
    }

    return await response.json();
  } catch (error) {
    throw new Error(`Health check error: ${error.message}`);
  }
}

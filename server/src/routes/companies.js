import express from 'express';
import * as fileStore from '../fileStore.js';

const router = express.Router();

let companies = [];

const normalizeId = (s) => {
  if (!s || typeof s !== 'string') return '';
  return s.replace(/[\s\-]/g, '').toLowerCase();
};

const useFile = String(process.env.USE_FILE || 'true').toLowerCase() === 'true';

async function findCompanyByNormalizedNIT(normalized) {
  if (useFile) {
    return await fileStore.findCompanyByNormalizedNIT(normalized);
  }

  // fallback to in-memory
  return companies.find((c) => c.normalizedNIT === normalized) || null;
}

async function insertCompanyToDb(company) {
  if (useFile) {
    return await fileStore.insertCompany(company);
  }

  // fallback to in-memory
  companies.push(company);
  return company;
}

/**
 * Register a new company
 *
 * Request body:
 * {
 *   "nit": "string",
 *   "name": "string",
 *   "email": "string",
 *   "phone": "string",
 *   "address": "string"
 * }
 */
router.post('/', async (req, res) => {
  try {
    // Support both "nit" and "identificationNumber" from client
    const rawNit = req.body.nit || req.body.identificationNumber || '';
    let name = req.body.name || req.body.companyName || '';
    const email = req.body.email || '';
    const phone = req.body.phone || '';
    const address = req.body.address || '';

    // If no company name but personal name parts provided, build a name
    if (!name && req.body.firstName) {
      const parts = [req.body.firstName, req.body.secondName, req.body.firstLastName, req.body.secondLastName].filter(Boolean);
      name = parts.join(' ');
    }

    // Validate required fields
    const missing = [];
    if (!rawNit) missing.push('identification number');
    if (!name) missing.push('name');
    if (!email) missing.push('email');
    if (!phone) missing.push('phone');
    if (!address) missing.push('address');

    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missing.join(', ')}`,
      });
    }

    const normalized = normalizeId(rawNit);

    // Check if company already registered
    const existingCompany = await findCompanyByNormalizedNIT(normalized);
    if (existingCompany) {
      return res.status(409).json({
        success: false,
        message: 'Company with this identification number is already registered',
        data: existingCompany,
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format',
      });
    }

    // Validate phone format (basic check)
    if (phone.replace(/[\s\-()]/g, '').length < 7) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone format',
      });
    }

    const newCompany = {
      id: `company_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      nit: (rawNit || '').trim(),
      normalizedNIT: normalized,
      name: (name || '').trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      address: address.trim(),
      registeredAt: new Date().toISOString(),
      status: 'active',
    };
    await insertCompanyToDb(newCompany);

    res.status(201).json({
      success: true,
      message: 'Company registered successfully',
      data: newCompany,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error registering company: ' + error.message,
    });
  }
});

/**
 * Get company by NIT
 */
router.get('/:nit', async (req, res) => {
  try {
    const { nit } = req.params;
    const normalized = normalizeId(nit);
    const company = await findCompanyByNormalizedNIT(normalized);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found',
      });
    }

    res.status(200).json({
      success: true,
      data: company,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving company: ' + error.message,
    });
  }
});

export default router;

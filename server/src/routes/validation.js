import express from 'express';

const router = express.Router();

/**
 * Health check for validation service
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'validation-service',
    timestamp: new Date().toISOString(),
  });
});

/**
 * Validate NIT (Número de Identificación Tributaria)
 * Colombian company identification number
 *
 * Request body: { "nit": "string" }
 * Example: "123456789-1"
 */
router.post('/nit', (req, res) => {
  try {
    const { nit } = req.body;

    // Validate input
    if (!nit || typeof nit !== 'string') {
      return res.status(400).json({
        valid: false,
        message: 'NIT is required and must be a string',
      });
    }

    // Remove spaces and dashes for validation
    const cleanNIT = nit.replace(/[\s\-]/g, '');

    // Basic NIT format validation
    // Colombian NIT: 8-10 digits, optional check digit
    const nitRegex = /^\d{8,10}(-\d)?$/;
    const isValidFormat = nitRegex.test(nit);

    if (!isValidFormat) {
      return res.status(400).json({
        valid: false,
        message:
          'Invalid NIT format. Expected format: XXXXXXXXXX-X or XXXXXXXXXX',
      });
    }

    // Check if NIT has minimum length
    if (cleanNIT.length < 8) {
      return res.status(400).json({
        valid: false,
        message: 'NIT must have at least 8 digits',
      });
    }

    // TODO: Add external service validation
    // This could call a real Colombian NIT validation API
    // For now, we validate format only

    res.status(200).json({
      valid: true,
      message: 'NIT format is valid',
      nit: nit,
    });
  } catch (error) {
    res.status(500).json({
      valid: false,
      message: 'Error validating NIT: ' + error.message,
    });
  }
});

export default router;

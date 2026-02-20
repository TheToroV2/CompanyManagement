import express from 'express';
import cors from 'cors';
import validationRoutes from './routes/validation.js';
import companiesRoutes from './routes/companies.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Root health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'companie-management-api',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use('/api/validation', validationRoutes);
app.use('/api/companies', companiesRoutes);

// Serve client production build (if present).
// This allows deploying a single combined service: the Express API
// serves the frontend `client/dist` static files and falls back to
// `index.html` for SPA routing.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDist = path.join(__dirname, '../../client/dist');

if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));

  // Fallback route for client-side routing. Skip API paths.
  app.get('/*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} does not exist`,
  });
});

// Error handler middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
  });
});

app.listen(PORT, () => {
  console.log(`\nServer running at http://localhost:${PORT}`);
  console.log(`API Documentation:`);
  console.log(`   - Health Check: GET /api/health`);
  console.log(`   - Validate NIT: POST /api/validation/nit`);
  console.log(`   - Register Company: POST /api/companies`);
  console.log(`   - Get Companies: GET /api/companies`);
  console.log(`\n`);
});

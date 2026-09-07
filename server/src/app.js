const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const routes = require('./routes');
const { useCases, COMPLIANCE_STATUS } = require('./config/useCases');
const { requireAuth } = require('./middleware/authMiddleware');

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/use-cases', (req, res) => {
  res.json({ complianceStatus: COMPLIANCE_STATUS, count: useCases.length, useCases });
});

// Mounted before the requireAuth-guarded routes below so logging in doesn't
// itself require a token.
app.use('/api/auth', require('./routes/authRoutes'));

app.use('/api', requireAuth, routes);
app.use('/api/audit', requireAuth, require('./routes/auditRoutes'));
app.use('/api/reports', requireAuth, require('./routes/reportRoutes'));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(409).json({ message: `Duplicate value for ${field}.`, code: 'DUPLICATE_KEY' });
  }
  console.error(err);
  res.status(err.statusCode || 500).json({ message: err.message || 'Internal server error' });
});

module.exports = app;

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');

const routes = require('./routes');
const { useCases, COMPLIANCE_STATUS } = require('./config/useCases');
const { requireAuth } = require('./middleware/authMiddleware');
const { authLimiter, globalLimiter } = require('./middleware/rateLimit');

const app = express();

/**
 * Render (and most PaaS) terminate TLS at a proxy, so every request reaches
 * the app from the same socket address. Without this, express-rate-limit
 * keys every user to one IP and the first busy user locks out everyone.
 * `1` = trust exactly one hop, which is what Render presents; trusting all
 * proxies would let a client spoof X-Forwarded-For and bypass the limiter.
 */
app.set('trust proxy', 1);

app.use(helmet());

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

const allowedOrigins = [
  CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'https://t-cams.vercel.app', // Fallback safety net for Vercel previews
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, or server-to-server)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.warn(`CORS blocked origin: ${origin}`);
    return callback(new Error('Not allowed by CORS'), false);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with'],
  credentials: true,
}));
app.use(express.json());
app.use(morgan('dev'));
app.use(globalLimiter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/use-cases', (req, res) => {
  res.json({ complianceStatus: COMPLIANCE_STATUS, count: useCases.length, useCases });
});

// Mounted before the requireAuth-guarded routes below so logging in doesn't
// itself require a token.
app.use('/api/auth', authLimiter, require('./routes/authRoutes'));

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

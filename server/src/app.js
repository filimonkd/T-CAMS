const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const routes = require('./routes');
const { useCases, COMPLIANCE_STATUS } = require('./config/useCases');

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

app.use('/api', routes);

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.statusCode || 500).json({ message: err.message || 'Internal server error' });
});

module.exports = app;

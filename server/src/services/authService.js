const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { GuardError } = require('./guardService');

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';
const SALT_ROUNDS = 10;

function requireJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    // Fails the request rather than signing with a guessable fallback -
    // server.js also checks this at boot so this should be unreachable
    // outside of tests that import authService without going through it.
    throw new Error('JWT_SECRET is not configured.');
  }
  return secret;
}

async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

// POST /api/auth/login
async function login(email, password) {
  if (!email || !password) {
    throw new GuardError('Email and password are required.', 'MISSING_CREDENTIALS', 400);
  }

  const user = await User.findOne({ email: String(email).toLowerCase().trim() });
  if (!user || !user.isActive) {
    throw new GuardError('Invalid email or password.', 'INVALID_CREDENTIALS', 401);
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) {
    throw new GuardError('Invalid email or password.', 'INVALID_CREDENTIALS', 401);
  }

  const token = jwt.sign(
    { sub: user._id.toString(), email: user.email, role: user.role, name: user.name },
    requireJwtSecret(),
    { expiresIn: JWT_EXPIRES_IN },
  );

  return {
    token,
    user: { id: user._id, email: user.email, name: user.name, role: user.role },
  };
}

module.exports = { login, hashPassword, requireJwtSecret };

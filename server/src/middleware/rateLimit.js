const rateLimit = require('express-rate-limit');

/**
 * Rate limiters.
 *
 * Two tiers: a strict one on authentication, where an attacker gets
 * unlimited free guesses otherwise, and a loose global one as a backstop
 * against a runaway client.
 *
 * These complement, not replace, per-account lockout (Tier 3 item 8): a
 * limiter is keyed by IP and stops one source hammering many accounts; a
 * lockout is keyed by account and stops many sources hammering one.
 *
 * Disabled under NODE_ENV=test so the suite can exercise routes repeatedly
 * without tripping a limit. Nothing else changes between environments.
 */
const isTest = process.env.NODE_ENV === 'test';

const SHARED = {
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip: () => isTest,
};

// Sign-in attempts. Counts only failures, so a user working normally in a
// shared-NAT office is never locked out by their own successful logins.
const authLimiter = rateLimit({
  ...SHARED,
  windowMs: 15 * 60 * 1000,
  limit: 5,
  skipSuccessfulRequests: true,
  message: { message: 'Too many sign-in attempts. Try again later.', code: 'RATE_LIMITED' },
});

// Backstop for everything else.
const globalLimiter = rateLimit({
  ...SHARED,
  windowMs: 15 * 60 * 1000,
  limit: 1000,
  message: { message: 'Too many requests. Try again later.', code: 'RATE_LIMITED' },
});

module.exports = { authLimiter, globalLimiter };

const jwt = require('jsonwebtoken');

/**
 * Verifies the Bearer JWT on every request under a protected mount and
 * attaches { id, email, role, name } to req.user. Applied globally to the
 * business API in app.js (everything except /api/health, /api/use-cases
 * and /api/auth/login) - this closes the Phase 9 gap where every endpoint
 * was reachable with no authentication at all.
 *
 * requireRole is exported for future fine-grained per-route authorization
 * but is NOT applied to individual routes in this phase - deciding an
 * exact role-to-endpoint permission matrix across all 44 entities wasn't
 * part of what was asked, and guessing one would be riskier than leaving
 * it as a documented follow-up. Today, authentication (any valid role) is
 * required; authorization is enforced only client-side (sidebar
 * visibility), same as moduleConfig.js's hasRole().
 */
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Authentication required.', code: 'UNAUTHENTICATED' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.sub, email: payload.email, role: payload.role, name: payload.name };
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token.', code: 'INVALID_TOKEN' });
  }
}

function requireRole(...allowedRoles) {
  return function roleGate(req, res, next) {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required.', code: 'UNAUTHENTICATED' });
    }
    if (req.user.role === 'ADMIN' || allowedRoles.includes(req.user.role)) {
      return next();
    }
    return res.status(403).json({ message: 'You do not have permission to perform this action.', code: 'FORBIDDEN' });
  };
}

module.exports = { requireAuth, requireRole };

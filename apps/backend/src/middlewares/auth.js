/**
 * Authentication & Role-Based Access Control (RBAC) Middleware
 * Validates JWT tokens and enforces role restrictions (STUDENT, STAFF, ADMIN, WARDEN)
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'sunohostel-super-secret-key-2026';

/**
 * Verifies JWT token attached in Bearer Authorization header
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access Denied: Missing authentication token',
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Access Denied: Invalid or expired token',
      });
    }

    req.user = user; // Attach payload (id, role, roomNumber, email) to request
    next();
  });
};

/**
 * Authorizes access based on allowed user roles
 * Example usage: authorizeRoles('ADMIN', 'WARDEN')
 */
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Action requires one of the following roles: [${allowedRoles.join(', ')}]`,
      });
    }
    next();
  };
};

module.exports = {
  authenticateToken,
  authorizeRoles,
  JWT_SECRET,
};

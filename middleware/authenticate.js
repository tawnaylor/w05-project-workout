const { getMissingOAuthSettings } = require('../config/oauth');

const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated && req.isAuthenticated()) return next();
  return res.status(401).json({ message: 'Sign in with GitHub at /auth/github before writing data' });
};

const requireOAuth = (req, res, next) => {
  const missingVariables = getMissingOAuthSettings();
  if (missingVariables.length === 0) {
    return next();
  }
  return res.status(503).json({
    message: 'GitHub OAuth is not configured. Set the missing environment variables and restart the service.',
    missingVariables
  });
};

module.exports = { isAuthenticated, requireOAuth };
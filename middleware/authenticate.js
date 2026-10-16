const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated && req.isAuthenticated()) return next();
  return res.status(401).json({ message: 'Sign in with GitHub at /auth/github before writing data' });
};

const requireOAuth = (req, res, next) => {
  if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET && process.env.GITHUB_CALLBACK_URL) {
    return next();
  }
  return res.status(503).json({ message: 'GitHub OAuth is not configured' });
};

module.exports = { isAuthenticated, requireOAuth };
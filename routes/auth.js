const router = require('express').Router();
const passport = require('passport');
const { requireOAuth } = require('../middleware/authenticate');

router.get('/github', requireOAuth, (req, res, next) => {
  // #swagger.tags = ['Authentication']
  // #swagger.summary = 'Start GitHub sign-in'
  // #swagger.responses[302] = { description: 'Redirect to GitHub authorization' }
  // #swagger.responses[503] = { description: 'GitHub OAuth is not configured' }
  passport.authenticate('github', { scope: ['user:email'] })(req, res, next);
});

router.get(
  '/github/callback',
  requireOAuth,
  passport.authenticate('github', { failureRedirect: '/api-docs' }),
  (req, res) => {
    // #swagger.tags = ['Authentication']
    // #swagger.summary = 'Complete GitHub sign-in'
    // #swagger.responses[302] = { description: 'Redirect to API documentation after sign-in' }
    res.redirect('/api-docs');
  }
);

router.get('/logout', (req, res, next) => {
  // #swagger.tags = ['Authentication']
  // #swagger.summary = 'Sign out and destroy the current session'
  req.logout((error) => {
    if (error) return next(error);
    return res.status(200).json({ message: 'Signed out' });
  });
});

router.get('/me', (req, res) => {
  // #swagger.tags = ['Authentication']
  // #swagger.summary = 'Get the signed-in player'
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ message: 'Not signed in' });
  }
  const { _id, username, displayName, email, level, totalXp } = req.user;
  return res.status(200).json({ id: _id, username, displayName, email, level, totalXp });
});

module.exports = router;
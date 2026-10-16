const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const { ObjectId } = require('mongodb');
const { getDb } = require('../db/connect');

if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET && process.env.GITHUB_CALLBACK_URL) {
  passport.use(new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const players = getDb().collection('players');
        let player = await players.findOne({ githubId: profile.id });
        if (!player) {
          const baseUsername = profile.username || `github-${profile.id}`;
          let username = baseUsername.slice(0, 30);
          if (await players.findOne({ username })) {
            username = `${baseUsername.slice(0, 20)}-${profile.id.slice(-8)}`;
          }
          const doc = {
            username,
            displayName: profile.displayName || baseUsername,
            email: profile.emails?.[0]?.value || null,
            githubId: profile.id,
            avatarUrl: profile.photos?.[0]?.value || null,
            totalXp: 0,
            level: 1,
            createdAt: new Date(),
            createdBy: null
          };
          const result = await players.insertOne(doc);
          player = { ...doc, _id: result.insertedId };
        }
        return done(null, player);
      } catch (error) {
        return done(error);
      }
    }
  ));
}

passport.serializeUser((player, done) => done(null, player._id.toString()));

passport.deserializeUser(async (id, done) => {
  try {
    const player = await getDb().collection('players').findOne({ _id: new ObjectId(id) });
    return done(null, player || false);
  } catch (error) {
    return done(error);
  }
});
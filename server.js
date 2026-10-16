require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const swaggerUi = require('swagger-ui-express');
const swaggerFile = require('./swagger.json');
const { initDb } = require('./db/connect');
require('./config/passport');

const app = express();
const port = process.env.PORT || 3000;

app.set('trust proxy', 1);
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

const start = async () => {
  if (!process.env.MONGODB_URI || !process.env.DB_NAME || !process.env.SESSION_SECRET) {
    throw new Error('MONGODB_URI, DB_NAME, and SESSION_SECRET must be configured');
  }
  await initDb();
  app.use(session({
    name: 'workoutquest.sid',
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI, dbName: process.env.DB_NAME }),
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7
    }
  }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));
  app.use('/', require('./routes'));
  app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  });
  app.listen(port, () => console.log(`WorkoutQuest API listening on port ${port}`));
};

if (require.main === module) {
  start().catch((error) => {
    console.error('Failed to start WorkoutQuest API:', error.message);
    process.exit(1);
  });
}

module.exports = { app, start };
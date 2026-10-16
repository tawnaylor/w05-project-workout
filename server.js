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

const swaggerCustomCss = `
  .swagger-ui { background: #f4f7f1; color: #25372f; }
  .swagger-ui .topbar { background: #183b30; border-bottom: 4px solid #a8cc62; }
  .swagger-ui .topbar-wrapper .link { color: #f4f7f1; }
  .swagger-ui .info .title { color: #183b30; }
  .swagger-ui .info .description p { color: #43574c; }
  .swagger-ui .scheme-container { background: #e6efe4; box-shadow: 0 1px 3px #183b3020; }
  .swagger-ui .opblock-tag { color: #183b30; border-bottom-color: #c7d7c5; }
  .swagger-ui .opblock.opblock-get { background: #eaf4ef; border-color: #278265; }
  .swagger-ui .opblock.opblock-post { background: #f0f5e5; border-color: #799b3d; }
  .swagger-ui .opblock.opblock-put { background: #fff3e8; border-color: #d78343; }
  .swagger-ui .opblock.opblock-delete { background: #fff0ed; border-color: #d86d5a; }
  .swagger-ui .btn.execute { background: #24765b; border-color: #24765b; color: #fff; }
  .swagger-ui .btn.execute:hover { background: #185941; }
`;

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
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerFile, { customCss: swaggerCustomCss }));
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
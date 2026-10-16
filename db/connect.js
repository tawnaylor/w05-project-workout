const { MongoClient } = require('mongodb');

let client;
let db;

const initDb = async () => {
  if (db) return db;
  client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  db = client.db(process.env.DB_NAME);
  await Promise.all([
    db.collection('players').createIndex({ username: 1 }, { unique: true }),
    db.collection('players').createIndex(
      { email: 1 },
      { unique: true, partialFilterExpression: { email: { $type: 'string' } } }
    ),
    db.collection('players').createIndex(
      { githubId: 1 },
      { unique: true, partialFilterExpression: { githubId: { $type: 'string' } } }
    )
  ]);
  return db;
};

const getDb = () => {
  if (!db) throw new Error('Database not initialized');
  return db;
};

module.exports = { initDb, getDb };
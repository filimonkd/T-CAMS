const mongoose = require('mongoose');

/**
 * Shared setup for the DB-backed suite.
 *
 * Uses a real MongoDB rather than mongodb-memory-server: that package
 * downloads a mongod binary on first run, which adds a network dependency
 * at test time and is blocked on some networks. CI supplies Mongo as a
 * service container instead (see .github/workflows/ci.yml), which is
 * deterministic and needs no download.
 *
 * Locally: run a Mongo on INTEGRATION_MONGODB_URI (default below), or skip
 * this suite - `npm test` stays DB-free and covers the business logic.
 */
const INTEGRATION_URI =
  process.env.INTEGRATION_MONGODB_URI || 'mongodb://127.0.0.1:27017/tcams-integration';

async function connect() {
  mongoose.set('strictQuery', true);
  // Fail fast rather than buffering for 10s when nothing is listening -
  // a missing database should report itself immediately.
  await mongoose.connect(INTEGRATION_URI, { serverSelectionTimeoutMS: 5000 });
}

async function disconnect() {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
}

/** Empties every collection between tests, keeping indexes. */
async function truncate() {
  const { collections } = mongoose.connection;
  await Promise.all(Object.values(collections).map((collection) => collection.deleteMany({})));
}

module.exports = { INTEGRATION_URI, connect, disconnect, truncate };

const Counter = require('../models/Counter');

/**
 * Atomically increments and returns the next sequence number for `sequenceName`.
 * Uses findOneAndUpdate with upsert so concurrent callers never receive the
 * same number (the increment happens server-side in MongoDB).
 */
async function getNextSequenceValue(sequenceName) {
  const counter = await Counter.findOneAndUpdate(
    { _id: sequenceName },
    { $inc: { seq: 1 } },
    { new: true, upsert: true },
  );
  return counter.seq;
}

/**
 * Returns a formatted, human-readable code such as "VEN-00001".
 */
async function getNextSequenceCode(sequenceName, { prefix, padLength = 5 } = {}) {
  const value = await getNextSequenceValue(sequenceName);
  const padded = String(value).padStart(padLength, '0');
  return prefix ? `${prefix}-${padded}` : padded;
}

module.exports = { getNextSequenceValue, getNextSequenceCode };

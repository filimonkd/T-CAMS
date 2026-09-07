const mongoose = require('mongoose');
const { getNextSequenceCode } = require('../../services/sequenceService');

const bookCardSchema = new mongoose.Schema(
  {
    condition: {
      type: String,
      enum: ['GOOD', 'FAIR', 'POOR', 'DAMAGED'],
      default: 'GOOD',
    },
    acquiredDate: { type: Date, default: Date.now },
    lastInspectedDate: { type: Date },
    notes: { type: String },
  },
  { _id: false },
);

const bookSchema = new mongoose.Schema(
  {
    code: { type: String, unique: true },
    catalogId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    author: { type: String },
    category: { type: String },
    bookCard: { type: bookCardSchema, default: () => ({}) },
    status: {
      type: String,
      enum: ['AVAILABLE', 'ON_LOAN', 'RESERVED', 'IN_BINDING', 'RETIRED'],
      default: 'AVAILABLE',
    },
  },
  { timestamps: true },
);

bookSchema.pre('save', async function assignCode(next) {
  if (!this.code) {
    this.code = await getNextSequenceCode('book', { prefix: 'BK' });
  }
  next();
});

module.exports = mongoose.model('Book', bookSchema);

const mongoose = require('mongoose');

const courseOutlineSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    version: { type: String, required: true },
    content: { type: String, required: true },
    status: {
      type: String,
      enum: ['DRAFT', 'APPROVED', 'ARCHIVED'],
      default: 'DRAFT',
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('CourseOutline', courseOutlineSchema);

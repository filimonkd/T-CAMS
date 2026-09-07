const Learner = require('../models/registrar/Learner');
const Enrollment = require('../models/registrar/Enrollment');
const Section = require('../models/supporting/Section');
const {
  ensure,
  ensureExists,
  ensureCapacityAvailable,
  ensureStatusTransitionAllowed,
} = require('./guardService');

/**
 * ACAD-007: Enroll Learner into Section.
 * Blocked when the section is not open, the learner is already actively
 * enrolled, or the section is at capacity.
 */
async function enrollLearner(learnerId, sectionId) {
  const [learner, section] = await Promise.all([
    Learner.findById(learnerId),
    Section.findById(sectionId),
  ]);
  ensureExists(learner, 'Learner');
  ensureExists(section, 'Section');
  ensure(section.status === 'OPEN', 'Section is not open for enrollment.', 'SECTION_NOT_OPEN');
  ensureCapacityAvailable(section.enrolledCount, section.capacity, 'Section');

  const existing = await Enrollment.findOne({ learner: learner._id, section: section._id, status: 'ENROLLED' });
  ensure(!existing, 'Learner is already enrolled in this section.', 'DUPLICATE_ENROLLMENT');

  const enrollment = await Enrollment.create({ learner: learner._id, section: section._id });
  section.enrolledCount += 1;
  await section.save();

  return enrollment;
}

/**
 * Withdraws a learner from a section (releases one seat of capacity back).
 */
async function withdrawEnrollment(enrollmentId) {
  const enrollment = await Enrollment.findById(enrollmentId);
  ensureExists(enrollment, 'Enrollment');
  ensureStatusTransitionAllowed(enrollment.status, ['ENROLLED'], 'WITHDRAWN');

  const section = await Section.findById(enrollment.section);
  ensureExists(section, 'Section');

  enrollment.status = 'WITHDRAWN';
  enrollment.withdrawnAt = new Date();
  await enrollment.save();

  section.enrolledCount = Math.max(0, section.enrolledCount - 1);
  await section.save();

  return enrollment;
}

module.exports = { enrollLearner, withdrawEnrollment };

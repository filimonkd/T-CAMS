const Book = require('../models/library/Book');
const Loan = require('../models/library/Loan');
const LoanRequest = require('../models/library/LoanRequest');
const BookReservation = require('../models/library/BookReservation');
const BindingRequest = require('../models/library/BindingRequest');
const Fine = require('../models/library/Fine');
const {
  ensure,
  ensureExists,
  transitionStatus,
  assertNoOverdueLoans,
  assertBookNotDamaged,
  assertReservationLimit,
  assertDuplicateCatalogEntry,
} = require('./guardService');

const LOAN_PERIOD_DAYS = 14;
const MAX_RESERVATION_SLOT_HOURS = 2;
const FINE_RATE_PER_DAY = 0.5;

function daysBetween(from, to) {
  return Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
}

async function countOverdueLoans(learnerId) {
  const now = new Date();
  return Loan.countDocuments({ learner: learnerId, status: 'ACTIVE', dueAt: { $lt: now } });
}

// UC-LIB-900: Add Book to Catalog (blocked on a duplicate catalogId).
async function addBookToCatalog(bookData) {
  const existing = await Book.findOne({ catalogId: bookData.catalogId });
  assertDuplicateCatalogEntry(existing);
  return Book.create(bookData);
}

// UC-LIB-902: Issue Loan (blocked by outstanding overdue loans or a damaged book).
async function issueLoan(bookId, learnerId, loanRequestId) {
  const book = await Book.findById(bookId);
  ensureExists(book, 'Book');
  assertBookNotDamaged(book);
  ensure(book.status === 'AVAILABLE', 'Book is not available for loan.', 'BOOK_NOT_AVAILABLE');

  const overdueCount = await countOverdueLoans(learnerId);
  assertNoOverdueLoans(overdueCount, 'Learner');

  const issuedAt = new Date();
  const dueAt = new Date(issuedAt.getTime() + LOAN_PERIOD_DAYS * 24 * 60 * 60 * 1000);
  const loan = await Loan.create({
    book: book._id,
    learner: learnerId,
    loanRequest: loanRequestId,
    issuedAt,
    dueAt,
  });

  await transitionStatus(book, 'status', ['AVAILABLE'], 'ON_LOAN', 'UC-LIB-902');
  await book.save();

  return loan;
}

// UC-LIB-901: Approve Loan Request -> issues the loan and marks the request fulfilled.
async function approveLoanRequest(loanRequestId) {
  const loanRequest = await LoanRequest.findById(loanRequestId);
  ensureExists(loanRequest, 'Loan request');
  await transitionStatus(loanRequest, 'status', ['PENDING'], 'APPROVED', 'UC-LIB-901');

  const loan = await issueLoan(loanRequest.book, loanRequest.learner, loanRequest._id);

  await transitionStatus(loanRequest, 'status', ['APPROVED'], 'FULFILLED', 'UC-LIB-901');
  await loanRequest.save();

  return loan;
}

// UC-LIB-902 (UC-900-02-02): Return Loan. Auto-calculates a Fine when overdue.
async function returnLoan(loanId) {
  const loan = await Loan.findById(loanId);
  ensureExists(loan, 'Loan');
  await transitionStatus(loan, 'status', ['ACTIVE'], 'RETURNED', 'UC-LIB-902');
  loan.returnedAt = new Date();
  await loan.save();

  const book = await Book.findById(loan.book);
  ensureExists(book, 'Book');
  await transitionStatus(book, 'status', ['ON_LOAN'], 'AVAILABLE', 'UC-LIB-902');
  await book.save();

  let fine = null;
  if (loan.returnedAt > loan.dueAt) {
    const overdueDays = daysBetween(loan.dueAt, loan.returnedAt);
    fine = await Fine.create({
      loan: loan._id,
      learner: loan.learner,
      overdueDays,
      amount: Number((overdueDays * FINE_RATE_PER_DAY).toFixed(2)),
    });
  }

  return { loan, fine };
}

// UC-LIB-903: Reserve Book Slot (max 2-hour slot, blocked at 2 active reservations).
async function reserveBook(bookId, learnerId, slotStart, slotEnd) {
  ensure(slotEnd > slotStart, 'Reservation slot end must be after slot start.', 'INVALID_SLOT');
  const slotHours = (slotEnd.getTime() - slotStart.getTime()) / (1000 * 60 * 60);
  ensure(
    slotHours <= MAX_RESERVATION_SLOT_HOURS,
    `Reservation slot cannot exceed ${MAX_RESERVATION_SLOT_HOURS} hours.`,
    'SLOT_TOO_LONG',
  );

  const book = await Book.findById(bookId);
  ensureExists(book, 'Book');
  ensure(book.status === 'AVAILABLE', 'Book is not available for reservation.', 'BOOK_NOT_AVAILABLE');

  const activeReservationCount = await BookReservation.countDocuments({ learner: learnerId, status: 'ACTIVE' });
  assertReservationLimit(activeReservationCount);

  return BookReservation.create({ book: bookId, learner: learnerId, slotStart, slotEnd });
}

async function cancelReservation(reservationId) {
  const reservation = await BookReservation.findById(reservationId);
  ensureExists(reservation, 'Reservation');
  await transitionStatus(reservation, 'status', ['ACTIVE'], 'CANCELLED');
  await reservation.save();
  return reservation;
}

// UC-LIB-904: Submit Binding Request. Book moves out of circulation while bound.
async function requestBinding(bookId, reason) {
  const book = await Book.findById(bookId);
  ensureExists(book, 'Book');
  ensure(book.status === 'AVAILABLE', 'Only an available book can be sent for binding.', 'BOOK_NOT_AVAILABLE');

  const bindingRequest = await BindingRequest.create({ book: bookId, reason });
  await transitionStatus(book, 'status', ['AVAILABLE'], 'IN_BINDING', 'UC-LIB-904');
  await book.save();

  return bindingRequest;
}

async function completeBinding(bindingRequestId) {
  const bindingRequest = await BindingRequest.findById(bindingRequestId);
  ensureExists(bindingRequest, 'Binding request');
  await transitionStatus(bindingRequest, 'status', ['REQUESTED', 'IN_PROGRESS'], 'COMPLETED', 'UC-LIB-904');
  bindingRequest.completedAt = new Date();
  await bindingRequest.save();

  const book = await Book.findById(bindingRequest.book);
  ensureExists(book, 'Book');
  await transitionStatus(book, 'status', ['IN_BINDING'], 'AVAILABLE', 'UC-LIB-904');
  await book.save();

  return bindingRequest;
}

// UC-LIB-905: Fine payment/waiver.
async function payFine(fineId) {
  const fine = await Fine.findById(fineId);
  ensureExists(fine, 'Fine');
  await transitionStatus(fine, 'status', ['UNPAID'], 'PAID', 'UC-LIB-905');
  await fine.save();
  return fine;
}

async function waiveFine(fineId) {
  const fine = await Fine.findById(fineId);
  ensureExists(fine, 'Fine');
  await transitionStatus(fine, 'status', ['UNPAID'], 'WAIVED', 'UC-LIB-905');
  await fine.save();
  return fine;
}

// UC-LIB-906: Overdue report - Loans still ACTIVE past their due date.
async function getOverdueReport() {
  const now = new Date();
  const overdueLoans = await Loan.find({ status: 'ACTIVE', dueAt: { $lt: now } })
    .populate('book')
    .populate('learner')
    .lean();

  return overdueLoans.map((loan) => ({
    ...loan,
    overdueDays: daysBetween(loan.dueAt, now),
  }));
}

module.exports = {
  LOAN_PERIOD_DAYS,
  MAX_RESERVATION_SLOT_HOURS,
  FINE_RATE_PER_DAY,
  addBookToCatalog,
  issueLoan,
  approveLoanRequest,
  returnLoan,
  reserveBook,
  cancelReservation,
  requestBinding,
  completeBinding,
  payFine,
  waiveFine,
  getOverdueReport,
};

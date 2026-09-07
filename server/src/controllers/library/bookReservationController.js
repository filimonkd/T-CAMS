const BookReservation = require('../../models/library/BookReservation');
const { handleGuardError } = require('../crudControllerFactory');
const { reserveBook, cancelReservation } = require('../../services/libraryService');

/**
 * Reservations are only created/cancelled through the guarded libraryService
 * workflow so the 2-hour slot rule and the 2-active-reservation limit can
 * never be bypassed.
 */
const controller = {
  async getAll(req, res, next) {
    try {
      const reservations = await BookReservation.find().populate('book').populate('learner');
      res.json(reservations);
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const reservation = await BookReservation.findById(req.params.id).populate('book').populate('learner');
      if (!reservation) {
        return res.status(404).json({ message: 'Reservation not found.' });
      }
      res.json(reservation);
    } catch (err) {
      next(err);
    }
  },

  // UC-LIB-903: Reserve Book Slot.
  async create(req, res, next) {
    try {
      const { bookId, learnerId, slotStart, slotEnd } = req.body;
      const reservation = await reserveBook(bookId, learnerId, new Date(slotStart), new Date(slotEnd));
      res.status(201).json(reservation);
    } catch (err) {
      handleGuardError(err, res, next);
    }
  },

  async cancel(req, res, next) {
    try {
      const reservation = await cancelReservation(req.params.id);
      res.json(reservation);
    } catch (err) {
      handleGuardError(err, res, next);
    }
  },
};

module.exports = controller;

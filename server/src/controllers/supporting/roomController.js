const Room = require('../../models/supporting/Room');
const { createCrudController, handleGuardError } = require('../crudControllerFactory');
const { ensureRoomAvailable } = require('../../services/guardService');

const controller = createCrudController(Room);

// FAC-002: Book Room for Session (blocked if room is not available).
controller.book = async function book(req, res, next) {
  try {
    const room = await Room.findById(req.params.id);
    ensureRoomAvailable(room);

    room.status = 'BOOKED';
    await room.save();
    res.json(room);
  } catch (err) {
    handleGuardError(err, res, next);
  }
};

// FAC-004: Release Room Booking.
controller.release = async function release(req, res, next) {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found.' });
    }
    room.status = 'AVAILABLE';
    await room.save();
    res.json(room);
  } catch (err) {
    next(err);
  }
};

module.exports = controller;

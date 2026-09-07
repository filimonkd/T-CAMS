const BindingRequest = require('../../models/library/BindingRequest');
const { handleGuardError } = require('../crudControllerFactory');
const { requestBinding, completeBinding } = require('../../services/libraryService');

const controller = {
  async getAll(req, res, next) {
    try {
      const requests = await BindingRequest.find().populate('book');
      res.json(requests);
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const request = await BindingRequest.findById(req.params.id).populate('book');
      if (!request) {
        return res.status(404).json({ message: 'Binding request not found.' });
      }
      res.json(request);
    } catch (err) {
      next(err);
    }
  },

  // UC-LIB-904: Submit Binding Request.
  async create(req, res, next) {
    try {
      const { bookId, reason } = req.body;
      const bindingRequest = await requestBinding(bookId, reason);
      res.status(201).json(bindingRequest);
    } catch (err) {
      handleGuardError(err, res, next);
    }
  },

  async complete(req, res, next) {
    try {
      const bindingRequest = await completeBinding(req.params.id);
      res.json(bindingRequest);
    } catch (err) {
      handleGuardError(err, res, next);
    }
  },
};

module.exports = controller;

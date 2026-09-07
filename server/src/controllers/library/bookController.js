const Book = require('../../models/library/Book');
const { createCrudController, handleGuardError } = require('../crudControllerFactory');
const { addBookToCatalog } = require('../../services/libraryService');

const controller = createCrudController(Book);

// LIB-001: Add Book to Catalog (blocked on a duplicate catalogId).
controller.create = async function create(req, res, next) {
  try {
    const book = await addBookToCatalog(req.body);
    res.status(201).json(book);
  } catch (err) {
    handleGuardError(err, res, next);
  }
};

module.exports = controller;

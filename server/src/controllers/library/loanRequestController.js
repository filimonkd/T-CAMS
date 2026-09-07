const LoanRequest = require('../../models/library/LoanRequest');
const { createCrudController, handleGuardError } = require('../crudControllerFactory');
const { approveLoanRequest } = require('../../services/libraryService');

const controller = createCrudController(LoanRequest);

// LIB-002: Approve Loan Request - issues the loan and marks the request fulfilled.
controller.approve = async function approve(req, res, next) {
  try {
    const loan = await approveLoanRequest(req.params.id);
    res.json(loan);
  } catch (err) {
    handleGuardError(err, res, next);
  }
};

module.exports = controller;

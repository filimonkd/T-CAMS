const { login } = require('../services/authService');
const { handleGuardError } = require('./crudControllerFactory');

const controller = {
  // POST /api/auth/login
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await login(email, password);
      res.json(result);
    } catch (err) {
      handleGuardError(err, res, next);
    }
  },
};

module.exports = controller;

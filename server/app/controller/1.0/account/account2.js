const SKError = require('~server/module/errorHandler/SKError');

const controller = (req, res, next) => {
  try {
    // throw new SKError('E001001');
    res.send('account2.js');
  } catch (e) {
    next(e);
  }
};

module.exports = controller;

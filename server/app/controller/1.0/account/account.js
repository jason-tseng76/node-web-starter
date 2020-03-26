const SKError = require('~server/module/errorHandler/SKError');

const controller = (req, res, next) => {
  try {
    // throw new SKError('E001001');
    if (res.locals.__jwtError) throw res.locals.__jwtError;
    console.log(res.locals.__token);
    res.send('account.js');
  } catch (e) {
    next(e);
  }
};

module.exports = controller;

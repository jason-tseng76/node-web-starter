const jwtoken = require('./jwtoken');

module.exports = (tokenName = 'jt') => {
  const mw = (req, res, next) => {
    if (res.locals.__jwtError) {
      next();
      return;
    }

    const payload = res.locals.__payload;

    next();
  };
  return mw;
};

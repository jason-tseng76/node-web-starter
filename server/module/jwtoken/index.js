const jwt = require('./jwtoken');
const parseMW = require('./parseMiddleWare');
const refreshMW = require('./refreshMiddleWare');

module.exports = {
  sign: jwt.sign,
  verify: jwt.verify,
  middleware: {
    parse: parseMW,
    refresh: refreshMW,
  },
};

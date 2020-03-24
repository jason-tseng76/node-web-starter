const jwt = require('jsonwebtoken');
const config = require('~server/config');
const SKError = require('~server/module/errorHandler/SKError');

const fn = {};
module.exports = fn;

fn.sign = ({ payload, secret = config.JWT_SECRET, tokenlife = '7d' }) => {
  const token = jwt.sign(payload, secret, { expiresIn: tokenlife });
  return token;
};

// 解析JWT token
fn.verify = (token = '', secret = config.JWT_SECRET) => {
  try {
    if (token === '') {
      const e = new Error('JsonWebTokenError');
      e.name = 'JsonWebTokenError';
      throw e;
    }
    const decoded = jwt.verify(token, secret);
    return decoded;
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.message === 'JsonWebTokenError') {
      throw new SKError('E001004');
    }
    if (err.name === 'TokenExpiredError') {
      throw new SKError('E001005');
    }
  }
  return '';
};

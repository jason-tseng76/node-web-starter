const jsonwebtoken = require('jsonwebtoken');
const config = require('~server/config');
const SKError = require('~server/module/errorHandler/SKError');

const jwt = {};

/**
 * 說明：
 * 生成jwt token
 *
 * 參數：
 * @param {Object} options - 參數
 * @param {Object} options.payload - 要被編碼的物件
 * @param {String} options.secret - jwt的secret
 * @param {(String|Number)} options.tokenlife - token的存活時間
 * @returns {String} jwt token
*/
jwt.sign = ({ payload, secret = config.JWT_SECRET, tokenlife = '7d' }) => {
  const token = jsonwebtoken.sign(payload, secret, { expiresIn: tokenlife });
  return token;
};

/**
 * 解析jwt token，解析錯誤會throw SKError。
 * E001004=解析錯誤，E001005=過期。
 *
 * @param {String} token - jwt token
 * @param {String} secret - jwt的secret
 * @returns {Object} payload
 */
jwt.verify = (token = '', secret = config.JWT_SECRET) => {
  try {
    if (token === '') {
      const e = new Error('JsonWebTokenError');
      e.name = 'JsonWebTokenError';
      throw e;
    }
    const decoded = jsonwebtoken.verify(token, secret);
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

module.exports = jwt;

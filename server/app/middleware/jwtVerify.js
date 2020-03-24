const jwt = require('~root/server/module/jwt');

/**
 * 解析jwt token的middleware，
 * 將token轉成payload放到res.locals.__payload裡。
 * 如果有錯誤，錯誤會被放到res.locals.__jwtError裡。
 * @param {String=} tokenName jwt存在cookies裡的變數名稱
 * @returns {Function} Express middleware
*/
const jwtVerify = (tokenName) => {
  const mw = (req, res, next) => {
    let token = '';
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
      token = req.headers.authorization.split(' ')[1] || '';
    }
    if (token === '' && tokenName) {
      token = req.signedCookies[tokenName] || req.cookies[tokenName] || '';
    }

    res.locals.__token = token;
    // res.set('Authorization', 'Bearer bbbbbb');
    try {
      const payload = jwt.verify(token);
      res.locals.__payload = payload;
    } catch (e) {
      // res.locals.__jwtError = e.toLang(res.locals.__lang || 'zh');
      res.locals.__jwtError = e;
    }

    next();
  };
  return mw;
};

module.exports = jwtVerify;

const jwt = require('~root/server/module/jwt');

/**
 * 解析jwt token的middleware，會優先檢查header裡的Authorization，再檢查cookies。即使header的token錯誤，也不會檢查cookies，除非header裡沒有Authorization。
 *
 * 解析後的payload會放到`res.locals.__payload`裡。
 * 如果解析錯誤，錯誤會被放到`res.locals.__jwtError`裡。
 *
 * @param {String=} tokenName - jwt存在cookies裡的變數名稱，如果沒有值，就不檢查cookies
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

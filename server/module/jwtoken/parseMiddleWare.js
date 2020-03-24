const jwtoken = require('./jwtoken');
/*
  將token轉成payload放到res.locals.__payload裡
  如果有錯誤，也放到res.locals.__jwtError裡
*/
module.exports = (tokenName = 'jt') => {
  const mw = (req, res, next) => {
    let token = '';
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
      token = req.headers.authorization.split(' ')[1] || '';
    }
    if (token === '') {
      token = req.signedCookies[tokenName] || req.cookies[tokenName] || '';
    }

    res.locals.__token = token;
    // res.set('Authorization', 'Bearer bbbbbb');
    try {
      const payload = jwtoken.verify(token);
      res.locals.__payload = payload;
    } catch (e) {
      // res.locals.__jwtError = e.toLang(res.locals.__lang || 'zh');
      res.locals.__jwtError = e;
    }

    next();
  };
  return mw;
};

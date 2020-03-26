const jwt = require('~root/server/module/jwt');
const SKError = require('~server/module/errorHandler/SKError');
const AccessToken = require('~server/app/model/access_token');
/**
 * 解析jwt token的middleware，會優先檢查header裡的Authorization，再檢查cookies。即使header的token錯誤，也不會檢查cookies，除非header裡沒有Authorization。
 *
 * 解析後的payload會放到`res.locals.__payload`裡。
 * 如果解析錯誤，錯誤會被放到`res.locals.__jwtError`裡。
 *
 * 若是`autoRefresh=true`，會驗證該token是否已經被refresh過，已經被refresh過的token會在15秒後完全失效(無法再被refresh)。
 * 新的token會在response header的 {"Authorization":"Bearer new_token"}} 回傳。
 * 新的token會繼承舊token的payload以及生命長度。
 *
 * - 參數:
 *  - cookieName: jwt存在cookies裡的變數名稱，如果沒有值，就不檢查cookies
 *  - autoRefresh: token過期後是否自動在response header裡給予新的token，預設true
 *  - secret: jwt加密的secret
 *
 * @param {Object} options - 參數
 * @param {String} options.cookieName - jwt存在cookies裡的變數名稱，如果沒有值，就不檢查cookies
 * @param {Boolean=} options.autoRefresh - token過期後是否自動在response header裡給予新的token，預設true
 * @param {String} options.secret - jwt加密的secret，若是沒有，就會用預設值
 * @returns {Function} Express middleware
*/
const jwtAutoRefresh = ({ cookieName, autoRefresh = true, secret } = {}) => {
  const mw = async (req, res, next) => {
    let token = '';
    // 從header取得token
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
      token = req.headers.authorization.split(' ')[1] || '';
    }
    // 如果header沒有token而cookieName有值，就檢查cookies
    if (token === '' && cookieName) {
      token = req.signedCookies[cookieName] || req.cookies[cookieName] || '';
    }
    // 開發模式下允許用?access_token帶入
    if (token === '' && process.env.APP_ENV === 'development') {
      token = req.query.access_token || '';
    }

    try {
      const payload = jwt.verify(token, secret, { ignoreExpiration: true });
      const nowtime = Math.floor((new Date()).getTime() / 1000);
      // 如果token過期
      if (payload.exp <= nowtime) {
        if (!autoRefresh) throw new SKError('E001005');

        const oldAccessToken = await AccessToken.findOne({ access_token: token }).lean().exec();
        if (!oldAccessToken) throw new SKError('E001005');
        if (oldAccessToken.refreshAt && oldAccessToken.refreshAt < (nowtime - 15) * 1000) throw new SKError('E001005');

        // 取得原本token的生命週期
        const tokenlife = payload.exp - payload.iat;
        payload.iat = nowtime;
        payload.exp = nowtime + tokenlife;
        // 重新sign一個新的token
        token = jwt.sign({ payload });
        res.set('Authorization', `Bearer ${token}`);

        await AccessToken.updateOne({ access_token: oldAccessToken.access_token }, { refreshAt: nowtime * 1000 }).exec();
        const newAccessToken = new AccessToken({ access_token: token, account_id: oldAccessToken.account_id });
        await newAccessToken.save();
      }
      res.locals.__payload = payload;
    } catch (e) {
      res.locals.__jwtError = e;
    } finally {
      res.locals.__token = token;
    }

    next();
  };
  return mw;
};

// let timer = 0;
// // 每小時清掉一次舊的已經refresh過的access_token
// const clearOldAccessToken = async () => {
//   clearTimeout(timer);

//   const nowtime = (new Date()).getTime();
//   await AccessToken.remove({
//     refreshAt: { $exists: true, $lte: nowtime - 30 * 1000 },
//   }).sort('_id').lean().exec();

//   timer = setTimeout(clearOldAccessToken, (60 * 60) * 1000);
// };
// clearOldAccessToken();

module.exports = jwtAutoRefresh;

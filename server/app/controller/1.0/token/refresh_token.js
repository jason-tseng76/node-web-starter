// const RefreshToken = require('~server/app/model/refresh_token');
const AccessToken = require('~server/app/model/access_token');
const SKError = require('~server/module/errorHandler/SKError');
const jwt = require('~server/module/jwt');
const vcheck = require('~server/module/vartool/vcheck');

/**
 * Refresh the token
 * @api {post} /api/v1.0/token/refresh RefreshToken
 * @apiName RefreshToken
 * @apiGroup Token
 * @apiParam {String} refresh_token 登入時取得的refresh_token
 * @apiSuccess {String} access_token 新的access_token
 * @apiSuccess {Number} expires_in access_token有效期限timestamp(seconds)
 * @apiSuccessExample {json} Success-Response:
 * {
 *  "status":"OK",
 *  "data": {
 *    "access_token": "new access_token",
 *    "expires_in": 1234567
 *  }
 * }
 * @apiUse APIError
 */
const controller = async (req, res, next) => {
  try {
    const r_token = vcheck.str(req.body.refresh_token);
    if (!r_token) throw new SKError('E001004');

    // const rs = await RefreshToken.findOne({ token: r_token }).select('account_id').lean().exec();
    // if (!rs) throw new SKError('E001004');
    const oldAccessToken = await AccessToken.findOne({ refresh_token: r_token }).sort('-_id').lean().exec();
    if (!oldAccessToken) throw new SKError('E001004');
    // 已經被revoked
    if (oldAccessToken.revoked) throw new SKError('E001004');

    const nowtime = Math.floor((new Date()).getTime() / 1000);
    const payload = jwt.verify(oldAccessToken.access_token, '', { ignoreExpiration: true });

    // 取得原本token的生命週期
    const tokenlife = payload.exp - payload.iat;
    payload.iat = nowtime;
    payload.exp = nowtime + tokenlife;
    // 重新sign一個新的token
    const token = jwt.sign({ payload });

    const newAccessToken = new AccessToken({
      access_token: token,
      refresh_token: r_token,
    });
    await newAccessToken.save();

    res.json({
      status: 'OK',
      data: {
        access_token: token,
        expires_in: payload.exp,
        // refresh_toekn,
        token_type: 'Bearer',
      },
    });
  } catch (e) {
    next(e);
  }
};

module.exports = controller;

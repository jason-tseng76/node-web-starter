const RefreshToken = require('~server/app/model/refresh_token');
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
    // const g_type = req.body.grant_type; //grant_type=refresh_token

    const rs = await RefreshToken.findOne({ token: r_token }).select('account_id').lean().exec();
    if (!rs) throw new SKError('E001004');

    const token = jwt.sign({
      payload: { id: rs.account_id.toString() },
      tokenlife: '1h',
    });
    const tokendata = jwt.verify(token);

    res.json({
      status: 'OK',
      data: {
        access_token: token,
        expires_in: tokendata.exp,
        // refresh_toekn,
        token_type: 'Bearer',
      },
    });
  } catch (e) {
    next(e);
  }
};

module.exports = controller;

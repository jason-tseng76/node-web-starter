const Account = require('~server/app/model/account');
// const RefreshToken = require('~server/app/model/refresh_token');
const AccessToken = require('~server/app/model/access_token');
const SKError = require('~server/module/errorHandler/SKError');
const jwt = require('~server/module/jwt');
const vutils = require('~server/module/vartool/vutils');

/**
 * Refresh the token
 * @api {post} /api/v1.0/login Login
 * @apiName Login
 * @apiGroup Account
 * @apiParam {String} email 登入的Email
 * @apiSuccess {String} access_token 新的access_token
 * @apiSuccess {Number} expires_in access_token有效期限timestamp(seconds)
 * @apiSuccess {String} refresh_token 用來取得新access_token的refresh_token
 * @apiSuccessExample {json} Success-Response:
 * {
 *  "status":"OK",
 *  "data": {
 *    "access_token": "new access_token",
 *    "refresh_token": "refresh_token",
 *    "expires_in": 1234567
 *  }
 * }
 * @apiUse APIError
 */

const controller = async (req, res, next) => {
  try {
    const email = req.body.email || req.query.email;

    if (!email) throw new SKError('E001006');

    const rs = await Account.findOne({ email }).lean().exec();
    if (!rs) throw new SKError('E001007');

    const refresh_token = vutils.randomStr(5) + vutils.newID();
    const token = jwt.sign({
      payload: { i: rs._id.toString() },
      tokenlife: '1s',
    });
    const tokendata = jwt.verify(token);
    // const ip = req.headers['x-forwarded-for']
    //   || req.connection.remoteAddress
    //   || req.socket.remoteAddress
    //   || req.connection.socket.remoteAddress;

    // const newRefreshToken = new RefreshToken({
    //   token: refresh_token,
    //   account_id: rs._id.toString(),
    //   ip: ip.split(',')[0],
    // });
    // await newRefreshToken.save();

    const newAccessToken = new AccessToken({
      access_token: token,
      account_id: rs._id.toString(),
    });
    await newAccessToken.save();

    res.json({
      status: 'OK',
      data: {
        access_token: token,
        expires_in: tokendata.exp,
        refresh_token,
        token_type: 'Bearer',
      },
    });
  } catch (e) {
    next(e);
  }
};

module.exports = controller;

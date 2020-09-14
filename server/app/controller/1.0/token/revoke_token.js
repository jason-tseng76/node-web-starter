// const RefreshToken = require('~server/app/model/refresh_token');
const AccessToken = require('~server/app/model/access_token');
const vcheck = require('~server/module/vartool/vcheck');
const SKError = require('~server/module/errorHandler/SKError');
/**
 * Revoke token
 * @api {post} /api/v1.0/token/revoke RevokeToken
 * @apiName RevokeToken
 * @apiGroup Token
 * @apiUse AuthBearerHeader
 * @apiParam {String} token 要取消的access_token或refresh_token
 * @apiSuccessExample {json} Success-Response:
 * {
 *  "status":"OK"
 * }
 * @apiUse APIError
 */
const controller = async (req, res, next) => {
  try {
    const r_token = vcheck.str(req.body.token);
    if (!r_token) throw new SKError('E001006');

    // const rs = await RefreshToken.findOne({ token: r_token }).select('_id').lean().exec();
    // if (rs) {
    // await RefreshToken.remove({ token: r_token }).exec();
    // }
    // await AccessToken.remove({ $or: [{ access_token: r_token }, { refresh_token: r_token }] }).exec();
    await AccessToken.update({ $or: [{ access_token: r_token }, { refresh_token: r_token }] }, { revoked: true }).exec();

    res.json({
      status: 'OK',
    });
  } catch (e) {
    next(e);
  }
};

module.exports = controller;

const RefreshToken = require('~server/app/model/refresh_token');
const vcheck = require('~server/module/vartool/vcheck');
const SKError = require('~server/module/errorHandler/SKError');
/**
 * Revoke token
 * @api {post} /api/v1.0/token/revoke RevokeToken
 * @apiName RevokeToken
 * @apiGroup User
 * @apiUse AuthBearerHeader
 * @apiSuccess {String} firstname Firstname of the User.
 * @apiSuccess {String} lastname  Lastname of the User.
 */
const controller = async (req, res, next) => {
  try {
    const r_token = vcheck.str(req.body.token);
    if (!r_token) throw new SKError('E001006');

    // const rs = await RefreshToken.findOne({ token: r_token }).select('_id').lean().exec();
    // if (rs) {
    await RefreshToken.remove({ token: r_token }).exec();
    // }

    res.json({
      status: 'OK',
    });
  } catch (e) {
    next(e);
  }
};

module.exports = controller;

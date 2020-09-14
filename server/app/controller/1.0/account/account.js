// const SKError = require('~server/module/errorHandler/SKError');

const controller = (req, res, next) => {
  try {
    // throw new SKError('E001001');
    if (res.locals.__jwtError) throw res.locals.__jwtError;
    console.log(res.locals.__jwtAccessToken);
    res.send('account.js');
  } catch (e) {
    next(e);
  }
};

module.exports = controller;

// 要Read preference in a transaction must be primary, not: secondaryPreferred
// const Account = require('~server/app/model/account');

// const test = async () => {
//   const session = await Account.startSession();
//   session.startTransaction();
//   try {
//     // const rs = await Account.findOne().session(session);
//     // console.log(rs);
//   } catch (e) {
//     console.log(e);
//     await session.abortTransaction();
//   }
//   // console.log(session);
//   session.endSession();
// };

// test();

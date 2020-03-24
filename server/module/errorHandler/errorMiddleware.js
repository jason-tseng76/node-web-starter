const SKError = require('./SKError');
const event = require('~server/module/event');
// 處理error
// 所有的router或middleware如果next(err)，都會先到這裡來處理
// 這邊負責將錯誤代碼返回前端頁面
module.exports = (err, req, res, next) => {
  if (err) {
    console.log('\x1b[1m\x1b[33m%s\x1b[0m', '===== /module/errorHandler/errorMiddle =====');
    console.log('\x1b[33m');
    console.log(err);
    console.log('\x1b[1m\x1b[33m%s\x1b[0m', '============================================');
    let errmsg = '';
    let httpStatus = 500;
    let code = '500';
    let status = 'ERROR';
    // 判斷err是否為物件
    if (err instanceof Error) {
      if (err instanceof SKError) {
        httpStatus = err.httpStatus || 500;
        errmsg = err.toLang(res.locals.__lang || 'zh').message;
        code = err.code;

        // 把token相關的錯誤獨立出來一個status，方便前端過濾處理
        if (code === 'E001004' || code === 'E001005') status = 'UNAUTHORIZED';
      } else {
        // 如果是原生Error，直接將err.message取出
        errmsg = err.message;

        // 因為是原生Error，可能會是重大錯誤，所以需要回報。
        event.dispatcher.fire(event.type.REPORT_ERROR, err);
      }
    } else {
      errmsg = err;
    }
    res.status(httpStatus).json({
      status,
      message: errmsg,
      code,
    });
  } else {
    next();
  }
};

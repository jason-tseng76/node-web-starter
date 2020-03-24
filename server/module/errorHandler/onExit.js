/*
說明
處理UncaughtExecption，錯誤發生時會拋出事件，外層可以接收這個事件並處理該處理的程序(例如:中斷資料庫)
此模組會在錯誤發生後，呼叫註冊的function，然後結束主程序，或是三秒後直接結束主程序。

範例
require('./module/errorHandler/onExit')((type, err, callback) => {
  console.log(type);
  console.log(err);
  callback(); // 其它程序處理完畢，可以結束主程序
})
*/

let __before;

const exitHandler = (type, err) => {
  if (type !== 'exit') {
    if (type === 'uncaughtException') {
      console.log('\x1b[1m\x1b[41m\x1b[37m%s\x1b[0m', '===== /module/errorHandler/onExit =====');
      console.log('\x1b[1m\x1b[31m%s', type);
      console.log(err);
      console.log('\x1b[1m\x1b[41m\x1b[37m%s\x1b[0m', '=======================================');
    }
    if (__before) {
      // 如果有設定監聽的話，等待監聽程式完成工作後一秒關閉程序
      __before(type, err, () => {
        setTimeout(() => { process.exit(1); }, 1000);
      });
    } else {
      setTimeout(() => { process.exit(1); }, 100);
    }
    // 不管怎樣，三秒後一定要exit (預防監聽程式沒有呼叫callback)
    setTimeout(() => { process.exit(1); }, 3000);
  }
};

process.on('SIGINT', exitHandler.bind(null, 'SIGINT', null));
process.on('SIGTERM', exitHandler.bind(null, 'SIGTERM', null));
process.on('exit', exitHandler.bind(null, 'exit', null));
process.on('uncaughtException', (e) => {
  exitHandler('uncaughtException', e);
});

const beforeExit = (fn) => {
  __before = fn;
};

module.exports = beforeExit;

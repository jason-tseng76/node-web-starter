/* eslint no-console:0, global-require:0 */

// 使用module-alias
require('module-alias/register');

// 決定環境變數
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.APP_ENV = process.env.APP_ENV || 'development';
console.log('\x1b[37m\x1b[44m%s\x1b[0m', `NODE_ENV = ${process.env.NODE_ENV}`);
console.log('\x1b[37m\x1b[44m%s\x1b[0m', `APP_ENV = ${process.env.APP_ENV}`);

const express = require('express');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const skevent = require('~server/module/skevent');

const pkgjson = require('../package.json');

// **********************************
// 引用設定檔
const config = require('./config');
// **********************************

// **********************************
// 設定時區
// Settings.defaultZoneName = 'Asia/Taipei';
// **********************************

const app = express();
let server = null;

// **********************************
// 設定log
const logger = require('~server/module/jlog/logger').init({
  app,
  env: process.env.APP_ENV,
  logPath: path.join('server', 'log'),
});
// **********************************

if (process.env.APP_ENV !== 'development') {
  // **********************************
  // 設定stackdriver，需要 @google-cloud/error-reporting
  // 如果是run在GCP上，projectId與keyFilename參數可忽略
  require('~server/module/jlog/errorReport').init({
    serviceContext: {
      service: pkgjson.name,
      version: process.env.APP_ENV,
    },
    // projectId: 'meshplus',
    // keyFilename: './server/MeshPlus-27b4a8e9ee7a.json',
    reportMode: 'production', // always, never
  });
  // **********************************

  // **********************************
  // 啟動備份到GCS的程序，需要 @google-cloud/storag
  const gcsBackup = require('~server/module/jlog/GCSBackup');
  gcsBackup
    .start({
      logPath: path.join('server', 'log'),
      projectId: 'meshplus',
      keyFilename: './server/MeshPlus-27b4a8e9ee7a.json',
      bucketName: 'mesh_logs',
      remotePath: process.env.APP_ENV === 'production' ? pkgjson.name : `${pkgjson.name}_${process.env.APP_ENV}`,
    })
    .on('error', (e) => {
      logger.error(e);
    })
    .on('warn', (e) => {
      logger.warn(e);
    });
}
// **********************************

// **********************************
// 設定email的smtp
// require('~server/module/emailer').init(config.SMTP);
// **********************************

// **********************************
// 連接DB
const mongoDB = require('~server/module/database/mongo');

mongoDB.createConnect(config.DATABASE.MONGO);
// **********************************

// **********************************
// 程式結束前進行資源清理
// 包括中斷資料庫
const beforeProcessExit = async (e) => {
  if (e.data && e.data.type === 'UNCAUGHT_EXECPTION') skevent.fire({ type: skevent.types.REPORT_ERROR, data: e.data });
  try {
    await Promise.all([
      mongoDB.disconnect(),
      // mySQL.disconnect(),
    ]);
    if (server) server.close();
  } catch (err) {
    console.log('\x1b[1m\x1b[41m\x1b[37m%s\x1b[0m', '===== /index/onExit =====');
    console.log('\x1b[1m\x1b[31m%s', e);
    console.log('\x1b[1m\x1b[41m\x1b[37m%s\x1b[0m', '=========================');
  }
  skevent.fire({ type: skevent.types.PROCESS_EXIT });
};
skevent.on(skevent.types.PROCESS_BEFORE_EXIT, beforeProcessExit);
require('./module/errorHandler/catchOnExit');
// **********************************

// 如果配合nginx，就需要設定trust proxy，否則所有來源ip都會是127.0.0.1
app.set('trust proxy', true);
// 對於express進行基本的安全性保護
app.use(helmet());
// Cookie的middleware，設定signed cookies的key值(有用到signed cookies才會用到)
app.use(cookieParser(config.COOKIE_SECRET));
// 設定bodyParser
// 指定上傳的檔案總大小最大50mb (預設是100kb)，
// 如果這個沒設，有上傳檔案功能時有時會被擋掉
app.use(bodyParser.urlencoded({ extended: false, limit: '50mb' }));
app.use(bodyParser.json({ limit: '50mb' }));
// 設定view engine
app.set('view engine', 'pug');
// 將預設的views目錄設定到root，以方便靈活使用
app.set('views', path.join(__dirname, '..'));
// 關掉view的cache(預設在production時會開啟，建議開啟，但cache時就很麻煩)
app.disable('view cache');

// 掛載APP
require('./app')(app);

server = app.listen(config.PORT, config.IP, () => {
  console.log('\x1b[37m\x1b[44m%s\x1b[0m', `Listening on ${config.IP}, port ${config.PORT}`);
});

const mongoose = require('mongoose');
const config = require('~server/config');

mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useUnifiedTopology', true);

// 依照設定檔開啟db connection
const createConnect = ({ uri, options } = { uri: config.MONGO.uri, options: config.MONGO.options || {} }) => {
  const opts = {
    // autoReconnect: true,
    // reconnectTries: Number.MAX_VALUE,
    // reconnectInterval: 1000,
    socketTimeoutMS: 30000,
    keepAlive: true,
    useNewUrlParser: true,
    ...options,
  };
  mongoose.connect(uri, opts);
};

mongoose.connection.on('error', (err) => {
  // 10秒後丟出錯誤，強制程式重啟
  setTimeout(() => {
    throw err;
  }, 10000);
});
mongoose.connection.on('connected', () => {
  console.log('\x1b[1m\x1b[32m%s\x1b[0m', '========== Mongoose connected ==========');
});
mongoose.connection.on('disconnected', () => {
  console.log('\x1b[1m\x1b[33m%s\x1b[0m', '========== Mongoose disconnected ==========');
});

exports.createConnect = createConnect;
// 中斷所有資料庫連線
exports.disconnect = (callback) => {
  console.log('\x1b[1m\x1b[34m%s\x1b[0m', '========== Mongoose disconnecting ==========');
  mongoose.disconnect(callback);
};

const mongoose = require('mongoose');

const _schema = mongoose.Schema({
  access_token: { type: String, index: true },
  refresh_token: { type: String, index: true },
  account_id: { type: String },
  createdAt: { type: Date, default: Date.now },
  refreshAt: { type: Date, index: true },
});

module.exports = mongoose.model('access_tokens', _schema);

// 移除index方法
// const model = mongoose.model('access_tokens', _schema);
// model.collection.dropIndex({ account_id: 1 });

const mongoose = require('mongoose');

const _schema = mongoose.Schema({
  access_token: { type: String, index: true },
  refresh_token: { type: String, index: true },
  new_access_token: { type: String },
  createdAt: { type: Date, default: Date.now },
  refreshAt: { type: Date, index: true },
  revoked: { type: Boolean },
});

module.exports = mongoose.model('access_tokens', _schema);

// 移除index方法
// const model = mongoose.model('access_tokens', _schema);
// model.collection.dropIndex({ account_id: 1 });

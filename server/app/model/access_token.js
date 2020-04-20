const mongoose = require('mongoose');

const _schema = new mongoose.Schema({
  access_token: { type: String, index: true },
  refresh_token: { type: String, index: true },
  new_access_token: { type: String },
  createdAt: { type: Date, default: Date.now },
  refreshAt: { type: Date, index: true },
  revoked: { type: Boolean },
});

// module.exports = mongoose.model('access_tokens', _schema);
const model = mongoose.model('access_tokens', _schema);
module.exports = model;

// 移除index方法
// model.collection.dropIndex({ account_id: 1 });

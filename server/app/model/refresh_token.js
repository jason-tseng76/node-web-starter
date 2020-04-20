const mongoose = require('mongoose');

const _schema = new mongoose.Schema({
  refresh_token: { type: String, index: true },
  account_id: { type: String, index: true },
  ip: { type: String },
  // useragent: { type: String },
  createdAt: { type: Date, default: Date.now },
});

// module.exports = mongoose.model('refresh_tokens', _schema);
const model = mongoose.model('refresh_tokens', _schema);
module.exports = model;

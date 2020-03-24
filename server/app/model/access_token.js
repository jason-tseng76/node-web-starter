const mongoose = require('mongoose');

const _schema = mongoose.Schema({
  token: { type: String, index: true },
  account_id: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('access_tokens', _schema);

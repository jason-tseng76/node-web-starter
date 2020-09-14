const mongoose = require('mongoose');
const findMany = require('./plugin/findMany');
const paginate = require('./plugin/paginate');
const cursor = require('./plugin/cursor');

const _schema = new mongoose.Schema({
  email: { type: String, index: true },
  pwd: { type: String },
  role: { type: String }, // su, admin, user
  createdAt: { type: Date, default: Date.now },
});

_schema.plugin(findMany);
_schema.plugin(paginate);
_schema.plugin(cursor);

// module.exports = mongoose.model('accounts', _schema);
const model = mongoose.model('accounts', _schema);
module.exports = model;

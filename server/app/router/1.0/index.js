const express = require('express');
const skRateLimit = require('~server/app/middleware/skRatelimit');
const skCors = require('~server/app/middleware/skCors');

const router = express.Router();

// 套用cors
const cors = skCors(['http://localhost:8080']);
router.options('/api/v1.0', cors);
router.use('/api/v1.0', cors);

const limiter1 = skRateLimit({ windowMs: 1000 * 60, max: 5 });
// 套用ratelimit (整個path會被一起算)
router.use('/api/v1.0/account', limiter1);

router.use('/api/v1.0', require('./account'));
router.use(require('./token'));

const apply = (app) => {
  app.use(router);
};

module.exports = apply;

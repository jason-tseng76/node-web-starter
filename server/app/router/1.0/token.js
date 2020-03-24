const express = require('express');

const router = express.Router();

// const rr = require('~server/app/controller/1.0/token/refresh_token');

router.post('/api/v1.0/token/refresh', require('~server/app/controller/1.0/token/refresh_token'));
router.post('/api/v1.0/token/revoke', require('~server/app/controller/1.0/token/revoke_token'));

module.exports = router;

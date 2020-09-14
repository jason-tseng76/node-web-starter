const express = require('express');

const router = express.Router();

// const rr = require('~server/app/controller/1.0/token/refresh_token');

router.post('/token/refresh', require('~server/app/controller/1.0/token/refresh_token'));
router.post('/token/revoke', require('~server/app/controller/1.0/token/revoke_token'));

module.exports = router;

const express = require('express');

const router = express.Router();

router.get('/api/v1.0/account', require('~server/app/controller/1.0/account/account'));
router.get('/api/v1.0/account2', require('~server/app/controller/1.0/account/account2'));

router.get('/api/v1.0/login', require('~server/app/controller/1.0/account/login'));

module.exports = router;

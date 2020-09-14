const express = require('express');
const jwtAutoRefresh = require('~server/app/middleware/jwtAutoRefresh');

const router = express.Router();

router.get('/account', jwtAutoRefresh(), require('~server/app/controller/1.0/account/account'));
router.get('/account2', require('~server/app/controller/1.0/account/account2'));

router.post('/login', require('~server/app/controller/1.0/account/login'));
router.get('/login', require('~server/app/controller/1.0/account/login'));

module.exports = router;

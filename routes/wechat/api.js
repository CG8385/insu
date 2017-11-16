var express = require('express');
var token = require('./token.js');
var router = express.Router();

/* GET home page. */
// router.use('/', ensureAuthenticated);
router.use('/token', token);

module.exports = router;
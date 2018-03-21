var express = require('express');
var router = express.Router();
var config = require('../common.js').config();
var locations = require('../pca.json');


router.get('/', function(req, res, next) {
  res.json(locations);
});

module.exports = router;

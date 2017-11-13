var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    res.json({order: 'My order'});
});

module.exports = router;

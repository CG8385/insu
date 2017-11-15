var express = require('express');
var db = require('../utils/database.js').connection;
var Company = require('../models/company.js')(db);
var router = express.Router();
var Q = require('q');
var logger = require('../utils/logger.js');
var CompanyCatogory = require('../models/companyCatogory.js')(db);
var Policy = require('../models/policy.js')(db);
var LifePolicy = require('../models/life-policy.js')(db);

router.get('/', async function(req, res, next) {
    let c = await Company.findOne({name: '南京平安'}).exec();
    let id = c._id;
    let policy = await Policy.findOne({level4_company: id}).exec();
    res.json(policy);
});


module.exports = router;
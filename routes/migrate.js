var express = require('express');
var db = require('../utils/database.js').connection;
var Promise = require('bluebird');
var Company = require('../models/company.js')(db);
var router = express.Router();
var Q = require('q');
var logger = require('../utils/logger.js');
var iconv = require('iconv-lite');
var CompanyCatogory = require('../models/companyCatogory.js')(db);
var Policy = require('../models/policy.js')(db);
var LifePolicy = require('../models/life-policy.js')(db);
var OrgPolicy = require('../models/org-policy.js')(db);
var Rule = require('../models/rule.js')(db);
var Migrate = require('../models/migrate.js')(db);
var asyncMiddleware = require('../middlewares/asyncMiddleware');
var makePy = require('../utils/pinyin');
var Client = require('../models/client.js')(db);
var Organization = require('../models/organization.js')(db);
var User = Promise.promisifyAll(require('../models/user.js')(db));
var Role = Promise.promisifyAll(require('../models/role.js')(db));

router.get('/rootbranch', asyncMiddleware(async (req, res, next) => {
    let root = new Organization();
    root.name="红叶保险代理总公司";
    root.level="总公司";
    root.save(function(err,data){
        res.json(data);
    })
}));

module.exports = router;
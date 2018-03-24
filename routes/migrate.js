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
var Organization = Promise.promisifyAll(require('../models/organization.js')(db));
var User = Promise.promisifyAll(require('../models/user.js')(db));
var Role = Promise.promisifyAll(require('../models/role.js')(db));
var locations = require('../pca.json');

router.get('/step1', asyncMiddleware(async (req, res, next) => {
    await Organization.removeAsync({name:'红叶保险代理法人机构'});
    await Organization.updateAsync({name:'红叶保险代理有限公司法人机构'}, {level:'一级机构', area_code:'0'});
    let level1 = await Organization.find({name:'红叶保险代理有限公司法人机构'}).exec();
    let level2 = new Organization({name:'江苏省分公司', level:'二级机构', province:'江苏省', area_code:'032'})
    level2 = Promise.promisifyAll(level2);
    await level2.saveAsync();
    level2 = await Organization.findOne({name:'江苏省分公司'}).exec();
    await Organization.updateAsync({name:'苏州分公司'}, {level:'三级机构', province:'江苏省', city:'苏州市', area_code:'03205', parent: level2._id});
    await Organization.updateAsync({name:'徐州分公司'}, {level:'三级机构', province:'江苏省', city:'徐州市', area_code:'03203', parent: level2._id});
    await Organization.updateAsync({name:'徐州睢宁营业部'}, {level:'三级机构', province:'江苏省', city:'徐州市',district:'睢宁县', area_code:'0320324', parent: level2._id});
    let level3 = new Organization({name:'宿迁分公司', level:'三级机构', province:'江苏省', city:'宿迁市', area_code:'03213', parent: level2._id})
    level3 = Promise.promisifyAll(level3);
    await level3.saveAsync();
    level3 = new Organization({name:'连云港分公司', level:'三级机构', province:'江苏省', city:'连云港市', area_code:'03207', parent: level2._id})
    level3 = Promise.promisifyAll(level3);
    await level3.saveAsync();
    level3 = new Organization({name:'南京分公司', level:'三级机构', province:'江苏省', city:'南京市', area_code:'03201', parent: level2._id})
    level3 = Promise.promisifyAll(level3);
    await level3.saveAsync();
    res.json("finish");
}));

router.get('/step2', asyncMiddleware(async (req, res, next) => {
    let level2 = await Organization.findOne({name:'江苏省分公司'}).exec();
    await Organization.updateAsync({name:'苏州分公司'}, {level:'三级机构', parent: level2._id});
    res.json("finish");
}));

module.exports = router;
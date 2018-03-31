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

router.get('/roles', asyncMiddleware(async (req, res, next) => {
    roles = await Role.find({}).exec();
    res.json(roles);
}));

router.get('/set-role', asyncMiddleware(async (req, res, next) => {
    let sellerRole= await Role.findOne({name: '出单员'}).exec();
    let financeRole = await Role.findOne({name: '财务'}).exec();
    let backRole = await Role.findOne({name: '后台录单员'}).exec();
    let adminRole = await Role.findOne({name: '超级管理员'}).exec();
    let r = await User.update({role: '出单员'}, {userrole: sellerRole._id}, {multi: true});
    r = await User.update({role: '财务'}, {userrole: financeRole._id}, {multi: true});
    r = await User.update({role: '后台录单员'}, {userrole: backRole._id}, {multi: true});
    r = await User.update({role: '管理员'}, {userrole: adminRole._id}, {multi: true});
    res.send('done');
}));

//update all life-policies to to-be-reviewed status
router.get('/life-policy-status', asyncMiddleware(async (req, res, next) => {
    r = await LifePolicy.update({},{policy_status:'待审核'},{multi: true});
    res.send('done');
}));

//仅更新超级管理员对寿险的权限,测试用。上线时应根据业务需要来设置
router.get('/life-policy-roles', asyncMiddleware(async (req, res, next) => {
    r = await Role.update({name:'超级管理员'},
    {
        lifePolicy_to_be_reviewed: {
            reject:true,export:true,pay:false,aprove:true,append:true,delete:true,
            view:true,edit:true
        },
        lifePolicy_to_be_paid: {
            export:true,pay:true,aprove:true,append:true,delete:true,
            view:true,edit:true
        },
        lifePolicy_paid: {
            export:true,pay:true,aprove:true,append:true,delete:true,
            view:true,edit:true
        },
        lifePolicy_rejected: {
            export:true,append:true,delete:true,
            view:true,edit:true
        },
    });
    res.send('done');
}));

router.get('/remove-check', asyncMiddleware(async (req, res, next) => {
    r = await Policy.update({policy_status: '已核对'}, {policy_status: '已支付'}, {multi: true});
}));

var locations = require('../pca.json');

router.get('/step1', asyncMiddleware(async (req, res, next) => {
    await Organization.removeAsync({name:'红叶保险代理法人机构'});
    await Organization.updateAsync({name:'红叶保险代理有限公司法人机构'}, {level:'一级机构', area_code:'0'});
    let level1 = await Organization.findOne({name:'红叶保险代理有限公司法人机构'}).exec();
    let level2 = new Organization({name:'江苏省分公司', level:'二级机构', province:'江苏省', area_code:'032', parent: level1._id})
    level2 = Promise.promisifyAll(level2);
    await level2.saveAsync();
    level2 = await Organization.findOne({name:'江苏省分公司'}).exec();
    await Organization.updateAsync({name:'苏州分公司'}, {level:'三级机构', province:'江苏省', city:'苏州市', area_code:'03205', parent: level2._id});
    await Organization.updateAsync({name:'徐州分公司'}, {level:'三级机构', province:'江苏省', city:'徐州市', area_code:'03203', parent: level2._id});
    await Organization.updateAsync({name:'徐州睢宁营业部'}, {name: '徐州睢宁分公司', level:'三级机构', province:'江苏省', city:'徐州市',district:'睢宁县', area_code:'0320324', parent: level2._id});
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
    let level3 = await Organization.findOne({name:'南京分公司'}).exec();
    await Organization.updateAsync({name:'南京溧水营业部'}, {level:'四级机构', province:'江苏省', city:'南京市', area_code:'03201', parent: level3._id});
    await Organization.updateAsync({name:'南京新街口营业部'}, {level:'四级机构', province:'江苏省', city:'南京市', area_code:'03201', parent: level3._id});
    await Organization.updateAsync({name:'南京分公司财险营业部'}, {level:'四级机构', province:'江苏省', city:'南京市', area_code:'03201', parent: level3._id});
    level3 = await Organization.findOne({name:'宿迁分公司'}).exec();
    await Organization.updateAsync({name:'泗洪营业部'}, {level:'四级机构', province:'江苏省', city:'宿迁市', area_code:'03213', parent: level3._id});
    await Organization.updateAsync({name:'宿迁开发区营业部'}, {level:'四级机构', province:'江苏省', city:'宿迁市', area_code:'03213', parent: level3._id});
    await Organization.updateAsync({name:'宿迁宿城营业部'}, {level:'四级机构', province:'江苏省', city:'宿迁市', area_code:'03213', parent: level3._id});
    await Organization.updateAsync({name:'宿迁沭阳营业部'}, {level:'四级机构', province:'江苏省', city:'宿迁市', area_code:'03213', parent: level3._id});
    await Organization.updateAsync({name:'宿迁分公司车险业务部'}, {level:'四级机构', province:'江苏省', city:'宿迁市', area_code:'03213', parent: level3._id});
    level3 = await Organization.findOne({name:'徐州分公司'}).exec();
    await Organization.updateAsync({name:'徐州出单中心'}, {level:'四级机构', province:'江苏省', city:'徐州市', area_code:'03203', parent: level3._id});
    await Organization.updateAsync({name:'徐州分公司财险部'}, {level:'四级机构', province:'江苏省', city:'徐州市', area_code:'03203', parent: level3._id});
    await Organization.updateAsync({name:'徐州分公司车险部'}, {level:'四级机构', province:'江苏省', city:'徐州市', area_code:'03203', parent: level3._id});
    await Organization.updateAsync({name:'徐州个险营业部'}, {level:'四级机构', province:'江苏省', city:'徐州市', area_code:'03203', parent: level3._id});
    await Organization.updateAsync({name:'徐州丰县营业部'}, {level:'四级机构', province:'江苏省', city:'徐州市', area_code:'03203', parent: level3._id});
    await Organization.updateAsync({name:'徐州邳州营业部'}, {level:'四级机构', province:'江苏省', city:'徐州市', area_code:'03203', parent: level3._id});
    await Organization.updateAsync({name:'徐州沛县营业部'}, {level:'四级机构', province:'江苏省', city:'徐州市', area_code:'03203', parent: level3._id});
    await Organization.updateAsync({name:'徐州贾汪营业部'}, {level:'四级机构', province:'江苏省', city:'徐州市', area_code:'03203', parent: level3._id});
    await Organization.updateAsync({name:'徐州新沂营业部'}, {level:'四级机构', province:'江苏省', city:'徐州市', area_code:'03203', parent: level3._id});
    await Organization.updateAsync({name:'徐州开发区银地营业部'}, {level:'四级机构', province:'江苏省', city:'徐州市', area_code:'03203', parent: level3._id});
    level3 = await Organization.findOne({name:'徐州睢宁分公司'}).exec();
    await Organization.updateAsync({name:'商务中心（省内）运营部'}, {level:'四级机构', province:'江苏省', city:'徐州市', district:'睢宁县', area_code:'0320324', parent: level3._id});
    await Organization.updateAsync({name:'徐州睢宁沙集营业部'}, {level:'四级机构', province:'江苏省', city:'徐州市', district:'睢宁县', area_code:'0320324', parent: level3._id});
    await Organization.updateAsync({name:'睢宁分公司直属营业部'}, {level:'四级机构', province:'江苏省', city:'徐州市', district:'睢宁县', area_code:'0320324', parent: level3._id});
    let level4 = new Organization({name:'睢宁分公司直属营业部', level:'四级机构', province:'江苏省', city:'徐州市', district:'睢宁县', area_code:'0320324', parent: level3._id})
    await level4.saveAsync();
    level3 = await Organization.findOne({name:'苏州分公司'}).exec();
    await Organization.updateAsync({name:'苏州个险业务部'}, {level:'四级机构', province:'江苏省', city:'苏州市', area_code:'03205', parent: level3._id});
    level4 = await Organization.findOne({name:'睢宁分公司直属营业部'}).exec();
    await Organization.updateAsync({name:'个险-睢宁-公司'}, {level:'五级机构', province:'江苏省', city:'徐州市', district:'睢宁县', area_code:'0320324', parent: level4._id});
    await Organization.updateAsync({name:'个险-睢宁-团队'}, {level:'五级机构', province:'江苏省', city:'徐州市', district:'睢宁县', area_code:'0320324', parent: level4._id});
    await Organization.updateAsync({name:'个险-睢宁-同业'}, {level:'五级机构', province:'江苏省', city:'徐州市', district:'睢宁县', area_code:'0320324', parent: level4._id});
    level4 = await Organization.findOne({name:'徐州分公司财险部'}).exec();
    await Organization.updateAsync({name:'徐州分公司财险综合拓展部'}, {level:'五级机构', province:'江苏省', city:'徐州市', area_code:'03203', parent: level4._id});
    level4 = await Organization.findOne({name:'徐州邳州营业部'}).exec();
    await Organization.updateAsync({name:'个险-邳州'}, {level:'五级机构', province:'江苏省', city:'徐州市', area_code:'03203', parent: level4._id});
    res.json("finish");
}));

module.exports = router;
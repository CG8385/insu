var express = require('express');
var db = require('../utils/database.js').connection;
var Promise = require('bluebird');
var Company = require('../models/company.js')(db);
var router = express.Router();
var Q = require('q');
var logger = require('../utils/logger.js');
var iconv = require('iconv-lite');
var CompanyCatogory = require('../models/companyCatogory.js')(db);
var Policy = Promise.promisifyAll(require('../models/policy.js')(db));
var LifePolicy = Promise.promisifyAll(require('../models/life-policy.js')(db));
var OrgPolicy = Promise.promisifyAll(require('../models/org-policy.js')(db));
var Rule = Promise.promisifyAll(require('../models/rule.js')(db));
var Migrate = require('../models/migrate.js')(db);
var asyncMiddleware = require('../middlewares/asyncMiddleware');
var makePy = require('../utils/pinyin');
var Client = Promise.promisifyAll(require('../models/client.js')(db));
var Organization = Promise.promisifyAll(require('../models/organization.js')(db));
var User = Promise.promisifyAll(require('../models/user.js')(db));
var Role = Promise.promisifyAll(require('../models/role.js')(db));
var User = Promise.promisifyAll(require('../models/user.js')(db));
var moment = require('moment');


router.get('/rulec', asyncMiddleware(async (req, res, next) => {
    let rules = await Rule.find().exec();
    for(let i = 0; i < rules.length; i++){
        let rule = rules[i];
        if(!rule.start_date){
            rule.start_date = moment("2017-08-01 0:00:00.000");
        }
        if(!rule.end_date){
            rule.end_date = moment("2018-09-01 0:00:00.000");
        }
        rule.save()
    }
    res.json('done');
}));


// router.get('/set-role', asyncMiddleware(async (req, res, next) => {
//     let sellerRole = await Role.findOne({ name: '出单员' }).exec();
//     let financeRole = await Role.findOne({ name: '财务' }).exec();
//     let backRole = await Role.findOne({ name: '后台录单员' }).exec();
//     let adminRole = await Role.findOne({ name: '超级管理员' }).exec();
//     let r = await User.update({ role: '出单员' }, { userrole: sellerRole._id }, { multi: true });
//     r = await User.update({ role: '财务' }, { userrole: financeRole._id }, { multi: true });
//     r = await User.update({ role: '后台录单员' }, { userrole: backRole._id }, { multi: true });
//     r = await User.update({ role: '管理员' }, { userrole: adminRole._id }, { multi: true });
//     res.send('done');
// }));

// router.get('/life-policy-status', asyncMiddleware(async (req, res, next) => {
//     r = await LifePolicy.update({}, { policy_status: '已支付' }, { multi: true });
//     res.send('done');
// }));

// router.get('/life-policy-roles', asyncMiddleware(async (req, res, next) => {
//     r = await Role.update({ name: '超级管理员' },
//         {
//             lifePolicy_to_be_reviewed: {
//                 reject: true, export: true, pay: false, aprove: true, append: true, delete: true,
//                 view: true, edit: true
//             },
//             lifePolicy_to_be_paid: {
//                 export: true, pay: true, aprove: true, append: true, delete: true,
//                 view: true, edit: true
//             },
//             lifePolicy_paid: {
//                 export: true, pay: true, aprove: true, append: true, delete: true,
//                 view: true, edit: true
//             },
//             lifePolicy_rejected: {
//                 export: true, append: true, delete: true,
//                 view: true, edit: true
//             },
//         });
//     res.send('done');
// }));

// router.get('/remove-check', asyncMiddleware(async (req, res, next) => {
//     r = await Policy.update({ policy_status: '已核对' }, { policy_status: '已支付' }, { multi: true });
// }));

// var locations = require('../pca.json');

// router.get('/step1', asyncMiddleware(async (req, res, next) => {
//     await Organization.removeAsync({ name: '红叶保险代理法人机构' });
//     await Organization.updateAsync({ name: '红叶保险代理有限公司法人机构' }, { level: '一级机构', area_code: '0' });
//     let level1 = await Organization.findOne({ name: '红叶保险代理有限公司法人机构' }).exec();
//     let level2 = new Organization({ name: '江苏省分公司', level: '二级机构', province: '江苏省', area_code: '032', parent: level1._id })
//     level2 = Promise.promisifyAll(level2);
//     await level2.saveAsync();
//     level2 = await Organization.findOne({ name: '江苏省分公司' }).exec();
//     await Organization.updateAsync({ name: '苏州分公司' }, { level: '三级机构', province: '江苏省', city: '苏州市', area_code: '03205', parent: level2._id });
//     await Organization.updateAsync({ name: '徐州分公司' }, { level: '三级机构', province: '江苏省', city: '徐州市', area_code: '03203', parent: level2._id });
//     await Organization.updateAsync({ name: '徐州睢宁营业部' }, { name: '徐州睢宁分公司', level: '三级机构', province: '江苏省', city: '徐州市', district: '睢宁县', area_code: '0320324', parent: level2._id });
//     let level3 = new Organization({ name: '宿迁分公司', level: '三级机构', province: '江苏省', city: '宿迁市', area_code: '03213', parent: level2._id })
//     level3 = Promise.promisifyAll(level3);
//     await level3.saveAsync();
//     level3 = new Organization({ name: '连云港分公司', level: '三级机构', province: '江苏省', city: '连云港市', area_code: '03207', parent: level2._id })
//     level3 = Promise.promisifyAll(level3);
//     await level3.saveAsync();
//     level3 = new Organization({ name: '南京分公司', level: '三级机构', province: '江苏省', city: '南京市', area_code: '03201', parent: level2._id })
//     level3 = Promise.promisifyAll(level3);
//     await level3.saveAsync();
//     res.json("finish");
// }));

// router.get('/step2', asyncMiddleware(async (req, res, next) => {
//     let level3 = await Organization.findOne({ name: '南京分公司' }).exec();
//     await Organization.updateAsync({ name: '南京溧水营业部' }, { level: '四级机构', province: '江苏省', city: '南京市', area_code: '03201', parent: level3._id });
//     await Organization.updateAsync({ name: '南京新街口营业部' }, { level: '四级机构', province: '江苏省', city: '南京市', area_code: '03201', parent: level3._id });
//     await Organization.updateAsync({ name: '南京分公司财险营业部' }, { level: '四级机构', province: '江苏省', city: '南京市', area_code: '03201', parent: level3._id });
//     level3 = await Organization.findOne({ name: '宿迁分公司' }).exec();
//     await Organization.updateAsync({ name: '泗洪营业部' }, { level: '四级机构', province: '江苏省', city: '宿迁市', area_code: '03213', parent: level3._id });
//     await Organization.updateAsync({ name: '宿迁开发区营业部' }, { level: '四级机构', province: '江苏省', city: '宿迁市', area_code: '03213', parent: level3._id });
//     await Organization.updateAsync({ name: '宿迁宿城营业部' }, { level: '四级机构', province: '江苏省', city: '宿迁市', area_code: '03213', parent: level3._id });
//     await Organization.updateAsync({ name: '宿迁沭阳营业部' }, { level: '四级机构', province: '江苏省', city: '宿迁市', area_code: '03213', parent: level3._id });
//     await Organization.updateAsync({ name: '宿迁分公司车险业务部' }, { level: '四级机构', province: '江苏省', city: '宿迁市', area_code: '03213', parent: level3._id });
//     level3 = await Organization.findOne({ name: '徐州分公司' }).exec();
//     await Organization.updateAsync({ name: '徐州出单中心' }, { level: '四级机构', province: '江苏省', city: '徐州市', area_code: '03203', parent: level3._id });
//     await Organization.updateAsync({ name: '徐州分公司财险部' }, { level: '四级机构', province: '江苏省', city: '徐州市', area_code: '03203', parent: level3._id });
//     await Organization.updateAsync({ name: '徐州分公司车险部' }, { level: '四级机构', province: '江苏省', city: '徐州市', area_code: '03203', parent: level3._id });
//     await Organization.updateAsync({ name: '徐州个险营业部' }, { level: '四级机构', province: '江苏省', city: '徐州市', area_code: '03203', parent: level3._id });
//     await Organization.updateAsync({ name: '徐州丰县营业部' }, { level: '四级机构', province: '江苏省', city: '徐州市', area_code: '03203', parent: level3._id });
//     await Organization.updateAsync({ name: '徐州邳州营业部' }, { level: '四级机构', province: '江苏省', city: '徐州市', area_code: '03203', parent: level3._id });
//     await Organization.updateAsync({ name: '徐州沛县营业部' }, { level: '四级机构', province: '江苏省', city: '徐州市', area_code: '03203', parent: level3._id });
//     await Organization.updateAsync({ name: '徐州贾汪营业部' }, { level: '四级机构', province: '江苏省', city: '徐州市', area_code: '03203', parent: level3._id });
//     await Organization.updateAsync({ name: '徐州新沂营业部' }, { level: '四级机构', province: '江苏省', city: '徐州市', area_code: '03203', parent: level3._id });
//     await Organization.updateAsync({ name: '徐州开发区银地营业部' }, { level: '四级机构', province: '江苏省', city: '徐州市', area_code: '03203', parent: level3._id });
//     level3 = await Organization.findOne({ name: '徐州睢宁分公司' }).exec();
//     await Organization.updateAsync({ name: '商务中心（省内）运营部' }, { level: '四级机构', province: '江苏省', city: '徐州市', district: '睢宁县', area_code: '0320324', parent: level3._id });
//     await Organization.updateAsync({ name: '徐州睢宁沙集营业部' }, { level: '四级机构', province: '江苏省', city: '徐州市', district: '睢宁县', area_code: '0320324', parent: level3._id });
//     let level4 = new Organization({ name: '睢宁分公司直属营业部', level: '四级机构', province: '江苏省', city: '徐州市', district: '睢宁县', area_code: '0320324', parent: level3._id })
//     level4 = Promise.promisifyAll(level4);
//     await level4.saveAsync();
//     level3 = await Organization.findOne({ name: '苏州分公司' }).exec();
//     await Organization.updateAsync({ name: '苏州个险业务部' }, { level: '四级机构', province: '江苏省', city: '苏州市', area_code: '03205', parent: level3._id });
//     level4 = await Organization.findOne({ name: '睢宁分公司直属营业部' }).exec();
//     await Organization.updateAsync({ name: '个险-睢宁-公司' }, { level: '五级机构', province: '江苏省', city: '徐州市', district: '睢宁县', area_code: '0320324', parent: level4._id });
//     await Organization.updateAsync({ name: '个险-睢宁-团队' }, { level: '五级机构', province: '江苏省', city: '徐州市', district: '睢宁县', area_code: '0320324', parent: level4._id });
//     await Organization.updateAsync({ name: '个险-睢宁-同业' }, { level: '五级机构', province: '江苏省', city: '徐州市', district: '睢宁县', area_code: '0320324', parent: level4._id });
//     level4 = await Organization.findOne({ name: '徐州分公司财险部' }).exec();
//     await Organization.updateAsync({ name: '徐州分公司财险综合拓展部' }, { level: '五级机构', province: '江苏省', city: '徐州市', area_code: '03203', parent: level4._id });
//     level4 = await Organization.findOne({ name: '徐州邳州营业部' }).exec();
//     await Organization.updateAsync({ name: '个险-邳州' }, { level: '五级机构', province: '江苏省', city: '徐州市', area_code: '03203', parent: level4._id });

//     let level5List = await Organization.find({ level: '五级机构' }).exec();
//     for (let i = 0; i < level5List.length; i++) {
//         let level5 = level5List[i];
//         let level5_id = level5._id;
//         let level4_id = level5.parent;
//         let level4 = await Organization.findOne({ _id: level4_id }).exec();
//         let level3_id = level4.parent;
//         let level3 = await Organization.findOne({ _id: level3_id }).exec();
//         let level2_id = level3.parent;
//         let level2 = await Organization.findOne({ _id: level2_id }).exec();
//         let level1_id = level2.parent;
//         await Client.updateAsync({ organization: level5_id }, { level1_org: level1_id, level2_org: level2_id, level3_org: level3_id, level4_org: level4_id, level5_org: level5_id }, { multi: true });
//     }

//     let level4List = await Organization.find({ level: '四级机构' }).exec();
//     for (let i = 0; i < level4List.length; i++) {
//         let l = level4List[i];
//         if (l.name.indexOf('个险') != -1 || l.name.indexOf('财险') != -1) {
//             continue;
//         }
//         let level5 = new Organization({ name: l.name + '车险部', level: '五级机构', province: l.province, city: l.city, district: l.district, area_code: l.area_code, parent: l._id })
//         level5 = Promise.promisifyAll(level5);
//         await level5.saveAsync();

//         let level3_id = l.parent;
//         let level3 = await Organization.findOne({ _id: level3_id }).exec();
//         let level2_id = level3.parent;
//         let level2 = await Organization.findOne({ _id: level2_id }).exec();
//         let level1_id = level2.parent;
//         level5 = await Organization.findOne({ name: l.name + '车险部' }).exec();
//         let level5_id = level5._id;
//         if (l.name == "睢宁分公司直属营业部") {
//             await Client.updateAsync({ organization: level3_id }, { level1_org: level1_id, level2_org: level2_id, level3_org: level3_id, level4_org: l._id, level5_org: level5_id, organization: level5_id }, { multi: true });
//         } else {
//             await Client.updateAsync({ organization: l._id }, { level1_org: level1_id, level2_org: level2_id, level3_org: level3_id, level4_org: l._id, level5_org: level5_id, organization: level5_id }, { multi: true });
//         }
//     };

//     await Client.updateAsync({ level5_org: { $exists: false } }, { $unset: { organization: 1 } }, { multi: true });



//     res.json("finish");
// }));

// router.get('/step3', asyncMiddleware(async (req, res, next) => {
//     let users = await User.find({}).populate('org').exec();
//     for (let i = 0; i < users.length; i++) {
//         let user = users[i];
//         let organization = user.org;
//         if (!organization) continue;
//         if (organization.level == '一级机构') {
//             user.level1_org = organization._id;
//         } else if (organization.level == '二级机构') {
//             user.level1_org = organization.parent;
//             user.level2_org = organization._id;
//         } else if (organization.level == '三级机构') {
//             let level2_id = organization.parent;
//             let level2 = await Organization.findOne({ _id: level2_id }).exec();
//             let level1_id = level2.parent;
//             user.level1_org = level1_id;
//             user.level2_org = level2_id;
//             user.level3_org = organization._id;
//         } else if (organization.level == '四级机构') {
//             let level3_id = organization.parent;
//             let level3 = await Organization.findOne({ _id: level3_id }).exec();
//             let level2_id = level3.parent;
//             let level2 = await Organization.findOne({ _id: level2_id }).exec();
//             let level1_id = level2.parent;
//             user.level1_org = level1_id;
//             user.level2_org = level2_id;
//             user.level3_org = level3_id;
//             user.level4_org = organization._id;
//         } else if (organization.level == '五级机构') {
//             let level4_id = organization.parent;
//             let level4 = await Organization.findOne({ _id: level4_id }).exec();
//             let level3_id = level4.parent;
//             let level3 = await Organization.findOne({ _id: level3_id }).exec();
//             let level2_id = level3.parent;
//             let level2 = await Organization.findOne({ _id: level2_id }).exec();
//             let level1_id = level2.parent;
//             user.level1_org = level1_id;
//             user.level2_org = level2_id;
//             user.level3_org = level3_id;
//             user.level4_org = level4_id;
//             user.level5_org = organization._id;
//         }
//         user.save();
//     }
//     res.json("finish");
// }));

// router.get('/correction', asyncMiddleware(async (req, res, next) => {
//     let correctLevel2 = await Company.findOne({ level: '二级', name: '永诚财产保险股份有限公司江苏分公司' }).exec();
//     let wrongLevel2 = await Company.findOne({ level: '二级', name: '永诚财产保险股份有限公司徐州支公司' }).exec();
//     let level3 = await Company.findOne({ level: '三级', name: '永诚财产保险股份有限公司徐州支公司' }).exec();
//     level3 = Promise.promisifyAll(level3);
//     wrongLevel2 = Promise.promisifyAll(wrongLevel2);
//     await Policy.update({ level2_company: wrongLevel2._id }, { level2_company: correctLevel2._id, level3_company: level3._id, company: level3._id }, { multi: true });
//     level3.parent = correctLevel2._id;
//     await level3.saveAsync();
//     await wrongLevel2.removeAsync();

//     wrongLevel2 = await Company.findOne({ level: '二级', name: { $regex: ".*南京分公司.*" } }).exec();
//     level3 = await Company.findOne({ level: '三级', name: '新华人寿保险股份有限公司南京分公司' }).exec();

//     await Policy.update({ level2_company: wrongLevel2._id }, { level2_company: level3.parent, level3_company: level3._id, company: level3._id }, { multi: true });
//     wrongLevel2 = Promise.promisifyAll(wrongLevel2);
//     await wrongLevel2.removeAsync();

//     let wrongLevel3 = await Company.findOne({ level: '三级', name: '中国人民财产保险股份有限公司江苏分公司' }).exec();
//     level3 = await Company.findOne({ level: '三级', name: '中国人民财产保险股份有限公司苏州中心支公司' }).exec();
//     await Policy.update({ level3_company: wrongLevel3._id }, { level3_company: level3._id, company: level3._id }, { multi: true });

//     wrongLevel3 = await Company.findOne({ level: '三级', name: '中国人民财产保险股份有限公司南京支公司第一营业部' }).exec();
//     let correctLevel3 = await Company.findOne({ level: '三级', name: '中国人民财产保险股份有限公司南京支公司' }).exec();
//     wrongLevel3.level = '四级';
//     wrongLevel3.parent = correctLevel3._id;
//     await Policy.update({ level3_company: wrongLevel3._id }, { level3_company: correctLevel3._id, level4_company: wrongLevel3._id }, { multi: true });
//     wrongLevel3.save();
//     res.json('done');
// }));

module.exports = router;
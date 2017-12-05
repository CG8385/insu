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

router.get('/test', asyncMiddleware(async (req, res, next) => {
    let clients = await Client.find({client_type:'个人'}).exec();
    for(let i = 0; i < 15; i++){
        clients[i].client_type = "待审核";
        await clients[i].save()
    }
    res.send("done");
}));

router.get('/step1', asyncMiddleware(async (req, res, next) => {
    let log = [];
    let r = null;
    let c = await Company.findOne({level:'二级', name: '新华人寿保险股份有限公司南京直属营业部'}).exec();
    let n = await Company.findOne({level:'二级', name: '新华人寿保险股份有限公司江苏分公司'}).exec();
    c.parent = n._id;
    c.level = '三级';
    c = await c.save();
    r = await Policy.update({level2_company: c._id}, {level2_company: n._id, level3_company: c._id}, {multi: true});
    log.push(r);
    r = await OrgPolicy.update({level2_company: c._id}, {level2_company: n._id, level3_company: c._id}, {multi: true});
    log.push(r);
    
    n = await Company.findOne({level:'二级', name: '中国太平洋财产保险股份有限公司江苏省分公司'}).exec();
    let cs = await Company.find({level:'二级', name: /中国太平洋财产保险股份有限公司南京.*/}).exec();
    r = await Company.update({level:'二级', name: /中国太平洋财产保险股份有限公司南京.*/}, {level:'三级', parent: n._id}, {multi: true});
    cs.forEach(async function(x){
        r = await Policy.update({level2_company: x._id}, {level2_company: n._id, level3_company: x._id}, {multi: true});
        log.push(r);
        r = await OrgPolicy.update({level2_company: c._id}, {level2_company: n._id, level3_company: c._id}, {multi: true});
        log.push(r);
    });
    

    n = await Company.findOne({level:'二级', name: '中国平安财产保险股份有限公司江苏省分公司'}).exec();
    cs = await Company.find({level:'二级',  name: /中国平安.*南京.*/}).exec();
    r = await Company.update({level:'二级', name: /中国平安.*南京.*/}, {level:'三级', parent: n._id}, {multi: true});
    log.push(r);
    cs.forEach(async function(x){
        r = await Policy.update({level2_company: x._id}, {level2_company: n._id, level3_company: x._id}, {multi: true});
        log.push(r);
        r = await OrgPolicy.update({level2_company: c._id}, {level2_company: n._id, level3_company: c._id}, {multi: true});
        log.push(r);
    });

    c = await Company.findOne({level:'二级', name: '永诚财产保险股份有限公司南京支公司'}).exec();
    let a = await Company.findOne({level:'二级', name: /永诚财产保险股份有限公司江苏分公司非营业.*/}).exec();
    n = new Company({level:'二级', name: '永诚财产保险股份有限公司江苏分公司', catogory: a.catogory, contact: a.contact, phone: a.phone});
    n = await n.save();
    c.parent = n._id;
    c.level = '三级';
    c = await c.save();
    r = await Policy.update({level2_company: c._id}, {level2_company: n._id, level3_company: c._id}, {multi: true});
    log.push(r);
    r = await OrgPolicy.update({level2_company: c._id}, {level2_company: n._id, level3_company: c._id}, {multi: true});
    log.push(r);

    c = await Company.findOne({level:'二级', name: /中国大地财产保险股份有限公司宿迁中心支公司.*/}).exec();
    n = new Company({level:'二级', name: '中国大地财产保险股份有限公司江苏分公司', catogory: c.catogory});
    n = await n.save();
    c.parent = n._id;
    c.level = '三级';
    c = await c.save();
    r = await Policy.update({level2_company: c._id}, {level2_company: n._id, level3_company: c._id}, {multi: true});
    log.push(r);
    r = await OrgPolicy.update({level2_company: c._id}, {level2_company: n._id, level3_company: c._id}, {multi: true});
    log.push(r);

    c = await Company.findOne({level:'三级', name: /浙商财产保险股份有限公司江苏分公司  睢宁支公司.*/}).exec();
    n = await Company.findOne({level:'三级', name: '浙商财产保险股份有限公司徐州中心支公司'}).exec();
    c.parent = n._id;
    c.level = '四级';
    c.name = '浙商财产保险股份有限公司睢宁分公司（单交强含税）';
    c = await c.save();
    r = await Policy.update({level3_company: c._id}, {level3_company: n._id, level4_company: c._id}, {multi: true});
    log.push(r);
    r = await OrgPolicy.update({level3_company: c._id}, {level3_company: n._id, level4_company: c._id}, {multi: true});
    log.push(r);

    c = await Company.remove({level:'四级', name: /中国平安财产保险股份有限公司徐州中心支公司新车小车.*/});
    res.json(log);
}));

router.get('/step2', asyncMiddleware(async (req, res, next) => {
    let result = [];
    let companies = await Company.find({level: {$exists: true}}).exec();
    let ruleCompanyIds = [];
    for(let i = 0; i < companies.length; i++){
        let company = companies[i];
        let j = company.name.lastIndexOf('营业部');
        if(j != -1){
            j += 3;
        }else{
            j = company.name.lastIndexOf('公司') + 2;
        }
        if(j == company.name.length){ continue; }
        let name = company.name.substring(0, j);
        let ruleName = company.name.substring(j).trim();
        console.log(company.name + "=======" + name + "     +     " + ruleName);
        let c = await Company.findOne({level:company.level, name: name}).exec();
        if(!c){
            c = new Company({name: name, contact: company.contact, phone: company.phone, catogory: company.catogory, level: company.level, parent: company.parent});
            c = await c.save();
        }
        let migrate = new Migrate({old: company._id, new: c._id});
        let rule = null;
        if(ruleName.indexOf('（财险）') != -1){
            migrate.comment = ruleName;
        }else if(company.rates){
            let rate = company.rates[0];
            rule = new Rule();
            rule.mandatory_income = rate.mandatory_income;
            rule.mandatory_payment = rate.mandatory_payment;
            rule.commercial_income = rate.commercial_income;
            rule.commercial_payment = rate.commercial_payment;
            rule.tax_income = rate.tax_income;
            rule.tax_payment = rate.tax_payment;
            rule.other_income = rate.other_income;
            rule.other_payment = rate.other_payment;
            rule.company = c._id;
            rule.name = ruleName;
            rule = await rule.save();
            ruleCompanyIds.push(rule.company);
            migrate.rule = rule._id;
            let rules = await Rule.find().exec();
        }
        r = await Policy.update({level2_company: migrate.old}, {level2_company: migrate.new, rule: migrate.rule, comment: migrate.comment}, {multi: true});
        r = await Policy.update({level3_company: migrate.old}, {level3_company: migrate.new, rule: migrate.rule, comment: migrate.comment}, {multi: true});
        r = await Policy.update({level4_company: migrate.old}, {level4_company: migrate.new, rule: migrate.rule, comment: migrate.comment}, {multi: true});
        await Company.remove({_id: migrate.old});
        migrate = await migrate.save();
    }


    let c1 = await Company.findOne({level:'三级', name: '中国人民财产保险股份有限公司南京支公司第二营业部'}).exec();
    let c2 = await Company.findOne({level:'三级', name: '中国人民财产保险股份有限公司南京浦口分公司'}).exec();
    let n = new Company({level:'三级', name: '中国人民财产保险股份有限公司南京支公司', parent: c1.parent, catogory: c1.catogory});
    n = await n.save();
    c1.level = '四级';
    c1.name = '中国人民财产保险股份有限公司南京支公司直属第二营业部';
    c1.parent = n._id;
    c2.level = '四级';
    c2.name = '中国人民财产保险股份有限公司浦口支公司';
    c2.parent = n._id;
    await c1.save();
    await c2.save();
    await Policy.update({level3_company: c1._id}, {level3_company: n._id, level4_company: c1._id}, {multi: true});
    await Policy.update({level3_company: c2._id}, {level3_company: n._id, level4_company: c2._id}, {multi: true});

    let c = await Company.findOne({level:'三级', name: '新华人寿保险股份有限公司南京直属营业部'}).exec();
    n = new Company({level:'三级', name: '新华人寿保险股份有限公司南京分公司', parent: c.parent, catogory: c.catogory});
    n = await n.save();
    c.level = '四级';
    c.name = '新华人寿保险股份有限公司南京分公司直属营业部';
    c.parent = n._id;
    await c.save();
    await Policy.update({level3_company: c._id}, {level3_company: n._id, level4_company: c._id}, {multi: true});

    c = await Company.findOne({level:'三级', name: '阳光财产保险股份有限公司南京江宁支公司'}).exec();
    n = new Company({level:'三级', name: '阳光财产保险股份有限公司南京支公司', parent: c.parent, catogory: c.catogory});
    n = await n.save();
    c.level = '四级';
    c.name = '阳光财产保险股份有限公司江宁支公司';
    c.parent = n._id;
    await c.save();
    await Policy.update({level3_company: c._id}, {level3_company: n._id, level4_company: c._id}, {multi: true});

    c = await Company.findOne({level:'三级', name: '中国平安财产保险股份有限公司江苏省分公司南京中心支公司'}).exec();
    n = await Company.findOne({level:'三级', name: '中国平安财产保险股份有限公司南京中心支公司'}).exec();
    let ttt = await Policy.update({level3_company: c._id}, {level3_company: n._id}, {multi: true});
    await c.remove();

    res.json({message: "finish"});
}));


router.get('/step3', asyncMiddleware(async (req, res, next) => {
    let rules = await Rule.find().exec();
    let ruleCompanyIds = rules.map(r => r.company);
    let cs = await Company.find({level:{$in: ['三级','四级']}, _id: {$nin: ruleCompanyIds}, rates: {$exists: true}}).exec();
    for(let i = 0; i < cs.length; i++){
        let c = cs[i];
        if(c.rates.length === 0){
            continue;
        }
        let rate = c.rates[0];
        rule = new Rule(rate);
        rule.company = c._id;
        rule.name = '通用';
        rule = await rule.save();
        console.log(rule);
        let r = await Policy.update({level3_company: c._id}, {rule: rule._id}, {multi: true});
        console.log(r);
        r = await Policy.update({level4_company: c._id}, {rule: rule._id}, {multi: true});
        console.log(r);
    }
    res.json(cs);
}));

router.get('/step4', asyncMiddleware(async (req, res, next) => {
    let rules = await Rule.find().exec();
    rules.forEach(function(rule){
        rule.py = makePy(rule.name)[0];
        rule.save();
    });
    let clients = await Client.find().exec();
    clients.forEach(function(client){
        client.py = makePy(client.name);
        client.save();
    });
    let companies = await Company.find().exec();
    companies.forEach(function(c){
        c.py = makePy(c.name);
        c.save();
    });

    companies = await CompanyCatogory.find().exec();
    companies.forEach(function(c){
        c.py = makePy(c.name);
        c.save();
    });
    let os = await Organization.find().exec();
        os.forEach(function(o){
        o.py = makePy(o.name);
        o.save();
    });
    res.send("拼音生成完毕");
}));

router.get('/rules', asyncMiddleware(async (req, res, next) => {
    let rules = await Rule.find().exec();
    res.json(rules);
}));

module.exports = router;
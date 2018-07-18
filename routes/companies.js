var express = require('express');
var db = require('../utils/database.js').connection;
var Promise = require('bluebird');
var Company = require('../models/company.js')(db);
var router = express.Router();
var Q = require('q');
var logger = require('../utils/logger.js');
var iconv = require('iconv-lite');
var CompanyCatogory = require('../models/companyCatogory.js')(db);
var Rule = require('../models/rule.js')(db);
var LifeProduct = Promise.promisifyAll(require('../models/life-product.js')(db));
var PropertyProduct = Promise.promisifyAll(require('../models/property-product.js')(db));
var asyncMiddleware = require('../middlewares/asyncMiddleware');
var makePy = require('../utils/pinyin');

router.get('/', function (req, res, next) {
  Company.find({ level: undefined })
    .populate('catogory')
    .sort({py: -1})
    .exec()
    .then(function (companies) {
      res.json(companies);
    },
    function (err) {
      res.status(500).end();
    }
    )
});

router.get('/level1', function (req, res) {
  CompanyCatogory.find()
    .sort({py: -1})
    .exec()
    .then(function (companies) {
      res.json(companies);
    },
    function (err) {
      res.status(500).end();
    }
    )
});

router.get('/level2', function (req, res) {
  let query = { level: "二级" };
  let company_scope = req.user.userrole.company_scope;
  if(company_scope != '全国'){
    query.province = req.user.org.province;
  }
  Company.find(query)
    .populate('catogory')
    .sort({py: -1})
    .exec()
    .then(function (companies) {
      res.json(companies);
    },
    function (err) {
      res.status(500).end();
    }
    )
});

router.get('/level3', function (req, res) {
  Company.find({ level: "三级" })
    .populate('catogory')
    .sort({py: -1})
    .exec()
    .then(function (companies) {
      res.json(companies);
    },
    function (err) {
      res.status(500).end();
    }
    )
});

router.get('/level4', function (req, res) {
  Company.find({ level: "四级" })
    .populate('catogory')
    .sort({py: -1})
    .exec()
    .then(function (companies) {
      res.json(companies);
    },
    function (err) {
      res.status(500).end();
    }
    )
});

router.get('/excel', async function (req, res) {
  let companies2 = await Company.find({ level: "二级" }).populate('catogory').exec();
  let json2csv = require('json2csv');
  let fields = [
    'level1',
    'level2',
    'level3',
    'level4'
  ];
  let fieldNames = [
    '一级',
    '二级',
    '三级',
    '四级'
  ];
  let arr = [];
  for (let j = 0; j < companies2.length; j++) {
    let level2 = companies2[j];
    let level1 = level2.catogory;
    let level2Subs = await Company.find({ level: "三级", parent: level2._id }).exec();
    console.log("level 2 processing " + j);
    if (level2Subs.length == 0) {
      let row = {};
      row.level1 = level1.name;
      row.level2 = level2.name;
      arr.push(row);
    }
    for (let k = 0; k < level2Subs.length; k++) {
      console.log("level 3 processing" + k);
      let level3 = level2Subs[k];
      let level3Subs = await Company.find({ level: "四级", parent: level3._id }).exec();
      if (level3Subs.length == 0) {
        let row = {};
        row.level1 = level1.name;
        row.level2 = level2.name;
        row.level3 = level3.name;
        arr.push(row);
      }
      for (let l = 0; l < level3Subs.length; l++) {
        let level4 = level3Subs[l];
        let row = {};
        row.level1 = level1.name;
        row.level2 = level2.name;
        row.level3 = level3.name;
        row.level4 = level4.name;
        arr.push(row);
      }

    }

  }

  json2csv({ data: arr, fields: fields, fieldNames: fieldNames }, function (err, csv) {
    if (err) console.log(err);
    var dataBuffer = Buffer.concat([new Buffer('\xEF\xBB\xBF', 'binary'), new Buffer(csv)]);
    res.setHeader('Content-Type', 'text/csv;charset=utf-8');
    res.setHeader("Content-Disposition", "attachment;filename=" + "companies.csv");
    res.send(dataBuffer);
  });

});


router.get('/:id', function (req, res) {
  Company.findOne({ _id: req.params.id })
    .exec()
    .then(function (company) {
      res.status(200).json(company);
    }, function (err) {
      logger.error(err);
      res.status(500).send(err);
    });
});

router.get('/:id/rules', function (req, res) {
  Rule.find({ company: req.params.id })
    .sort({py: 1})
    .exec()
    .then(function (rules) {
      res.status(200).json(rules);
    }, function (err) {
      logger.error(err);
      res.status(500).send(err);
    });
});

router.get('/rules/:id', asyncMiddleware(async (req, res, next) => {
  let rule = await Rule.findOne({ _id: req.params.id }).populate('company').exec();
  res.status(200).json(rule);
}));

router.put('/rules/:id', asyncMiddleware(async (req, res, next) => {
  let data = req.body;
  let rule = await Rule.findOne({ _id: req.params.id }).exec();
  rule.name = data.name;
  rule.py = makePy(data.name);
  rule.mandatory_income=data.mandatory_income;
  rule.mandatory_payment=data.mandatory_payment;
  rule.commercial_income=data.commercial_income;
  rule.commercial_payment=data.commercial_payment;
  rule.tax_income= data.tax_income;
  rule.tax_payment=data.tax_payment;
  rule.other_income=data.other_income;
  rule.other_payment=data.other_payment;
  await rule.save();
  res.json({ message: '费率政策已成功更新' });
}));

router.post('/rules', asyncMiddleware(async (req, res, next) => {
  let data = req.body;
  let rule = new Rule();
  rule.name = data.name;
  rule.py = makePy(data.name);
  rule.mandatory_income=data.mandatory_income;
  rule.mandatory_payment=data.mandatory_payment;
  rule.commercial_income=data.commercial_income;
  rule.commercial_payment=data.commercial_payment;
  rule.tax_income= data.tax_income;
  rule.tax_payment=data.tax_payment;
  rule.other_income=data.other_income;
  rule.other_payment=data.other_payment;
  rule.company = data.company._id;
  await rule.save();
  res.json({ message: '费率政策已成功保存' });
}));

router.delete('/rules/:id', asyncMiddleware(async (req, res, next) => {
  let rule = await Rule.findOne({_id: req.params.id}).exec();
  logger.info(req.user.name + " 删除了一条费率政策，费率政策名称为：" + rule.name + "。" + req.clientIP);
  await rule.remove();
  res.json({ message: '费率政策已成功删除' });
}));

router.get('/:id/rules', function (req, res) {
  Rule.find({ company: req.params.id })
    .sort({py: 1})
    .exec()
    .then(function (rules) {
      res.status(200).json(rules);
    }, function (err) {
      logger.error(err);
      res.status(500).send(err);
    });
});
router.get('/:id/life-products', function (req, res) {
  LifeProduct.find({ company: req.params.id })
    .sort({py: 1})
    .exec()
    .then(function (products) {
      res.status(200).json(products);
    }, function (err) {
      logger.error(err);
      res.status(500).send(err);
    });
});

router.get('/life-products/:id', asyncMiddleware(async (req, res, next) => {
  let producet = await LifeProduct.findOne({ _id: req.params.id }).populate('company').exec();
  res.status(200).json(producet);
}));

router.put('/life-products/:id', asyncMiddleware(async (req, res, next) => {
  await LifeProduct.findOneAndUpdateAsync({_id:req.params.id}, req.body);
  res.json({ message: '寿险险种已成功更新' });
}));

router.post('/life-products', asyncMiddleware(async (req, res, next) => {
  let data = req.body;
  let product = new LifeProduct();
  product.name = data.name;
  product.py = makePy(data.name);
  product.company=data.company;
  product.direct_payment_rate=data.direct_payment_rate;
  product.company = data.company._id;
  await product.save();
  res.json({ message: '寿险险种已成功保存' });
}));

router.delete('/life-products/:id', asyncMiddleware(async (req, res, next) => {
  let rule = await LifeProduct.findOne({_id: req.params.id}).exec();
  logger.info(req.user.name + " 删除了一条寿险险种，寿险险种名称为：" + rule.name + "。" + req.clientIP);
  await rule.remove();
  res.json({ message: '财险险种已成功删除' });
}));

router.get('/:id/property-products', function (req, res) {
  PropertyProduct.find({ company: req.params.id })
    .sort({py: 1})
    .exec()
    .then(function (products) {
      res.status(200).json(products);
    }, function (err) {
      logger.error(err);
      res.status(500).send(err);
    });
});

router.get('/property-products/:id', asyncMiddleware(async (req, res, next) => {
  let producet = await PropertyProduct.findOne({ _id: req.params.id }).populate('company').exec();
  res.status(200).json(producet);
}));

router.put('/property-products/:id', asyncMiddleware(async (req, res, next) => {
  await PropertyProduct.findOneAndUpdateAsync({_id:req.params.id}, req.body);
  res.json({ message: '财险险种已成功更新' });
}));

router.post('/property-products', asyncMiddleware(async (req, res, next) => {
  let data = req.body;
  let product = new PropertyProduct();
  product.name = data.name;
  product.py = makePy(data.name);
  product.company=data.company;
  product.income_rate=data.income_rate;
  product.payment_rate=data.payment_rate;
  product.company = data.company._id;
  await product.save();
  res.json({ message: '财险险种已成功保存' });
}));

router.delete('/property-products/:id', asyncMiddleware(async (req, res, next) => {
  let rule = await PropertyProduct.findOne({_id: req.params.id}).exec();
  logger.info(req.user.name + " 删除了一条财险险种，财险险种名称为：" + rule.name + "。" + req.clientIP);
  await rule.remove();
  res.json({ message: '财险险种已成功删除' });
}));

router.post('/', function (req, res) {
  var data = req.body;
  Company.find({ name: data.name, level: { $exists: true } }, function (err, companies) {
    if (companies.length > 0) {
      res.status(400).send('系统中已存在该公司名称');
    } else {
      var company = new Company(data);
      company.py = makePy(data.name);
      company.save(function (err, savedCompany, numAffected) {
        if (err) {
          logger.error(err);
          res.status(500).send(err);
        } else {
          logger.info(req.user.name + " 添加了一个保险公司，保险公司名称为：" + savedCompany.name + "。" + req.clientIP);
          res.status(200).json({ message: '保险公司已成功添加' });
        }
      });
    }
  })
});

router.put('/:id', function (req, res) {
  Company.findById(req.params.id, function (err, company) {
    if (err)
      res.send(err);
    company.name = req.body.name;
    company.py = makePy(req.body.name);
    company.contact = req.body.contact;
    company.phone = req.body.phone;
    company.catogory = req.body.catogory;
    company.province = req.body.province;
    company.city = req.body.city;
    company.district = req.body.district;
    company.area_code = req.body.area_code;
    // company.rates = req.body.rates;
    // company.rates_based_on_taxed = req.body.rates_based_on_taxed;
    company.save(function (err) {
      if (err) {
        logger.error(err);
        res.send(err);
      }
      logger.info(req.user.name + " 更新了保险公司信息，保险公司名称为：" + company.name + "。" + req.clientIP);
      res.json({ message: '保险公司已成功更新' });
    });

  });
});

router.delete('/:id', function (req, res) {
  Company.remove({ _id: req.params.id }, function (err, company) {
    if (err) {
      logger.error(err);
      res.send(err);
    }
    logger.info(req.user.name + " 删除了一个保险公司。" + req.clientIP);
    res.json({ message: '保险公司已成功删除' });
  });
});

router.get('/sub/:parentId', asyncMiddleware(async (req, res, next) => {
  let parent = await Company.findById(req.params.parentId).exec();
  let parentLevel = '';
  if(!parent){
    parent = await CompanyCatogory.findById(req.params.parentId);
    parentLevel = '一级';
  }else{
    parentLevel = parent.level;
  }
  let company_scope = req.user.userrole.company_scope;
  let query = {};
  if(parentLevel == '一级'){
    query.catogory = req.params.parentId;
    query.level = '二级';
    if(company_scope != '全国'){
      query.province = req.user.org.province;
    }
  }else if(parentLevel == '二级'){
    query.parent = req.params.parentId;
    if(['本市','本区县'].indexOf(company_scope) != -1){
      query.province = req.user.org.province;
      query.city = req.user.org.city;
    }
  }else if(parentLevel == '三级'){
    query.parent = req.params.parentId;
    if(['本区县'].indexOf(company_scope) != -1){
      query.province = req.user.org.province;
      query.city = req.user.org.city;
      query.district = req.user.org.district;
    }
  }
  let companies = await Company.find(query).sort({py: -1}).exec();
  res.status(200).json(companies);
}));



module.exports = router;

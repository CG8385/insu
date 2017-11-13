var express = require('express');
var db = require('../utils/database.js').connection;
var Company = require('../models/company.js')(db);
var router = express.Router();
var Q = require('q');
var logger = require('../utils/logger.js');
var iconv = require('iconv-lite');
var CompanyCatogory = require('../models/companyCatogory.js')(db);

router.get('/', function (req, res, next) {
  Company.find({level:undefined})
    .populate('catogory')
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
  Company.find({level:"二级"})
    .populate('catogory')
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
  Company.find({level:"三级"})
    .populate('catogory')
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
  Company.find({level:"四级"})
    .populate('catogory')
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
  let companies2 = await Company.find({level:"二级"}).populate('catogory').exec();
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
  for(let j = 0; j < companies2.length; j++){
    let level2 = companies2[j];
    let level1 = level2.catogory;
    let level2Subs= await Company.find({level:"三级", parent: level2._id}).exec();
    console.log("level 2 processing " + j);
    if(level2Subs.length == 0){
      let row = {};
      row.level1 = level1.name;
      row.level2 = level2.name;
      arr.push(row);
    }
    for(let k = 0; k < level2Subs.length; k++){
      console.log("level 3 processing"+ k);
      let level3 = level2Subs[k];
      let level3Subs = await Company.find({level:"四级", parent: level3._id}).exec();
      if(level3Subs.length == 0){
        let row = {};
        row.level1 = level1.name;
        row.level2 = level2.name;
        row.level3 = level3.name;
        arr.push(row);
      }
      for(let l = 0; l < level3Subs.length; l++){
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

router.post('/', function (req, res) {
  var data = req.body;
  Company.find({ name: data.name, level:{$exists:true} }, function (err, companies) {
    if (companies.length > 0) {
      res.status(400).send('系统中已存在该公司名称');
    } else {
      var company = new Company(data);
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
    company.contact = req.body.contact;
    company.phone = req.body.phone;
    company.catogory = req.body.catogory;
    company.rates = req.body.rates;
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

router.get('/sub/:parentId', function (req, res) {
  Company.find({ parent: req.params.parentId })
    .exec()
    .then(function (companies) {
      if (companies.length > 0) {
        res.status(200).json(companies);
      } else {
        Company.find({ catogory: req.params.parentId, level:"二级" })
          .exec()
          .then(function (companies) {
            res.status(200).json(companies);
          }, function (err) {
            logger.error(err);
            res.status(500).send(err);
          });
      }
    }, function (err) {
      logger.error(err);
      res.status(500).send(err);
    });
});



module.exports = router;

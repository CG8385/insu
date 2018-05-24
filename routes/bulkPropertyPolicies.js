var express = require('express');
var db = require('../utils/database.js').connection;
var Policy = require('../models/bulk-property-policy.js')(db);
var router = express.Router();
var Q = require('q');
var logger = require('../utils/logger.js');
var Client = require('../models/client.js')(db);
var iconv = require('iconv-lite');
var ObjectId = require('mongodb').ObjectId;

router.post('/', function (req, res) {
  var policies = req.body;

  var bulk = Policy.collection.initializeUnorderedBulkOp();
  for(var i = 0; i < policies.length; i++){
    var temp = policies[i].created_at;
    policies[i].created_at = new Date(temp);
    policies[i].client = new ObjectId(policies[i].client);
    if(policies[i].level1_company){
      policies[i].level1_company = new ObjectId(policies[i].level1_company);
    }
    if(policies[i].level3_company){
      policies[i].level2_company = new ObjectId(policies[i].level2_company);
    }
    if(policies[i].level3_company){
      policies[i].level3_company = new ObjectId(policies[i].level3_company);
    }
    if(policies[i].level4_company){
      policies[i].level4_company = new ObjectId(policies[i].level4_company);
    }

    if(policies[i].level1_org){
      policies[i].level1_org = new ObjectId(policies[i].level1_org);
    }
    if(policies[i].level2_org){
      policies[i].level2_org = new ObjectId(policies[i].level2_org);
    }
    if(policies[i].level3_org){
      policies[i].level3_org = new ObjectId(policies[i].level3_org);
    }
    if(policies[i].level4_org){
      policies[i].level4_org = new ObjectId(policies[i].level4_org);
    }
    if(policies[i].level5_org){
      policies[i].level5_org = new ObjectId(policies[i].level5_org);
    }

    bulk.find({policy_no: policies[i].policy_no}).upsert().updateOne(policies[i]);
  }
  bulk.execute();
  res.status(200).json({ message: '保单已成功批量添加' });

});



router.get('/', function (req, res) {
  var user = req.user;
  var query = {};
  Policy.find(query)
    // .populate('client')
    .exec()
    .then(function (policies) {
      res.status(200).json(policies);
    }, function (err) {
      logger.error(err);
      res.status(500).send(err);
    });
});


router.post('/excel', function (req, res) {
  var conditions = {};
  for (var key in req.body.filterByFields) {
    if (req.body.filterByFields.hasOwnProperty(key) && req.body.filterByFields[key] != null && req.body.filterByFields[key] != "") {
      conditions[key] = req.body.filterByFields[key];
    }
  }

  if (req.user.userrole.policy_scope =='本人') {
    conditions['seller'] = req.user._id;
  }else if (req.user.userrole.policy_scope =='无') {
    conditions['level1_org'] = "-999";
  }else if (req.user.userrole.policy_scope =='二级') {
    conditions['level2_org'] = req.user.level2_org;
  }else if (req.user.userrole.policy_scope =='三级') {
    conditions['level3_org'] = req.user.level3_org;
  }else if (req.user.userrole.policy_scope =='四级') {
    conditions['level4_org'] = req.user.level4_org;
  }else if (req.user.userrole.policy_scope =='五级') {
    conditions['level5_org'] = req.user.level5_org;
  }

  var sortParam = "";
  if (req.body.orderByReverse) {
    sortParam = "-" + req.body.orderBy.toString();
  } else {
    sortParam = req.body.orderBy.toString();
  }

  if (req.body.fromDate != undefined && req.body.fromDate != '' && req.body.toDate != undefined) {
    conditions['created_at'] = { $gte: req.body.fromDate, $lte: req.body.toDate };
  } else if (req.body.fromDate != undefined && req.body.fromDate != '') {
    conditions['created_at'] = { $gte: req.body.fromDate };
  } else if (req.body.toDate != undefined) {
    conditions['created_at'] = { $lte: req.body.toDate };
  }
  var query = Policy.find(conditions);
  query
    .sort(sortParam)
    .populate('client level2_company level3_company level4_company organization')
    .exec()
    .then(function (policies) {
      var json2csv = require('json2csv');
      var fields = [
        'created_at',
        'policy_no',
        'company',
        'payer_name',
        'insured_name',
        'client',
        'product_name',
        'fee',
        'income_rate',
        'income',
        'payment_rate',
        'payment',
        'profit',
        'policy_status',
        'paid_at',
        'payment_remarks'
      ];
      var fieldNames = [
        '出单日期',
        '保单号',
        '保险公司',
        '投保人',
        '被保险人',
        '代理人',
        '开户行',
        '险种名称',
        '保费',
        '跟单比例',
        '跟单费',
        '结算比例',
        '结算费',
        '毛利润',
        '保单状态',
        '支付日期',
        '支付备注'
      ];

      var dateFormat = require('dateformat');
      var arr = [];

      for (var i = 0; i < policies.length; i++) {
        var policy = policies[i];
        var row = {};

        row.created_at = (dateFormat(policy.created_at, "mm/dd/yyyy"));
        row.policy_no = "'" + policy.policy_no;

        if(policy.level4_company){
          row.company = policy.level4_company.name;
        }
        else if(policy.level3_company){
          row.company = policy.level3_company.name;
        }
        else{
          row.company = policy.level2_company.name;
        }
        row.payer_name = policy.payer_name;
        row.insured_name = policy.insured_name;
        row.client = policy.client ? policy.client.name : '';
        row.product_name = policy.product_name;
        row.fee = policy.fee.toFixed(2);
        row.income_rate = policy.income_rate ? policy.income_rate.toFixed(2) + "%" : "";
        row.income = policy.income ? policy.income.toFixed(2) : "";
        row.payment_rate = policy.payment_rate.toFixed(2) + "%";
        row.payment = policy.payment.toFixed(2);
        row.profit = policy.profit? policy.profit.toFixed(2): '';
        row.policy_status = policy.policy_status;
        row.paid_at = policy.paid_at ? (dateFormat(policy.paid_at, "mm/dd/yyyy")) : '';
        row.payment_remarks = policy.payment_remarks ? policy.payment_remarks : '';
        arr.push(row);
      }
      json2csv({ data: arr, fields: fields, fieldNames: fieldNames }, function (err, csv) {
        if (err) console.log(err);

        var dataBuffer = Buffer.concat([new Buffer('\xEF\xBB\xBF', 'binary'), new Buffer(csv)]);
        res.setHeader('Content-Type', 'text/csv;charset=utf-8');
        res.setHeader("Content-Disposition", "attachment;filename=" + "bulk-property-policies.csv");
        res.send(dataBuffer);
      });
    }, function (err) {
      logger.error(err);
    })
});


router.delete('/:id', function (req, res) {
  Policy.remove({ _id: req.params.id }, function (err, policy) {
    if (err) {
      logger.error(err);
      res.send(err);
    }
    logger.info(req.user.name + " 删除了一份批量财险保单。" + req.clientIP);
    res.json({ message: '保单已成功删除' });
  });
});

router.post('/search', function (req, res) {
  var conditions = {};

  for (var key in req.body.filterByFields) {
    if (req.body.filterByFields.hasOwnProperty(key) && req.body.filterByFields[key] != null && req.body.filterByFields[key] != "") {
      conditions[key] = req.body.filterByFields[key];
    }
  }

  if (req.user.userrole.policy_scope =='本人') {
    conditions['seller'] = req.user._id;
  }else if (req.user.userrole.policy_scope =='无') {
    conditions['level1_org'] = "-999";
  }else if (req.user.userrole.policy_scope =='二级') {
    conditions['level2_org'] = req.user.level2_org;
  }else if (req.user.userrole.policy_scope =='三级') {
    conditions['level3_org'] = req.user.level3_org;
  }else if (req.user.userrole.policy_scope =='四级') {
    conditions['level4_org'] = req.user.level4_org;
  }else if (req.user.userrole.policy_scope =='五级') {
    conditions['level5_org'] = req.user.level5_org;
  }

  var sortParam = "";
  if (req.body.orderByReverse) {
    sortParam = "-" + req.body.orderBy.toString();
  } else {
    sortParam = req.body.orderBy.toString();
  }

  if (req.body.fromDate != undefined && req.body.fromDate != '' && req.body.toDate != undefined) {
    conditions['created_at'] = { $gte: req.body.fromDate, $lte: req.body.toDate };
  } else if (req.body.fromDate != undefined && req.body.fromDate != '') {
    conditions['created_at'] = { $gte: req.body.fromDate };
  } else if (req.body.toDate != undefined) {
    conditions['created_at'] = { $lte: req.body.toDate };
  }
  var query = Policy.find(conditions);
  query
    .sort(sortParam)
    .skip(req.body.currentPage * req.body.pageSize)
    .limit(req.body.pageSize)
    .populate('client level2_company level3_company level4_company organization')
    .exec()
    .then(function (policies) {
      Policy.count(conditions, function (err, c) {
        if (err) {
          logger.error(err);
          res.status(500).send("获取保单总数失败");
        }
        res.status(200).json({
          totalCount: c,
          policies: policies
        })
      });
    }, function (err) {
      logger.error(err);
    })
});

router.post('/summary', function (req, res) {
  var conditions = {};

  for (var key in req.body.filterByFields) {
    if (req.body.filterByFields.hasOwnProperty(key) && req.body.filterByFields[key] != null && req.body.filterByFields[key] != "") {
      conditions[key] = req.body.filterByFields[key];
    }
  }

  if (req.user.userrole.policy_scope =='本人') {
    conditions['seller'] = req.user._id;
  }else if (req.user.userrole.policy_scope =='无') {
    conditions['level1_org'] = "-999";
  }else if (req.user.userrole.policy_scope =='二级') {
    conditions['level2_org'] = req.user.level2_org;
  }else if (req.user.userrole.policy_scope =='三级') {
    conditions['level3_org'] = req.user.level3_org;
  }else if (req.user.userrole.policy_scope =='四级') {
    conditions['level4_org'] = req.user.level4_org;
  }else if (req.user.userrole.policy_scope =='五级') {
    conditions['level5_org'] = req.user.level5_org;
  }

  var sortParam = "";
  if (req.body.orderByReverse) {
    sortParam = "-" + req.body.orderBy.toString();
  } else {
    sortParam = req.body.orderBy.toString();
  }

  if (req.body.fromDate != undefined && req.body.fromDate != '' && req.body.toDate != undefined) {
    conditions['created_at'] = { $gte: req.body.fromDate, $lte: req.body.toDate };
  } else if (req.body.fromDate != undefined && req.body.fromDate != '') {
    conditions['created_at'] = { $gte: req.body.fromDate };
  } else if (req.body.toDate != undefined) {
    conditions['created_at'] = { $lte: req.body.toDate };
  }

  var query = Policy.find(conditions);
  query
    .exec()
    .then(function (policies) {
      var totalIncome = 0;
      var totalPayment = 0;
      for (var i = 0; i < policies.length; i++) {
        totalIncome += policies[i].income;
        totalPayment += policies[i].payment;
      };
      res.status(200).json({
        total_income: totalIncome,
        total_payment: totalPayment,
        total_profit: totalIncome - totalPayment
      });
    }, function (err) {
      logger.error(err);
    })
});


router.post('/bulk-pay', function (req, res) {
  var ids = req.body.policyIds;
  var remarks = req.body.remarks;
  var query = Policy.find().where('_id').in(ids);
  query
    .exec()
    .then(function (policies) {
      for (var i = 0; i < policies.length; i++) {
        policies[i].policy_status = '已支付';
        policies[i].payment_remarks = remarks;
        policies[i].paid_at = Date.now();
        policies[i].save();
        logger.info(req.user.name + " 更新了一份批量财险保单，保单号为：" + policies[i].policy_no + "。" + req.clientIP);
      };
      logger.info(req.user.name + " 批量支付了批量财险保单。" + req.clientIP);
      res.json({ message: '保单状态已批量更改为已支付' });
    }, function (err) {
      logger.error(err);
    })
});

router.post('/bulk-delete', function (req, res) {
  var ids = req.body;
  Policy.remove({_id: {$in: ids}}, function (err, policies) {
    if (err) {
      logger.error(err);
      res.send(err);
    }
    logger.info(req.user.name + " 批量删除了批量财险保单。" + req.clientIP);
    res.json({ message: '保单已成功删除' });
  });
  
});


module.exports = router;

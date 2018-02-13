var express = require('express');
var db = require('../utils/database.js').connection;
var DealerPolicy = require('../models/dealerPolicy.js')(db);
var router = express.Router();
var Q = require('q');
var logger = require('../utils/logger.js');
var Client = require('../models/client.js')(db);
var iconv = require('iconv-lite');


router.post('/', function (req, res) {
  var data = req.body;

  // DealerPolicy.find({ applicant: {name: data.applicant.name}, plate_no: data.plate_no}, function (err, policies) {
  //   if (policies.length > 0) {
  //     res.status(400).send('系统中已存在相同保单号的保单');
  //   } else {
      if (!data.company && !data.level2_company) {
        res.status(400).send('二级保险公司必须填写');
      } else if((!data.commercial_policy_photo && !data.mandatory_policy_photo)){
        res.status(400).send('上传附件不齐全，请确保已上传保单照片和客户知情书');
      }else{
        var policy = new DealerPolicy(data);
        policy.policy_status = '待审核';
        policy.save(function (err, policy, numAffected) {
          if (err) {
            logger.error(err);
            res.status(500).send(err);
          } else {
            logger.info(req.user.name + " 提交了一份保单，保单号为：" + policy.policy_no + "。" + req.clientIP);
            res.status(200).json({ message: '保单已成功添加' });
          }
        });
      }
    // }
  // })
});

router.post('/excel', function (req, res) {
  var conditions = {};
  for (var key in req.body.filterByFields) {
    if (req.body.filterByFields.hasOwnProperty(key) && req.body.filterByFields[key] != null && req.body.filterByFields[key] != "") {
      conditions[key] = req.body.filterByFields[key];
    }
  }

  var sortParam = "";
  if (req.body.orderByReverse) {
    sortParam = "-" + req.body.orderBy.toString();
  } else {
    sortParam = req.body.orderBy.toString();
  }
  if (req.body.fromDate != undefined && req.body.toDate != undefined) {
    conditions['created_at'] = { $gte: req.body.fromDate, $lte: req.body.toDate };
  } else if (req.body.fromDate != undefined) {
    conditions['created_at'] = { $gte: req.body.fromDate };
  } else if (req.body.toDate != undefined) {
    conditions['created_at'] = { $lte: req.body.toDate };
  }

  var query = DealerPolicy.find(conditions);
  query
    .sort(sortParam)
    .populate('client level1_company level2_company level3_company level4_company')
    .exec()
    .then(function (policies) {
      var json2csv = require('json2csv');
      var fields = [
        'submitted_at',
        'mandatory_policy_no',
        'policy_no',
        'company.name',
        'company.contact',
        'applicant.payer',
        'applicant.name',
        'applicant.identity',
        'plate_no',
        'applicant.phone',
        'client.name',
        'client.bank',
        'client.account',
        'client.payee',
        'mandatory_fee',
        'mandatory_fee_taxed',
        'mandatory_fee_income_rate',
        'mandatory_fee_income',
        'commercial_fee',
        'commercial_fee_taxed',
        'commercial_fee_income_rate',
        'commercial_fee_income',
        'total_income',
        'policy_status',
        'paid_at',
        'payment_bank'
      ];
      var fieldNames = [
        '提交日期',
        '交强险保单号',
        '商业险保单号',
        '保险公司',
        '对接人',
        '投保人',
        '被保险人',
        '投保人身份证号',
        '车牌号',
        '投保人电话',
        '业务渠道',
        '开户行',
        '收款账号',
        '收款人',
        '交强险',
        '交强险(不含税)',
        '交强险跟单费比例',
        '交强险跟单费',
        '商业险',
        '商业险(不含税)',
        '商业险跟单费比例',
        '商业险跟单费',
        '跟单费总额',
        '保单状态',
        '支付日期',
        '支付银行'
      ];

      var dateFormat = require('dateformat');
      var arr = [];

      for (var i = 0; i < policies.length; i++) {
        var policy = policies[i];
        var row = {};
        row.company = {};
        row.applicant = {};
        row.client = {};
        row.submitted_date = (dateFormat(policy.submitted_date, "yyyy/mm/dd"));
        row.mandatory_policy_no = "'" + policy.mandatory_policy_no;
        row.policy_no = "'" + policy.policy_no;
        row.company.name = policy.level4_company ? policy.level4_company.name :  policy.level3_company? policy.level3_company.name :policy.level2_company? policy.level2_company.name : '';
        row.company.contact = policy.company ? policy.company.contact : policy.level4_company ? policy.level4_company.contact :  policy.level3_company? policy.level3_company.contact :policy.level2_company? policy.level2_company.contact : '';
        row.applicant.payer = policy.applicant.payer;
        row.applicant.name = policy.applicant.name;
        row.applicant.identity = "'" + policy.applicant.identity;
        row.plate_no = policy.plate_no;
        row.applicant.phone = "'" + policy.applicant.phone;
        row.client.name = policy.client ? policy.client.name : '';
        row.client.bank = policy.client ? policy.client.bank : '';
        row.client.account = policy.client ? "'" + policy.client.account : '';
        row.client.payee = policy.client ? policy.client.payee : '';
        row.mandatory_fee = policy.mandatory_fee;
        row.mandatory_fee_taxed = policy.mandatory_fee/1.06;
        row.mandatory_fee_taxed = row.mandatory_fee_taxed.toFixed(2);
        row.mandatory_fee_income_rate = policy.mandatory_fee_income_rate + "%";
        row.mandatory_fee_income = policy.mandatory_fee_income;
        row.commercial_fee = policy.commercial_fee;
        row.commercial_fee_taxed = policy.commercial_fee/1.06;
        row.commercial_fee_taxed = row.commercial_fee_taxed.toFixed(2);
        row.commercial_fee_income_rate = policy.commercial_fee_income_rate + "%";
        row.commercial_fee_income = policy.commercial_fee_income;
        row.total_income = policy.total_income;
        row.policy_status = policy.policy_status;
        row.paid_at = policy.paid_at ? (dateFormat(policy.paid_at, "mm/dd/yyyy")) : '';
        row.payment_bank = policy.payment_bank ? policy.payment_bank : '';
        arr.push(row);
      }
      json2csv({ data: arr, fields: fields, fieldNames: fieldNames }, function (err, csv) {
        if (err) console.log(err);

        var dataBuffer = Buffer.concat([new Buffer('\xEF\xBB\xBF', 'binary'), new Buffer(csv)]);
        res.setHeader('Content-Type', 'text/csv;charset=utf-8');
        res.setHeader("Content-Disposition", "attachment;filename=" + "dealer-statistics.csv");
        res.send(dataBuffer);
      });
    }, function (err) {
      logger.error(err);
    })
});

router.get('/:id', function (req, res) {
  DealerPolicy.findOne({ _id: req.params.id })
    .populate('client dealer')
    .exec()
    .then(function (policy) {
      res.status(200).json(policy);
    }, function (err) {
      logger.error(err);
      res.status(500).send(err);
    });
});

router.put('/:id', function (req, res) {
  if (!req.body.company && !req.body.level2_company) {
    res.status(400).send('第二级保险公司必须填写');
  }
  DealerPolicy.findById(req.params.id, function (err, policy) {
    if (err)
      res.send(err);
    // policy.policy_no = req.body.policy_no;
    policy.plate_no = req.body.plate_no;
    policy.applicant = req.body.applicant;
    // policy.frame_no = req.body.frame_no;
    // policy.engine_no = req.body.engine_no;
    policy.mandatory_fee = req.body.mandatory_fee;
    policy.mandatory_fee_taxed = req.body.mandatory_fee_taxed;
    policy.mandatory_fee_income_rate = req.body.mandatory_fee_income_rate;
    policy.mandatory_fee_income = req.body.mandatory_fee_income;
    policy.commercial_fee = req.body.commercial_fee;
    policy.commercial_fee_taxed = req.body.commercial_fee_taxed;
    policy.commercial_fee_income_rate = req.body.commercial_fee_income_rate;
    policy.commercial_fee_income = req.body.commercial_fee_income;
    policy.client = req.body.client;
    policy.policy_status = req.body.policy_status;
    policy.paid_at = req.body.paid_at;
    policy.total_income = req.body.total_income;
    policy.profit = req.body.profit;
    policy.payment_substract_rate = req.body.payment_substract_rate;
    policy.total_payment = req.body.total_payment;

    // policy.effective_date = req.body.effective_date;
    policy.level1_company = req.body.level1_company;
    policy.level2_company = req.body.level2_company;
    policy.level3_company = req.body.level3_company;
    policy.level4_company = req.body.level4_company;
    // policy.has_warning = req.body.has_warning;
    policy.rates_based_on_taxed = req.body.rates_based_on_taxed;
    // policy.submitted_date = req.body.submitted_date;
    policy.mandatory_policy_photo = req.body.mandatory_policy_photo;
    policy.commercial_policy_photo = req.body.commercial_policy_photo;
    policy.payment_remarks = req.body.payment_remarks;
    policy.comment = req.body.comment;
    policy.agreement_photo = req.body.agreement_photo;
    policy.save(function (err) {
      if (err) {
        logger.error(err);
        res.send(err);
      }
      logger.info(req.user.name + " 更新了一份保单，保单号为：" + policy.policy_no + "。" + req.clientIP);
      res.json({ message: '保单已成功更新' });
    });

  });
});

router.delete('/:id', function (req, res) {
  DealerPolicy.remove({ _id: req.params.id }, function (err, policy) {
    if (err) {
      logger.error(err);
      res.send(err);
    }
    logger.info(req.user.name + " 删除了一份保单。" + req.clientIP);
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

  if (['渠道录单员'].indexOf(req.user.role) != -1) {
    conditions['client'] = req.user.client;
  }

  var sortParam = "";
  if (req.body.orderByReverse) {
    sortParam = "-" + req.body.orderBy.toString();
  } else {
    sortParam = req.body.orderBy.toString();
  }

  if (req.body.fromDate != undefined && req.body.fromDate !='' && req.body.toDate != undefined) {
    conditions['created_at'] = { $gte: req.body.fromDate, $lte: req.body.toDate };
  } else if (req.body.fromDate != undefined && req.body.fromDate !='' ) {
    conditions['created_at'] = { $gte: req.body.fromDate };
  } else if (req.body.toDate != undefined) {
    conditions['created_at'] = { $lte: req.body.toDate };
  }
  var query = DealerPolicy.find(conditions);
  query
    .sort(sortParam)
    .skip(req.body.currentPage * req.body.pageSize)
    .limit(req.body.pageSize)
    .populate('client level2_company level3_company level4_company')
    .exec()
    .then(function (policies) {
      DealerPolicy.count(conditions, function (err, c) {
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

  if (['渠道录单员'].indexOf(req.user.role) != -1) {
    conditions['client'] = req.user.client;
  }

  var sortParam = "";
  if (req.body.orderByReverse) {
    sortParam = "-" + req.body.orderBy.toString();
  } else {
    sortParam = req.body.orderBy.toString();
  }

  if (req.body.fromDate != undefined && req.body.toDate != undefined) {
    conditions['created_at'] = { $gte: req.body.fromDate, $lte: req.body.toDate };
  } else if (req.body.fromDate != undefined) {
    conditions['created_at'] = { $gte: req.body.fromDate };
  } else if (req.body.toDate != undefined) {
    conditions['created_at'] = { $lte: req.body.toDate };
  }

  var query = DealerPolicy.find(conditions);
  query
    .exec()
    .then(function (policies) {
      var totalIncome = 0;
      var totalPayment = 0;
      for (var i = 0; i < policies.length; i++) {
        totalIncome += policies[i].total_income;
        totalPayment += policies[i].total_payment;
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

router.post('/update-photo', function (req, res) {
   DealerPolicy.findById(req.body._id, function (err, policy) {
    if (err)
      res.send(err);
    policy.mandatory_policy_photo = req.body.mandatory_policy_photo;
    policy.commercial_policy_photo = req.body.commercial_policy_photo;
    policy.agreement_photo = req.body.agreement_photo;
    policy.sign_photo = req.body.sign_photo;
    policy.other_photo = req.body.other_photo;
    policy.save(function (err) {
      if (err) {
        logger.error(err);
        res.send(err);
      }
      logger.info(req.user.name + " 更新了保单扫描件，车牌号：" + policy.plate_no + "。" + req.clientIP);
      res.json({ message: '扫描件已成功更新' });
    });

  });
});


router.post('/bulk-pay', function (req, res) {
  var ids = req.body.policyIds;
  var remarks = req.body.remarks;
  var query = DealerPolicy.find().where('_id').in(ids);
  query
    .exec()
    .then(function (policies) {
      for (var i = 0; i < policies.length; i++) {
        policies[i].policy_status = '已支付';
        policies[i].payment_remarks = remarks;
        policies[i].paid_at = Date.now();
        policies[i].save();
        logger.info(req.user.name + " 更新了保单扫描件，车牌号：" + policies[i].plate_no + "。" + req.clientIP);
      };
      logger.info(req.user.name + " 批量支付了保单。" + req.clientIP);
      res.json({ message: '保单状态已批量更改为已支付' });
    }, function (err) {
      logger.error(err);
    })
});


router.post('/bulk-approve', function (req, res) {
  var ids = req.body;
  var query = DealerPolicy.find().where('_id').in(ids);
  query
    .exec()
    .then(function (policies) {
      for (var i = 0; i < policies.length; i++) {
        policies[i].policy_status = '待支付';
        policies[i].paid_at = Date.now();
        policies[i].save();
        logger.info(req.user.name + " 更新了一份保单，保单号为：" + policies[i].policy_no + "。" + req.clientIP);
      };
      logger.info(req.user.name + " 批量审批通过了保单。" + req.clientIP);
      res.json({ message: '保单已成功批量审批通过' });
    }, function (err) {
      logger.error(err);
    })
});

module.exports = router;

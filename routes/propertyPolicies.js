var express = require('express');
var db = require('../utils/database.js').connection;
var router = express.Router();
var Q = require('q');
var asyncMiddleware = require('../middlewares/asyncMiddleware');
var Promise = require('bluebird');
var logger = require('../utils/logger.js');
var Policy = Promise.promisifyAll(require('../models/property-policy.js')(db));
var iconv = require('iconv-lite');


router.post('/', function (req, res) {
  var data = req.body;
  var policy_no = data.policy_no;
  if(!policy_no){
    policy_no = "-999";
  }

  Policy.find({ policy_no: policy_no }, function (err, policies) {
    if (policies.length > 0 && !data.ignore_duplicate) {
      res.status(200).json({duplicate: true});
    } else {
      if (!data.level2_company) {
        res.status(400).send('二级保险公司必须填写');
      } else {
        var policy = new Policy(data);
        policy.seller = req.user._id;
        policy.organization = req.user.org;
        policy.policy_status = '待审核';
        policy.save(function (err, policy, numAffected) {
          if (err) {
            logger.error(err);
            res.status(500).send(err);
          } else {
            logger.info(req.user.name + " 提交了一份财险保单，保单号为：" + policy.policy_no + "。" + req.clientIP);
            res.status(200).json({ message: '保单已成功添加' });
          }
        });
      }


    }

  })
});


router.post('/excel', function (req, res) {
  var conditions = {};
  for (var key in req.body.filterByFields) {
    if (req.body.filterByFields.hasOwnProperty(key) && req.body.filterByFields[key] != null && req.body.filterByFields[key] != "") {
      conditions[key] = req.body.filterByFields[key];
    }
  }

  if (req.user.userrole.scope != '全公司') {
    conditions['seller'] = req.user._id;
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
  var query = Policy.find(conditions);
  query
    .sort(sortParam)
    .populate('client seller organization company level1_company level2_company level3_company level4_company')
    .exec()
    .then(function (policies) {
      var json2csv = require('json2csv');
      var fields = [
        'created_at',
        'policy_no',
        'company.name',
        'company.contact',
        'payer_name',
        'insured_name',
        'phone',
        'start_date',
        'end_date',
        'organization.name',
        'seller_name',
        'client.name',
        'client.bank',
        'client.account',
        'client.payee',
        'total_fee',
        'total_fee_taxed',
        'income_rate',
        'total_income',
        'payment_rate',
        'payment_addition',
        'payment_substraction',
        'total_payment',
        'total_profit',
        'policy_status',
        'paid_at',
        'remark',
      ];
      var fieldNames = [
        '提交日期',
        '保单号',
        '保险公司',
        '对接人',
        '投保人',
        '被保险人',
        '投保人电话',
        '其实日期',
        '结束日期',
        '营业部',
        '出单员',
        '代理人',
        '开户行',
        '收款账号',
        '收款人',
        '保费',
        '保费(不含税)',
        '跟单费比例',
        '跟单费',
        '结算费比例',
        '结算费加项',
        '结算费减项',
        '结算费',
        '毛利润',
        '保单状态',
        '支付日期',
        '备注'
      ];

      var dateFormat = require('dateformat');
      var arr = [];

      for (var i = 0; i < policies.length; i++) {
        var policy = policies[i];
        var row = {};
        row.company = {};
        row.organization = {};
        row.seller = {};
        row.client = {};
        row.created_at = (dateFormat(policy.created_at, "mm/dd/yyyy"));
        row.policy_no = "'" + policy.policy_no;
        row.company.name = policy.level4_company ? policy.level4_company.name :  policy.level3_company? policy.level3_company.name :policy.level2_company? policy.level2_company.name : '';
        row.company.contact = policy.level4_company ? policy.level4_company.contact :  policy.level3_company? policy.level3_company.contact :policy.level2_company? policy.level2_company.contact : '';
        row.payer_name = policy.payer_name;
        row.insured_name = policy.insured_name;
        row.phone = "'" + policy.phone;
        row.start_date = (dateFormat(policy.start_date, "mm/dd/yyyy"));
        row.end_date = (dateFormat(policy.end_date, "mm/dd/yyyy"));
        row.organization.name = policy.organization ? policy.organization.name : "";
        row.seller_name = policy.seller.name;
        row.client.name = policy.client ? policy.client.name : '';
        row.client.bank = policy.client ? policy.client.bank : '';
        row.client.account = policy.client ? "'" + policy.client.account : '';
        row.client.payee = policy.client ? policy.client.payee : '';
        row.total_fee = policy.total_fee;
        row.total_fee_taxed = policy.total_fee/1.06;
        row.total_fee_taxed = row.total_fee_taxed.toFixed(2);
        row.income_rate = policy.income_rate + "%";
        row.total_income = policy.total_income;
        row.payment_rate = policy.payment_rate + "%";
        row.payment_addition = policy.payment_addition;
        row.payment_substraction = policy.payment_substraction;
        row.total_payment = policy.total_payment;

        row.total_profit = policy.total_income - policy.total_payment;
        row.total_profit = row.total_profit.toFixed(2);
        
        row.policy_status = policy.policy_status;
        row.paid_at = policy.paid_at ? (dateFormat(policy.paid_at, "mm/dd/yyyy")) : '';
        row.remark = policy.remark ? policy.remark : '';
        arr.push(row);
      }
      json2csv({ data: arr, fields: fields, fieldNames: fieldNames }, function (err, csv) {
        if (err) console.log(err);

        var dataBuffer = Buffer.concat([new Buffer('\xEF\xBB\xBF', 'binary'), new Buffer(csv)]);
        res.setHeader('Content-Type', 'text/csv;charset=utf-8');
        res.setHeader("Content-Disposition", "attachment;filename=" + "propertyPolicies.csv");
        res.send(dataBuffer);
      });
    }, function (err) {
      logger.error(err);
    })
});

router.get('/:id', function (req, res) {
  Policy.findOne({ _id: req.params.id })
    .populate('client organization seller')
    .exec()
    .then(function (policy) {
      res.status(200).json(policy);
    }, function (err) {
      logger.error(err);
      res.status(500).send(err);
    });
});

router.put('/:id', asyncMiddleware(async (req, res, next) => {
  if (!req.body.level2_company) {
    res.status(400).send('第二级保险公司必须填写');
  }
  await Policy.findOneAndUpdateAsync({_id:req.params.id}, req.body);
  logger.info(req.user.name + " 更新了一份财险保单，保单号为：" + policy.policy_no + "。" + req.clientIP);
  res.json({ message: '保单已成功更新' });
}));

router.delete('/:id', function (req, res) {
  Policy.remove({ _id: req.params.id }, function (err, policy) {
    if (err) {
      logger.error(err);
      res.send(err);
    }
    logger.info(req.user.name + " 删除了一份财险保单。" + req.clientIP);
    res.json({ message: '财险保单已成功删除' });
  });
});

router.post('/search', function (req, res) {
  var conditions = {};

  for (var key in req.body.filterByFields) {
    if (req.body.filterByFields.hasOwnProperty(key) && req.body.filterByFields[key] != null && req.body.filterByFields[key] != "") {
      conditions[key] = req.body.filterByFields[key];
    }
  }

  if (req.user.userrole.scope != '全公司') {
    conditions['seller'] = req.user._id;
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
  var query = Policy.find(conditions);
  query
    .sort(sortParam)
    .skip(req.body.currentPage * req.body.pageSize)
    .limit(req.body.pageSize)
    .populate('client seller organization company level2_company level3_company level4_company')
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


router.post('/update-photo', function (req, res) {
   Policy.findById(req.body._id, function (err, policy) {
    if (err)
      res.send(err);
    policy.policy_photo = req.body.policy_photo;
    policy.agreement_photo = req.body.agreement_photo;
    policy.other_photo = req.body.other_photo;
    policy.identity_photo = req.body.identity_photo;
    policy.sign_photo = req.body.sign_photo;
    policy.save(function (err) {
      if (err) {
        logger.error(err);
        res.send(err);
      }
      logger.info(req.user.name + " 更新了财险保单扫描件，保单号为：" + policy.policy_no + "。" + req.clientIP);
      res.json({ message: '扫描件已成功更新' });
    });

  });
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
        policies[i].remarks = remarks;
        policies[i].paid_at = Date.now();
        policies[i].save();
        logger.info(req.user.name + " 更新了一份财险保单，保单号为：" + policies[i].policy_no + "。" + req.clientIP);
      };
      logger.info(req.user.name + " 批量支付了财险保单。" + req.clientIP);
      res.json({ message: '财险保单状态已批量更改为已支付' });
    }, function (err) {
      logger.error(err);
    })
});


router.post('/bulk-approve', function (req, res) {
  var ids = req.body;
  var query = Policy.find().where('_id').in(ids);
  query
    .exec()
    .then(function (policies) {
      for (var i = 0; i < policies.length; i++) {
        policies[i].policy_status = '待支付';
        policies[i].save();
        logger.info(req.user.name + " 更新了一份财险保单，保单号为：" + policies[i].policy_no + "。" + req.clientIP);
      };
      logger.info(req.user.name + " 批量审批通过了财险保单。" + req.clientIP);
      res.json({ message: '财险保单已成功批量审批通过' });
    }, function (err) {
      logger.error(err);
    })
});

module.exports = router;
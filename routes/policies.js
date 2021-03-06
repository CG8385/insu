var express = require('express');
var db = require('../utils/database.js').connection;
var Policy = require('../models/policy.js')(db);
var router = express.Router();
var Q = require('q');
var logger = require('../utils/logger.js');
var Client = require('../models/client.js')(db);
var iconv = require('iconv-lite');


router.post('/', function (req, res) {
  var data = req.body;
  var policy_no = data.policy_no;
  if(!policy_no){
    policy_no = "-999";
  }
  var mandatory_policy_no = data.mandatory_policy_no;
  if(!mandatory_policy_no){
    mandatory_policy_no = "-999";
  }
  Policy.find({$or: [{ policy_no: policy_no },{mandatory_policy_no: mandatory_policy_no}]}, function (err, policies) {
    if (policies.length > 0 && !data.ignore_duplicate) {
      res.status(200).json({duplicate: true});
    } else {
      if (!data.company && !data.level2_company) {
        res.status(400).send('二级保险公司必须填写');
      } else {
        var policy = new Policy(data);
        policy.policy_status = '待审核';
        policy.save(function (err, policy, numAffected) {
          if (err) {
            logger.error(err);
            res.status(500).send(err);
          } else {
            if(data.cloned_from){
              logger.info(req.user.name + " 续期了一份保单，新保单号为：" + policy.policy_no + "。" + req.clientIP);
              Policy.findOne({ _id: data.cloned_from }, function(err, parentPolicy){
                if(parentPolicy){
                  parentPolicy.stop_reminder = true;
                  parentPolicy.save();
                  res.status(200).json({ message: '保单已成功续期' });
                }
            })
            }else{
              logger.info(req.user.name + " 提交了一份保单，保单号为：" + policy.policy_no + "。" + req.clientIP);
              res.status(200).json({ message: '保单已成功添加' });
            }

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
  if (req.body.fromDate != undefined && req.body.toDate != undefined) {
    conditions['created_at'] = { $gte: req.body.fromDate, $lte: req.body.toDate };
  } else if (req.body.fromDate != undefined) {
    conditions['created_at'] = { $gte: req.body.fromDate };
  } else if (req.body.toDate != undefined) {
    conditions['created_at'] = { $lte: req.body.toDate };
  }
  if (req.body.approvedFromDate != undefined && req.body.approvedFromDate !='' && req.body.approvedToDate != undefined) {
    conditions['updated_at'] = { $gte: req.body.approvedFromDate, $lte: req.body.approvedToDate };
  } else if (req.body.approvedFromDate != undefined && req.body.approvedFromDate !='' ) {
    conditions['updated_at'] = { $gte: req.body.approvedFromDate };
  } else if (req.body.approvedToDate != undefined) {
    conditions['updated_at'] = { $lte: req.body.approvedToDate };
  }

  if (req.body.paidFromDate != undefined && req.body.paidFromDate !='' && req.body.paidToDate != undefined) {
    conditions['updated_at'] = { $gte: req.body.paidFromDate, $lte: req.body.paidToDate };
  } else if (req.body.paidFromDate != undefined && req.body.paidFromDate !='' ) {
    conditions['updated_at'] = { $gte: req.body.paidFromDate };
  } else if (req.body.paidToDate != undefined) {
    conditions['updated_at'] = { $lte: req.body.paidToDate };
  }

  if (req.body.effectiveFromDate != undefined && req.body.effectiveFromDate !='' && req.body.effectiveToDate != undefined) {
    conditions['effective_date'] = { $gte: req.body.effectiveFromDate, $lte: req.body.effectiveToDate };
  } else if (req.body.effectiveFromDate != undefined && req.body.effectiveFromDate !='' ) {
    conditions['effective_date'] = { $gte: req.body.effectiveFromDate };
  } else if (req.body.effectiveToDate != undefined) {
    conditions['effective_date'] = { $lte: req.body.effectiveToDate };
  }

  if (req.body.swipedFromDate != undefined && req.body.swipedFromDate !='' && req.body.swipedToDate != undefined) {
    conditions['swiped_at'] = { $gte: req.body.swipedFromDate, $lte: req.body.swipedToDate };
  } else if (req.body.swipedFromDate != undefined && req.body.swipedFromDate !='' ) {
    conditions['swiped_at'] = { $gte: req.body.swipedFromDate };
  } else if (req.body.swipedToDate != undefined) {
    conditions['swiped_at'] = { $lte: req.body.swipedToDate };
  }

  if(conditions.organization){
    delete conditions.organization;
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
        'swiped_at',
        'mandatory_policy_no',
        'policy_no',
        'company.name',
        'company.contact',
        'applicant.payer',
        'applicant.name',
        'applicant.identity',
        'plate_no',
        'applicant.phone',
        'organization.name',
        'seller.name',
        'client.name',
        'client.bank',
        'client.account',
        'client.payee',
        'mandatory_fee',
        'mandatory_fee_taxed',
        'mandatory_fee_income_rate',
        'mandatory_fee_income',
        'mandatory_fee_payment_rate',
        'mandatory_fee_payment',
        'mandatory_fee_profit',
        'commercial_fee',
        'commercial_fee_taxed',
        'commercial_fee_income_rate',
        'commercial_fee_income',
        'commercial_fee_payment_rate',
        'commercial_fee_payment',
        'commercial_fee_profit',
        'tax_fee',
        'tax_fee_income_rate',
        'tax_fee_income',
        'tax_fee_payment_rate',
        'tax_fee_payment',
        'tax_fee_profit',
        'other_fee',
        'other_fee_taxed',
        'other_fee_income_rate',
        'other_fee_income',
        'other_fee_payment_rate',
        'other_fee_payment',
        'other_fee_profit',
        'payment_addition',
        'payment_substraction',
        'total_income',
        'total_payment',
        'total_profit',
        'policy_status',
        'approved_at',
        'paid_at',
        'payment_bank',
        'expired_at',
        'remark',
      ];
      var fieldNames = [
        '提交日期',
        '刷卡日期',
        '交强险保单号',
        '商业险保单号',
        '保险公司',
        '对接人',
        '投保人',
        '被保险人',
        '投保人身份证号',
        '车牌号',
        '投保人电话',
        '营业部',
        '出单员',
        '业务渠道',
        '开户行',
        '收款账号',
        '收款人',
        '交强险',
        '交强险(不含税)',
        '交强险跟单费比例',
        '交强险跟单费',
        '交强险结算费比例',
        '交强险结算费',
        '交强险毛利润',
        '商业险',
        '商业险(不含税)',
        '商业险跟单费比例',
        '商业险跟单费',
        '商业险结算费比例',
        '商业险结算费',
        '商业险毛利润',
        '车船税',
        '车船税跟单费',
        '车船税跟单费比例',
        '车船税结算费',
        '车船税结算费',
        '车船税毛利润',
        '其他险',
        '其他险(不含税)',
        '其他险跟单费',
        '其他险跟单费比例',
        '其他险结算费',
        '其他险结算费',
        '其他险毛利润',
        '结算费加项',
        '结算费减项',
        '跟单费总额',
        '结算费总额',
        '总毛利润',
        '保单状态',
        '审核日期',
        '支付日期',
        '支付银行',
        '到期日期',
        '备注',
      ];

      var dateFormat = require('dateformat');
      var arr = [];

      for (var i = 0; i < policies.length; i++) {
        var policy = policies[i];
        var row = {};
        row.company = {};
        row.applicant = {};
        row.organization = {};
        row.seller = {};
        row.client = {};
        row.created_at = (dateFormat(policy.created_at, "mm/dd/yyyy"));
        row.swiped_at = policy.swiped_at ? (dateFormat(policy.swiped_at, "mm/dd/yyyy")) : '';
        row.mandatory_policy_no = "'" + policy.mandatory_policy_no;
        row.policy_no = "'" + policy.policy_no;
        row.company.name = policy.company ? policy.company.name : policy.level4_company ? policy.level4_company.name :  policy.level3_company? policy.level3_company.name :policy.level2_company? policy.level2_company.name : '';
        row.company.contact = policy.company ? policy.company.contact : policy.level4_company ? policy.level4_company.contact :  policy.level3_company? policy.level3_company.contact :policy.level2_company? policy.level2_company.contact : '';
        row.applicant.payer = policy.applicant.payer;
        row.applicant.name = policy.applicant.name;
        row.applicant.identity = "'" + policy.applicant.identity;
        row.plate_no = policy.plate_no;
        row.applicant.phone = "'" + policy.applicant.phone;
        row.organization.name = policy.organization ? policy.organization.name : "";
        row.seller.name = policy.seller ? policy.seller.name : "";
        row.client.name = policy.client ? policy.client.name : '';
        row.client.bank = policy.client ? policy.client.bank : '';
        row.client.account = policy.client ? "'" + policy.client.account : '';
        row.client.payee = policy.client ? policy.client.payee : '';
        row.mandatory_fee = policy.mandatory_fee;
        row.mandatory_fee_taxed = policy.mandatory_fee/1.06;
        row.mandatory_fee_taxed = row.mandatory_fee_taxed.toFixed(2);
        row.mandatory_fee_income_rate = policy.mandatory_fee_income_rate + "%";
        row.mandatory_fee_income = policy.mandatory_fee_income;
        row.mandatory_fee_payment_rate = policy.mandatory_fee_payment_rate + "%";
        row.mandatory_fee_payment = policy.mandatory_fee_payment;
        row.mandatory_fee_profit = policy.mandatory_fee_income - policy.mandatory_fee_payment;
        row.mandatory_fee_profit = row.mandatory_fee_profit.toFixed(2);
        row.commercial_fee = policy.commercial_fee;
        row.commercial_fee_taxed = policy.commercial_fee/1.06;
        row.commercial_fee_taxed = row.commercial_fee_taxed.toFixed(2);
        row.commercial_fee_income_rate = policy.commercial_fee_income_rate + "%";
        row.commercial_fee_income = policy.commercial_fee_income;
        row.commercial_fee_payment_rate = policy.commercial_fee_payment_rate + "%";
        row.commercial_fee_payment = policy.commercial_fee_payment;
        row.commercial_fee_profit = policy.commercial_fee_income - policy.commercial_fee_payment;
        row.commercial_fee_profit = row.commercial_fee_profit.toFixed(2);
        row.tax_fee = policy.tax_fee;
        row.tax_fee_income_rate = policy.tax_fee_income_rate + "%";
        row.tax_fee_income = policy.tax_fee_income;
        row.tax_fee_payment_rate = policy.tax_fee_payment_rate + "%";
        row.tax_fee_payment = policy.tax_fee_payment;
        row.tax_fee_profit = policy.tax_fee_income - policy.tax_fee_payment;
        row.tax_fee_profit = row.tax_fee_profit.toFixed(2);
        row.other_fee = policy.other_fee;
        row.other_fee_taxed = policy.other_fee/1.06;
        row.other_fee_taxed = row.other_fee_taxed.toFixed(2);
        row.other_fee_income_rate = policy.other_fee_income_rate + "%";
        row.other_fee_income = policy.other_fee_income;
        row.other_fee_payment_rate = policy.other_fee_payment_rate + "%";
        row.other_fee_payment = policy.other_fee_payment;
        row.other_fee_profit = policy.other_fee_income - policy.other_fee_payment;
        row.other_fee_profit = row.other_fee_profit.toFixed(2);
        row.payment_addition = policy.payment_addition ? policy.payment_addition : 0;
        row.payment_substraction = policy.payment_substraction ? policy.payment_substraction : 0;
        row.total_income = policy.total_income;
        row.total_payment = policy.total_payment;
        row.total_profit = policy.total_income - policy.total_payment;
        row.total_profit = row.total_profit.toFixed(2);
        row.policy_status = policy.policy_status;
        row.approved_at = policy.approved_at ? (dateFormat(policy.approved_at, "mm/dd/yyyy")) : '';
        row.paid_at = policy.paid_at ? (dateFormat(policy.paid_at, "mm/dd/yyyy")) : '';
        row.payment_bank = policy.payment_bank ? policy.payment_bank : '';
        row.remark = policy.comment ? policy.comment : '';
        if (!policy.effective_date) {
          row.expired_at = '';
        } else{
          var expireDate = new Date(policy.effective_date);
            expireDate.setFullYear(expireDate.getFullYear() + 1);
            var month = '' + (expireDate.getMonth() + 1),
                day = '' + expireDate.getDate(),
                year = expireDate.getFullYear();
            if (month.length < 2) month = '0' + month;
            if (day.length < 2) day = '0' + day;
            row.expired_at = [month,day,year].join('/');
        }
        arr.push(row);
      }
      json2csv({ data: arr, fields: fields, fieldNames: fieldNames }, function (err, csv) {
        if (err) console.log(err);

        var dataBuffer = Buffer.concat([new Buffer('\xEF\xBB\xBF', 'binary'), new Buffer(csv)]);
        res.setHeader('Content-Type', 'text/csv;charset=utf-8');
        res.setHeader("Content-Disposition", "attachment;filename=" + "statistics.csv");
        res.send(dataBuffer);
      });
    }, function (err) {
      logger.error(err);
    })
});

router.get('/:id', function (req, res) {
  Policy.findOne({ _id: req.params.id })
    .populate('client organization')
    .populate({ path: 'seller', model: 'User', populate: { path: 'org', model: 'Organization' } })
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
  Policy.findById(req.params.id, function (err, policy) {
    if (err)
      res.send(err);
    policy.policy_no = req.body.policy_no;
    policy.mandatory_policy_no = req.body.mandatory_policy_no;
    policy.plate_no = req.body.plate_no;
    policy.applicant = req.body.applicant;
    policy.frame_no = req.body.frame_no;
    policy.engine_no = req.body.engine_no;
    policy.mandatory_fee = req.body.mandatory_fee;
    policy.mandatory_fee_taxed = req.body.mandatory_fee_taxed;
    policy.mandatory_fee_income_rate = req.body.mandatory_fee_income_rate;
    policy.mandatory_fee_income = req.body.mandatory_fee_income;
    policy.mandatory_fee_payment_rate = req.body.mandatory_fee_payment_rate;
    policy.mandatory_fee_payment = req.body.mandatory_fee_payment;
    policy.commercial_fee = req.body.commercial_fee;
    policy.commercial_fee_taxed = req.body.commercial_fee_taxed;
    policy.commercial_fee_income_rate = req.body.commercial_fee_income_rate;
    policy.commercial_fee_income = req.body.commercial_fee_income;
    policy.commercial_fee_payment_rate = req.body.commercial_fee_payment_rate;
    policy.commercial_fee_payment = req.body.commercial_fee_payment;
    policy.tax_fee = req.body.tax_fee;
    policy.tax_fee_income_rate = req.body.tax_fee_income_rate;
    policy.tax_fee_income = req.body.tax_fee_income;
    policy.tax_fee_payment_rate = req.body.tax_fee_payment_rate;
    policy.tax_fee_payment = req.body.tax_fee_payment;
    policy.other_fee = req.body.other_fee;
    policy.other_fee_taxed = req.body.other_fee_taxed;
    policy.other_fee_income_rate = req.body.other_fee_income_rate;
    policy.other_fee_income = req.body.other_fee_income;
    policy.other_fee_payment_rate = req.body.other_fee_payment_rate;
    policy.other_fee_payment = req.body.other_fee_payment;
    policy.client = req.body.client;
    policy.seller = req.body.seller;
    policy.policy_status = req.body.policy_status;
    policy.approved_at = req.body.approved_at;
    policy.paid_at = req.body.paid_at;
    policy.total_income = req.body.total_income;
    policy.payment_addition = req.body.payment_addition;
    policy.payment_addition_comment = req.body.payment_addition_comment;
    policy.payment_substraction_rate = req.body.payment_substraction_rate;
    policy.payment_substraction = req.body.payment_substraction;
    policy.payment_substraction_comment = req.body.payment_substraction_comment;
    policy.total_payment = req.body.total_payment;
    policy.effective_date = req.body.effective_date;
    policy.swiped_at = req.body.swiped_at;
    policy.catogary = req.body.catogary;
    policy.payment_bank = req.body.payment_bank;
    policy.payment_proof = req.body.payment_proof;
    policy.company = req.body.company;
    policy.rule = req.body.rule;
    policy.comment = req.body.comment;

    policy.level1_company = req.body.level1_company;
    policy.level2_company = req.body.level2_company;
    policy.level3_company = req.body.level3_company;
    policy.level4_company = req.body.level4_company;
    policy.rule_rates = req.body.rule_rates;
    policy.has_warning = req.body.has_warning;
    policy.organization = req.body.organization;
    policy.rates_based_on_taxed = req.body.rates_based_on_taxed;
    policy.cloned_from = req.body.cloned_from;
    policy.stop_reminder = req.body.stop_reminder;
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
  Policy.remove({ _id: req.params.id }, function (err, policy) {
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
    if (req.body.filterByFields.hasOwnProperty(key) && req.body.filterByFields[key] !== null && req.body.filterByFields[key] !== "") {
      conditions[key] = req.body.filterByFields[key];
    }
  }

  if (req.user.userrole.policy_scope == '本人') {
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

  if (req.body.fromDate != undefined && req.body.fromDate !='' && req.body.toDate != undefined) {
    conditions['created_at'] = { $gte: req.body.fromDate, $lte: req.body.toDate };
  } else if (req.body.fromDate != undefined && req.body.fromDate !='' ) {
    conditions['created_at'] = { $gte: req.body.fromDate };
  } else if (req.body.toDate != undefined) {
    conditions['created_at'] = { $lte: req.body.toDate };
  }

  if (req.body.approvedFromDate != undefined && req.body.approvedFromDate !='' && req.body.approvedToDate != undefined) {
    conditions['updated_at'] = { $gte: req.body.approvedFromDate, $lte: req.body.approvedToDate };
  } else if (req.body.approvedFromDate != undefined && req.body.approvedFromDate !='' ) {
    conditions['updated_at'] = { $gte: req.body.approvedFromDate };
  } else if (req.body.approvedToDate != undefined) {
    conditions['updated_at'] = { $lte: req.body.approvedToDate };
  }

  if (req.body.paidFromDate != undefined && req.body.paidFromDate !='' && req.body.paidToDate != undefined) {
    conditions['updated_at'] = { $gte: req.body.paidFromDate, $lte: req.body.paidToDate };
  } else if (req.body.paidFromDate != undefined && req.body.paidFromDate !='' ) {
    conditions['updated_at'] = { $gte: req.body.paidFromDate };
  } else if (req.body.paidToDate != undefined) {
    conditions['updated_at'] = { $lte: req.body.paidToDate };
  }

  if (req.body.effectiveFromDate != undefined && req.body.effectiveFromDate !='' && req.body.effectiveToDate != undefined) {
    conditions['effective_date'] = { $gte: req.body.effectiveFromDate, $lte: req.body.effectiveToDate };
  } else if (req.body.effectiveFromDate != undefined && req.body.effectiveFromDate !='' ) {
    conditions['effective_date'] = { $gte: req.body.effectiveFromDate };
  } else if (req.body.effectiveToDate != undefined) {
    conditions['effective_date'] = { $lte: req.body.effectiveToDate };
  }

  if (req.body.swipedFromDate != undefined && req.body.swipedFromDate !='' && req.body.swipedToDate != undefined) {
    conditions['swiped_at'] = { $gte: req.body.swipedFromDate, $lte: req.body.swipedToDate };
  } else if (req.body.swipedFromDate != undefined && req.body.swipedFromDate !='' ) {
    conditions['swiped_at'] = { $gte: req.body.swipedFromDate };
  } else if (req.body.swipedToDate != undefined) {
    conditions['swiped_at'] = { $lte: req.body.swipedToDate };
  }

  if (req.body.policyNoSearch != undefined && req.body.policyNoSearch !='') {
    let searchText = '/' + req.body.policyNoSearch + '/';
    // conditions['policy_no']= {$regex : req.body.policyNoSearch, $options : 'i'}
    conditions.$or = [{ policy_no: {$regex : req.body.policyNoSearch, $options : 'i'} },{mandatory_policy_no: {$regex : req.body.policyNoSearch, $options : 'i'}}]
  }
  

  if(conditions.organization){
    delete conditions.organization;
  }

  console.log(conditions);

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

router.post('/summary', function (req, res) {
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
   Policy.findById(req.body._id, function (err, policy) {
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
      logger.info(req.user.name + " 更新了保单扫描件，保单号为：" + policy.policy_no + "。" + req.clientIP);
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
        policies[i].payment_bank = remarks;
        policies[i].paid_at = Date.now();
        policies[i].save();
        logger.info(req.user.name + " 更新了一份保单，保单号为：" + policies[i].policy_no + "。" + req.clientIP);
      };
      logger.info(req.user.name + " 批量支付了保单。" + req.clientIP);
      res.json({ message: '保单状态已批量更改为已支付' });
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
        policies[i].approved_at = Date.now();
        policies[i].save();
        logger.info(req.user.name + " 更新了一份保单，保单号为：" + policies[i].policy_no + "。" + req.clientIP);
      };
      logger.info(req.user.name + " 批量审批通过了保单。" + req.clientIP);
      res.json({ message: '保单已成功批量审批通过' });
    }, function (err) {
      logger.error(err);
    })
});

router.post('/bulk-check', function (req, res) {
  var ids = req.body;
  var query = Policy.find().where('_id').in(ids);
  query
    .exec()
    .then(function (policies) {
      for (var i = 0; i < policies.length; i++) {
        policies[i].policy_status = '已核对';
        policies[i].paid_at = Date.now();
        policies[i].save();
        logger.info(req.user.name + " 更新了一份保单，保单号为：" + policies[i].policy_no + "。" + req.clientIP);
      };
      logger.info(req.user.name + " 批量核对通过了保单。" + req.clientIP);
      res.json({ message: '保单已成功批量核对通过' });
    }, function (err) {
      logger.error(err);
    })
});


module.exports = router;

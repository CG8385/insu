var express = require('express');
var db = require('../utils/database.js').connection;
var Policy = require('../models/life-policy.js')(db);
var router = express.Router();
var Q = require('q');
var logger = require('../utils/logger.js');
var Client = require('../models/client.js')(db);
var iconv = require('iconv-lite');

router.post('/', function (req, res) {
    var data = req.body;
    if (IsIncomplete(data)) {
        res.status(400).send('保单关键信息缺失，请填写完整信息');
        return;
    };

    var policy = new Policy(data);
    policy.seller = req.user._id;
    policy.policy_status = '待审核';
    policy.save(function (err, policy, numAffected) {
        if (err) {
            logger.error(err);
            res.status(500).send(err);
        } else {
            logger.info(req.user.name + " 提交了一份寿险保单，保单号为：" + policy.policy_no + "。" + req.clientIP);
            res.status(200).json({ message: '保单已成功添加' });
        }
    });

});

function IsIncomplete(data) {
    if (!data.policy_no) {
        return true;
    }
    if (!data.submit_date) {
        return true;
    }
    if (!data.client) {
        return true;
    }
    if (!data.organization) {
        return true;
    }
}

router.get('/', function (req, res) {
    var user = req.user;
    var query = {};
    if (req.user.userrole.scope != '全公司') {
        query = { seller: user._id };
    }
    Policy.find(query)
        .populate('client seller organization company sub_policies.product zy_infos.zy_client manager director')
        .exec()
        .then(function (policies) {
            res.status(200).json(policies);
        }, function (err) {
            logger.error(err);
            res.status(500).send(err);
        });
});


// router.get('/upgrade', function (req, res) {
//     console.log("upgrading in progress");
//     var query = Policy.find({policy_status:'已支付'});
//     query
//         .populate('seller')
//         .exec()
//         .then(function(policies){
//           // console.log(policies);
//           for(var i =0; i < policies.length; i++)
//           {
//             var policy = policies[i];
//             console.log(policy);
//             policy.organization = policy.seller.org;
//             // console.log(policy.organization);
//             policy.save();
//           }

//         });
// });

function copy(obj) {
    var clone = {};
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        clone[key] = obj[key];
      }
    }
    return clone;
  }

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
        conditions['submit_date'] = { $gte: req.body.fromDate, $lte: req.body.toDate };
    } else if (req.body.fromDate != undefined) {
        conditions['submit_date'] = { $gte: req.body.fromDate };
    } else if (req.body.toDate != undefined) {
        conditions['submit_date'] = { $lte: req.body.toDate };
    }
    if(conditions.organization){
        delete conditions.organization;
    }
    var query = Policy.find(conditions);
    query
        .sort(sortParam)
        .populate('client seller organization company level1_company level2_company level3_company level4_company sub_policies.product zy_infos.zy_client manager director')
        .exec()
        .then(function (policies) {
            var json2csv = require('json2csv');
            var fields = [
                'submit_date',
                'policy_no',
                'company.name',
                'policy_type',
                'stage',
                'effective_date',
                'receipt_date',
                'invoice_no',
                'invoice_date',

                'sub_policies.insurant',
                'sub_policies.name',
                'sub_policies.year',
                'sub_policies.fee',
                'sub_policies.income',
                'sub_policies.supplementary_agreement',
                'sub_policies.direct_payment',
                'sub_policies.class_payment',
                'applicant.name',
                'applicant.identity',
                'applicant.phone',
                'applicant.adress',
                'applicant.sex',
                'applicant.birthday',

                'total_fee',
                'standard_fee',
                'total_income',
                'total_supplementary_agreement',
                'taxed_profit',
                'payment_total',
                'taxed_payment_total',
                'client.name',
                'client.payee',
                'client.bank',
                'client.account',
                'manager.name',
                'director.name',
                'organization.name',
                'zy_payment',
                'zy_client1.name',
                'zy_client1.zy_payment',
                'zy_client1.payee',
                'zy_client1.bank',
                'zy_client1.account',
                'zy_client2.name',
                'zy_client2.zy_payment',
                'zy_client2.payee',
                'zy_client2.bank',
                'zy_client2.account',
                'seller.name',
                'policy_status',
            ];
            var fieldNames = [
                '交单日',
                '保单号',
                '保险公司',
                '保单性质',
                '保单年度',
                '生效日期',
                '回执回销日',
                '所属发票号',
                '发票日期',
                '被保险人',
                '险种名称',
                '缴费年限',
                '保费',
                '跟单费',
                '补充协议费',
                '直接佣金',
                '职级佣金',
                '投保人',
                '身份证号',
                '电话',
                '地址',
                '性别',
                '生日',
                '总单保费',
                '标准保费',
                '跟单费合计',
                '补充协议费合计',
                '毛利润(含税)',
                '结算费总额',
                '结算费(税后)',
                '业务员',
                '收款人',
                '开户行',
                '收款账号',
                '直属经理',
                '直属总监',
                '所属机构',
                '增员奖合计',
                '增员人1',
                '增1增员奖',
                '增1收款人',
                '增1开户行',
                '增1收款账号',
                '增员人2',
                '增2增员奖',
                '增2收款人',
                '增2开户行',
                '增2收款账号',
                '出单员',
                '保单状态',
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
                row.manager = {};
                row.zy_client1 = {};
                row.zy_client2 = {};
                row.director = {};
                row.sub_policies = {};
                row.submit_date = (dateFormat(policy.submit_date, "mm/dd/yyyy"));
                row.policy_no = "'" + policy.policy_no;
                row.company.name = policy.company ? policy.company.name : policy.level4_company ? policy.level4_company.name :  policy.level3_company? policy.level3_company.name :policy.level2_company? policy.level2_company.name : '';
                row.policy_type = policy.policy_type;
                row.stage = policy.stage;
                row.effective_date = (dateFormat(policy.effective_date, "mm/dd/yyyy"));
                row.receipt_date = (dateFormat(policy.receipt_date, "mm/dd/yyyy"));
                row.invoice_no = policy.invoice_no;
                row.invoice_date = (dateFormat(policy.invoice_date, "mm/dd/yyyy"));;

                row.applicant.name = policy.applicant? policy.applicant.name: '';
                row.applicant.identity = row.applicant.identity ? "'" + policy.applicant.identity : '';
                row.applicant.phone = row.applicant.phone ? "'" + policy.applicant.phone : '';
                row.applicant.adress = policy.applicant.adress;
                row.applicant.sex = policy.applicant.sex;
                row.applicant.birthday = policy.applicant.birthday;
                row.total_fee = policy.total_fee;
                row.standard_fee = policy.standard_fee;
                row.total_income = policy.total_income;
                row.total_supplementary_agreement = policy.total_supplementary_agreement;
                row.taxed_profit = policy.taxed_profit;
                row.payment_total = policy.payment_total;
                row.taxed_payment_total = policy.taxed_payment_total;
                row.client.name = policy.client ? policy.client.name : '';
                row.client.bank = policy.client ? policy.client.bank : '';
                row.client.account = policy.client ? "'" + policy.client.account : '';
                row.client.payee = policy.client ? policy.client.payee : '';
                //row.zy_client.name = policy.zy_client ? policy.zy_client.name : '';
                row.zy_payment = policy.zy_payment;
                row.manager.name = policy.manager ? policy.manager.name : '';
                row.director.name = policy.director ? policy.director.name : '';
                row.organization.name = policy.organization ? policy.organization.name: '';
                row.seller.name = policy.seller ? policy.seller.name: '';
                row.policy_status = policy.policy_status;

                if(policy.zy_infos){
                    //only support 2 zy people
                    if(policy.zy_infos.length>=1){
                        var zy_client_info = policy.zy_infos[0].zy_client;
                        if(zy_client_info){
                            row.zy_client1.name = zy_client_info.name;
                            row.zy_client1.zy_payment = policy.zy_infos[0].zy_payment;
                            row.zy_client1.payee = zy_client_info.payee;
                            row.zy_client1.bank = zy_client_info.bank;
                            row.zy_client1.account = "'"+zy_client_info.account;
                        }
                    }
                    if(policy.zy_infos.length>=2){
                        var zy_client_info = policy.zy_infos[1].zy_client;
                        if(zy_client_info){
                            row.zy_client2.name = zy_client_info.name;
                            row.zy_client2.zy_payment = policy.zy_infos[1].zy_payment;
                            row.zy_client2.payee = zy_client_info.payee;
                            row.zy_client2.bank = zy_client_info.bank;
                            row.zy_client2.account = "'"+zy_client_info.account;
                        }
                    }
                }

                if(policy.sub_policies){
                    //sub_polices
                    for(var j = 0; j < policy.sub_policies.length; j++){
                        var newRow={};
                        if(j==0){
                            newRow = copy(row);
                        }
                        newRow.sub_policies = {};
                        newRow.sub_policies.insurant = policy.sub_policies[j].insurant?policy.sub_policies[j].insurant:'';
                        if(policy.sub_policies[j].product){
                            newRow.sub_policies.name = policy.sub_policies[j].product.name?policy.sub_policies[j].product.name:'';
                        }
                        newRow.sub_policies.year = policy.sub_policies[j].year?policy.sub_policies[j].year:'';
                        newRow.sub_policies.fee = policy.sub_policies[j].fee?policy.sub_policies[j].fee:'';
                        newRow.sub_policies.income = policy.sub_policies[j].income?policy.sub_policies[j].income:'';
                        newRow.sub_policies.supplementary_agreement = policy.sub_policies[j].supplementary_agreement?policy.sub_policies[j].supplementary_agreement:'';
                        newRow.sub_policies.direct_payment = policy.sub_policies[j].direct_payment?policy.sub_policies[j].direct_payment:'';
                        newRow.sub_policies.class_payment = policy.sub_policies[j].class_payment?policy.sub_policies[j].class_payment:'';
                        arr.push(newRow);
                    }
                }else{
                    arr.push(row);
                }
            }
            json2csv({ data: arr, fields: fields, fieldNames: fieldNames }, function (err, csv) {
                if (err) console.log(err);

                var dataBuffer = Buffer.concat([new Buffer('\xEF\xBB\xBF', 'binary'), new Buffer(csv)]);
                res.setHeader('Content-Type', 'text/csv;charset=utf-8');
                res.setHeader("Content-Disposition", "attachment;filename=" + "life.csv");
                res.send(dataBuffer);
            });
        }, function (err) {
            logger.error(err);
        })
});


router.get('/:id', function (req, res) {
    Policy.findOne({ _id: req.params.id })
        .populate('sub_policies.product zy_infos.zy_client manager director')
        .populate({ path: 'seller', model: 'User', populate: { path: 'org', model: 'Organization' } })
        .populate({ path: 'client', model: 'Client', populate: { path: 'organization', model: 'Organization' } })
        .exec()
        .then(function (policy) {
            res.status(200).json(policy);
        }, function (err) {
            logger.error(err);
            res.status(500).send(err);
        });
});

router.post('/update-photo', function (req, res) {
    Policy.findById(req.body._id, function (err, policy) {
        if (err)
            res.send(err);
        policy.policy_photo = req.body.policy_photo;
        policy.client_info_photo = req.body.client_info_photo;
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
          policies[i].save();
          logger.info(req.user.name + " 更新了一份保单，保单号为：" + policies[i].policy_no + "。" + req.clientIP);
        };
        logger.info(req.user.name + " 批量审批通过了保单。" + req.clientIP);
        res.json({ message: '保单已成功批量审批通过' });
      }, function (err) {
        logger.error(err);
      })
  });

router.put('/:id', function (req, res) {
    Policy.findById(req.params.id, function (err, policy) {
        if (err)
            res.send(err);
        policy.policy_no = req.body.policy_no;
        policy.company = req.body.company;
        policy.level1_company = req.body.level1_company;
        policy.level2_company = req.body.level2_company;
        policy.level3_company = req.body.level3_company;
        policy.level4_company = req.body.level4_company;
        policy.policy_type = req.body.policy_type;
        policy.stage = req.body.stage;
        policy.total_fee = req.body.total_fee;
        policy.standard_fee = req.body.standard_fee;
        policy.submit_date = req.body.submit_date;
        policy.effective_date = req.body.effective_date;
        policy.receipt_date = req.body.receipt_date;
        policy.invoice_no = req.body.invoice_no;
        policy.invoice_date = req.body.invoice_date;
        policy.sub_policies = req.body.sub_policies;
        policy.total_income = req.body.total_income;
        policy.total_supplementary_agreement = req.body.total_supplementary_agreement;
        policy.profit = req.body.profit;
        policy.taxed_profit = req.body.taxed_profit;
        policy.payment_total = req.body.payment_total;
        policy.taxed_payment_total = req.body.taxed_payment_total;
        policy.applicant = req.body.applicant;
        policy.insurants = req.body.insurants;
        policy.client = req.body.client;
        //policy.zy_client = req.body.zy_client;
        //policy.zy_rate = req.body.zy_rate;
        policy.zy_payment = req.body.zy_payment;
        policy.taxed_zy_payment = req.body.taxed_zy_payment;
        //policy.zy_payment_based_on_taxed = req.body.zy_payment_based_on_taxed;
        policy.zy_infos = req.body.zy_infos;
        policy.manager = req.body.manager;
        policy.director = req.body.director;
        policy.seller = req.body.seller;
        policy.organization = req.body.organization;
        policy.policy_status = req.body.policy_status;
        policy.remark = req.body.remark;


        policy.save(function (err) {
            if (err) {
                logger.error(err);
                res.send(err);
            }
            logger.info(req.user.name + " 更新了一份寿险保单，保单号为：" + policy.policy_no + "。" + req.clientIP);
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
        logger.info(req.user.name + " 删除了一份寿险保单。" + req.clientIP);
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

    if (req.body.fromDate != undefined && req.body.toDate != undefined) {
        conditions['submit_date'] = { $gte: req.body.fromDate, $lte: req.body.toDate };
    } else if (req.body.fromDate != undefined) {
        conditions['submit_date'] = { $gte: req.body.fromDate };
    } else if (req.body.toDate != undefined) {
        conditions['submit_date'] = { $lte: req.body.toDate };
    }
    if(conditions.organization){
        delete conditions.organization;
      }

    var query = Policy.find(conditions);
    query
        .sort(sortParam)
        .skip(req.body.currentPage * req.body.pageSize)
        .limit(req.body.pageSize)
        .populate('client seller organization sub_policies.product zy_infos.zy_client level1_company level2_company level3_company level4_company')
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

module.exports = router;

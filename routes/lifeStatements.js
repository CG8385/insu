var express = require('express');
var db = require('../utils/database.js').connection;
var LifeStatement = require('../models/life-statement.js')(db);
var router = express.Router();
var Q = require('q');
var logger = require('../utils/logger.js');
var iconv = require('iconv-lite');

router.post('/search', function (req, res) {
    var conditions = {};

    for (var key in req.body.filterByFields) {
        if (req.body.filterByFields.hasOwnProperty(key) && req.body.filterByFields[key] != null && req.body.filterByFields[key] != "") {
            conditions[key] = req.body.filterByFields[key];
        }
    }
    
    if(req.user.role == '出单员'){
       conditions['seller'] = req.user._id;
    }

    var sortParam ="";
    if(req.body.orderByReverse){
      sortParam = "-"+req.body.orderBy.toString();
    }else{
      sortParam = req.body.orderBy.toString();
    }
    if(req.body.fromDate != undefined && req.body.toDate != undefined){
        conditions['issue_date']={$gte:req.body.fromDate, $lte:req.body.toDate};
    }else if(req.body.fromDate != undefined ){
        conditions['issue_date']={$gte:req.body.fromDate};
    }else if(req.body.toDate != undefined ){
        conditions['issue_date']={$lte:req.body.toDate};
    }
    var query = LifeStatement.find(conditions);
    query
        .sort(sortParam)
        .skip(req.body.currentPage*req.body.pageSize)
        .limit(req.body.pageSize)
        .populate('seller company')
        .exec()
        .then(function(statements){
          LifeStatement.count(conditions,function(err,c){
            if(err){
              logger.error(err);
              res.status(500).send("获取对账单总数失败");
            }
          res.status(200).json({
            totalCount: c,
            statements:statements
        })});
        },function(err){
            logger.error(err);
        })
});

router.post('/excel', function (req, res) {
    var conditions = {};
    for (var key in req.body.filterByFields) {
        if (req.body.filterByFields.hasOwnProperty(key) && req.body.filterByFields[key] != null && req.body.filterByFields[key] != "") {
            conditions[key] = req.body.filterByFields[key];
        }
    }
    
    if(req.user.role == '出单员'){
       conditions['seller'] = req.user._id;
    }

    var sortParam ="";
    if(req.body.orderByReverse){
      sortParam = "-"+req.body.orderBy.toString();
    }else{
      sortParam = req.body.orderBy.toString();
    }
    if(req.body.fromDate != undefined && req.body.toDate != undefined){
        conditions['issue_date']={$gte:req.body.fromDate, $lte:req.body.toDate};
    }else if(req.body.fromDate != undefined ){
        conditions['issue_date']={$gte:req.body.fromDate};
    }else if(req.body.toDate != undefined ){
        conditions['issue_date']={$lte:req.body.toDate};
    }
    var query = LifeStatement.find(conditions);
    query
        .sort(sortParam)
        .populate('seller company')
        .exec()
        .then(function(statements){
            var json2csv = require('json2csv');
            var fields = [
                'issue_date',
                'company.name',
                'invoice_no',
                'invoice_amount',
                'contact',
                'new_policy_fee',
                'new_policy_income',
                'renewal_fee',
                'renewal_income',
                'other_income',
                'seller.name',
            ];
            var fieldNames = [
                '开票日期',
                '保险公司',
                '发票号码',
                '手续费开票金额',
                '对接人',
                '新保保费',
                '新保手续费',
                '续保保费',
                '续保手续费',
                '其他项手续费',
                '出单员'
            ];

            
            var arr = [];
            var dateFormat = require('dateformat');
            for (var i = 0; i < statements.length; i++) {
                var statement = statements[i];
                var row = {};
                row.company = {};
                row.seller = {};
                row.issue_date = dateFormat(statement.created_at, "mm/dd/yyyy");
                row.invoice_no = statement.invoice_no;
                row.invoice_amount = statement.invoice_amount;
                row.contact = statement.contact;
                row.company.name = statement.company.name;
                row.seller.name = statement.seller.name;
                row.new_policy_fee = statement.new_policy_fee;
                row.new_policy_income = statement.new_policy_income;
                row.renewal_fee = statement.renewal_fee;
                row.renewal_income = statement.renewal_income;
                row.other_income = statement.other_income;
                arr.push(row);
            }
            json2csv({ data: arr, fields: fields, fieldNames: fieldNames }, function (err, csv) {
                if (err) console.log(err);

                var dataBuffer = Buffer.concat([new Buffer('\xEF\xBB\xBF', 'binary'), new Buffer(csv)]);
                res.setHeader('Content-Type', 'text/csv;charset=utf-8');
                res.setHeader("Content-Disposition", "attachment;filename=" + "statement.csv");
                res.send(dataBuffer);
            });
        },function(err){
            logger.error(err);
        })
});

router.get('/:id', function (req, res) {
  LifeStatement.findOne({_id: req.params.id})
    .populate('seller')
    .exec()
    .then(function(statement){
       res.status(200).json(statement);
     },function(err){
       logger.error(err);
       res.status(500).send(err);
     });
});

router.post('/', function (req, res) {
  var data = req.body;
  LifeStatement.find({ invoice_no: data.invoice_no }, function (err, statements) {
    if (statements.length > 0) {
      res.status(400).send('系统中已存在相同发票号的对账单');
    } else {
      var statement = new LifeStatement(data);
      statement.seller = req.user._id;
      statement.save(function (err, savedStatement, numAffected) {
        if (err) {
          logger.error(err);
          res.status(500).send(err);
        } else {
          logger.info(req.user.name + " 提交了一份对账单，对账单为："+ statement.invoice_no +"。"+ req.clientIP);
          res.status(200).json({ message: '对账单已成功添加' });
        }
      });
    }

  })
});

router.put('/:id', function (req, res) {
    LifeStatement.findById(req.params.id, function (err, statement) {
        if (err)
            res.send(err);
        statement.issue_date = req.body.issue_date;
        statement.company = req.body.company;
        statement.titile = req.body.title;
        statement.invoice_no = req.body.invoice_no;
        statement.invoice_amount = req.body.invoice_amount;
        statement.contact = req.body.contact;
        statement.new_policy_fee = req.body.new_policy_fee;
        statement.new_policy_income = req.body.new_policy_income;
        statement.renewal_fee = req.body.renewal_fee;
        statement.renewal_income = req.body.renewal_income;
        statement.other_income = req.body.other_income;
        statement.seller = req.body.seller;
        statement.save(function (err) {
            if (err){
              logger.error(err);
              res.send(err);
            }
            logger.info(req.user.name + " 更新了对账单，发票号为："+ statement.invoice_no +"。"+ req.clientIP);
            res.json({message: '对账单已成功更新'});
        });

    });
});

router.delete('/:id', function (req, res) {
  LifeStatement.remove({_id: req.params.id}, function(err, statement){
    if (err){
      logger.error(err);
      res.send(err);
    }
    logger.info(req.user.name + " 删除了一张对账单。"+ req.clientIP);
    res.json({ message: '对账单已成功删除' });
  });
});

module.exports = router;

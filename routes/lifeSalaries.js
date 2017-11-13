var express = require('express');
var db = require('../utils/database.js').connection;
var LifeSalary = require('../models/life-salary.js')(db);
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
    
    var query = LifeSalary.find(conditions);
    query
        .sort(sortParam)
        .skip(req.body.currentPage*req.body.pageSize)
        .limit(req.body.pageSize)
        .populate('manager seller organization')
        .exec()
        .then(function(salaries){
          LifeSalary.count(conditions,function(err,c){
            if(err){
              logger.error(err);
              res.status(500).send("获取工资结算单总数失败");
            }
          res.status(200).json({
            totalCount: c,
            salaries:salaries
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

    var query = LifeSalary.find(conditions);
    query
        .sort(sortParam)
        .populate('manager seller organization')
        .exec()
        .then(function(salaries){
            var json2csv = require('json2csv');
            var fields = [
                'year',
                'month',
                'manager.name',
                'title',
                'organization.name',
                'branch_policy_fee',
                'area_policy_fee',
                'branch_salary',
                'area_salary',
                'salary_total',
                'taxed_salary_total',
                'seller.name',
            ];
            var fieldNames = [
                '年度',
                '月份',
                '主管姓名',
                '职级',
                '营业部',
                '月度直辖处标准保费',
                '月度直辖区标准保费',
                '营业处底薪',
                '营业区底薪',
                '底薪合计',
                '税后底薪',
                '出单员'
            ];

            
            var arr = [];

            for (var i = 0; i < salaries.length; i++) {
                var salary = salaries[i];
                var row = {};
                row.organization = {};
                row.seller = {};
                row.manager = {};
                row.year = salary.year;
                row.month = salary.month;
                row.manager.name = 　salary.manager.name;
                row.organization.name = salary.organization.name;
                row.seller.name = salary.seller.name;
                row.title = salary.title;
                row.branch_policy_fee = salary.branch_policy_fee;
                row.area_policy_fee = salary.area_policy_fee;
                row.branch_salary = salary.branch_salary;
                row.area_salary = salary.area_salary;
                row.salary_total = salary.salary_total;
                row.taxed_salary_total = salary.taxed_salary_total;
                arr.push(row);
            }
            json2csv({ data: arr, fields: fields, fieldNames: fieldNames }, function (err, csv) {
                if (err) console.log(err);

                var dataBuffer = Buffer.concat([new Buffer('\xEF\xBB\xBF', 'binary'), new Buffer(csv)]);
                res.setHeader('Content-Type', 'text/csv;charset=utf-8');
                res.setHeader("Content-Disposition", "attachment;filename=" + "salary.csv");
                res.send(dataBuffer);
            });
        },function(err){
            logger.error(err);
        })
});

router.get('/:id', function (req, res) {
  LifeSalary.findOne({_id: req.params.id})
    .populate('manager seller organization')
    .exec()
    .then(function(salary){
       res.status(200).json(salary);
     },function(err){
       logger.error(err);
       res.status(500).send(err);
     });
});

router.post('/', function (req, res) {
    var data = req.body;
    if(!data.manager){
        res.status(500).json({ message: '主管姓名不能为空' });
    }
    var salary = new LifeSalary(data);
    salary.seller = req.user._id;
    salary.save(function (err, savedSalary, numAffected) {
        if (err) {
            logger.error(err);
            res.status(500).send(err);
        } else {
            logger.info(req.user.name + " 添加了一条主管工资结算单，主管名称为：" + savedSalary.manager + "。" + req.clientIP);
            res.status(200).json({ message: '月度工资结算单已成功添加' });
        }
    });

});

router.put('/:id', function (req, res) {
    LifeSalary.findById(req.params.id, function (err, salary) {
        if (err)
            res.send(err);
        salary.manager = req.body.manager;
        salary.organization = req.body.organization;
        salary.titile = req.body.title;
        salary.branch_policy_fee = req.body.branch_policy_fee;
        salary.area_policy_fee = req.body.area_policy_fee;
        salary.branch_salary = req.body.branch_salary;
        salary.area_salary = req.body.area_salary;
        salary.salary_total = req.body.salary_total;
        salary.taxed_salary_total = req.body.taxed_salary_total;
        salary.year = req.body.year;
        salary.month = req.body.month;
        salary.save(function (err) {
            if (err){
              logger.error(err);
              res.send(err);
            }
            logger.info(req.user.name + " 更新了工资结算单单，主管名称为："+ salary.manager +"。"+ req.clientIP);
            res.json({message: '工资结算单已成功更新'});
        });

    });
});

router.delete('/:id', function (req, res) {
  LifeSalary.remove({_id: req.params.id}, function(err, salary){
    if (err){
      logger.error(err);
      res.send(err);
    }
    logger.info(req.user.name + " 删除了一张工资结算单。"+ req.clientIP);
    res.json({ message: '工资结算单已成功删除' });
  });
});

module.exports = router;

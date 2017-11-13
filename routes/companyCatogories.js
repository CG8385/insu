var express = require('express');
var db = require('../utils/database.js').connection;
var CompanyCatogory = require('../models/companyCatogory.js')(db);
var router = express.Router();
var Q = require('q');
var logger = require('../utils/logger.js');

router.get('/', function(req, res, next) {
  CompanyCatogory.find().exec()
  .then(function(companyCatogories){
    res.json(companyCatogories);
  },
  function(err){
    res.status(500).end();
  }
  )
});

router.get('/:id', function (req, res) {
  CompanyCatogory.findOne({_id: req.params.id})
    .exec()
    .then(function(companyCatogory){
       res.status(200).json(companyCatogory);
     },function(err){
       logger.error(err);
       res.status(500).send(err);
     });
});

router.post('/', function (req, res) {
  var data = req.body;
  CompanyCatogory.find({ name: data.name }, function (err, companies) {
    if (companies.length > 0) {
      res.status(400).send('系统中已存在该一级公司名称');
    } else {
      var companyCatogory = new CompanyCatogory(data);
      companyCatogory.save(function (err, savedCompanyCatogory, numAffected) {
        if (err) {
          logger.error(err);
          res.status(500).send(err);
        } else {
          logger.info(req.user.name + " 添加了一个一级保险公司，名称为："+ savedCompanyCatogory.name +"。"+ req.clientIP);
          res.status(200).json({ message: '一级保险公司已成功添加' });
        }
      });
    }
  })
});

router.put('/:id', function (req, res) {
    CompanyCatogory.findById(req.params.id, function (err, companyCatogory) {
        if (err)
            res.send(err);
        companyCatogory.name = req.body.name;
        // company.contact = req.body.contact;
        // company.phone = req.body.phone;
        companyCatogory.save(function (err) {
            if (err){
              logger.error(err);
              res.send(err);
            }
            logger.info(req.user.name + " 更新了一级保险公司信息，保险公司名称为："+ companyCatogory.name +"。"+ req.clientIP);
            res.json({message: '一级保险公司已成功更新'});
        });

    });
});

router.delete('/:id', function (req, res) {
  CompanyCatogory.remove({_id: req.params.id}, function(err, companyCatogory){
    if (err){
      logger.error(err);
      res.send(err);
    }
    logger.info(req.user.name + " 删除了一个一级保险公司。"+ req.clientIP);
    res.json({ message: '一级保险公司已成功删除' });
  });
});

module.exports = router;

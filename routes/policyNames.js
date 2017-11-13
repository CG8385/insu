var express = require('express');
var db = require('../utils/database.js').connection;
var PolicyName = require('../models/policy-name.js')(db);
var router = express.Router();
var Q = require('q');
var logger = require('../utils/logger.js');

router.get('/', function(req, res, next) {
  PolicyName.find()
  .exec()
  .then(function(policyNames){
    res.json(policyNames);
  },
  function(err){
    res.status(500).end();
  }
  )
});

router.get('/:id', function (req, res) {
  PolicyName.findOne({_id: req.params.id})
    .exec()
    .then(function(policyName){
       res.status(200).json(policyName);
     },function(err){
       logger.error(err);
       res.status(500).send(err);
     });
});

router.post('/', function (req, res) {
  var data = req.body;
  PolicyName.find({ name: data.name }, function (err, policyNames) {
    if (policyNames.length > 0) {
      res.status(400).send('系统中已存在该险种名称');
    } else {
      var policyName = new PolicyName(data);
      policyName.save(function (err, savedPolicyName, numAffected) {
        if (err) {
          logger.error(err);
          res.status(500).send(err);
        } else {
          logger.info(req.user.name + " 添加了一个险种，险种名称为："+ savedPolicyName.name +"。"+ req.clientIP);
          res.status(200).json({ message: '险种名称已成功添加' });
        }
      });
    }
  })
});

router.put('/:id', function (req, res) {
    PolicyName.findById(req.params.id, function (err, policyName) {
        if (err)
            res.send(err);
        policyName.name = req.body.name;
        policyName.save(function (err) {
            if (err){
              logger.error(err);
              res.send(err);
            }
            logger.info(req.user.name + " 更新了险种名称，新险种名称名称为："+ policyName.name +"。"+ req.clientIP);
            res.json({message: '险种名称已成功更新'});
        });

    });
});

router.delete('/:id', function (req, res) {
  PolicyName.remove({_id: req.params.id}, function(err, policyName){
    if (err){
      logger.error(err);
      res.send(err);
    }
    logger.info(req.user.name + " 删除了一个险种。"+ req.clientIP);
    res.json({ message: '险种已成功删除' });
  });
});

module.exports = router;

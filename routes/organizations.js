var express = require('express');
var db = require('../utils/database.js').connection;
var Organization = require('../models/organization.js')(db);
var router = express.Router();
var Q = require('q');
var logger = require('../utils/logger.js');

router.get('/', function(req, res, next) {
  Organization.find().exec()
  .then(function(organizations){
    res.json(organizations);
  },
  function(err){
    res.status(500).end();
  }
  )
});

router.get('/:id', function (req, res) {
  Organization.findOne({_id: req.params.id})
    .exec()
    .then(function(organization){
       res.status(200).json(organization);
     },function(err){
       logger.error(err);
       res.status(500).send(err);
     });
});

router.post('/', function (req, res) {
  var data = req.body;
  Organization.find({ name: data.name }, function (err, organizations) {
    if (organizations.length > 0) {
      res.status(400).send('系统中已存在该分支机构名称');
    } else {
      var organization = new Organization(data);
      organization.save(function (err, savedOrganization, numAffected) {
        if (err) {
          logger.error(err);
          res.status(500).send(err);
        } else {
          logger.info(req.user.name + " 添加了一个分支机构，机构名称为："+ savedOrganization.name +"。"+ req.clientIP);
          res.status(200).json({ message: '分支机构已成功添加' });
        }
      });
    }
  })
});

router.put('/:id', function (req, res) {
    Organization.findById(req.params.id, function (err, organization) {
        if (err)
            res.send(err);
        organization.name = req.body.name;
        organization.save(function (err) {
            if (err){
              logger.error(err);
              res.send(err);
            }
            logger.info(req.user.name + " 更新了分支机构信息，机构名称为："+ organization.name +"。"+ req.clientIP);
            res.json({message: '分支机构已成功更新'});
        });

    });
});

router.delete('/:id', function (req, res) {
  Organization.remove({_id: req.params.id}, function(err, organization){
    if (err){
      logger.error(err);
      res.send(err);
    }
    logger.info(req.user.name + " 删除了一个分支机构。"+ req.clientIP);
    res.json({ message: '分支机构已成功删除' });
  });
});

module.exports = router;

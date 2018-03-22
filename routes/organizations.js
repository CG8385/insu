var express = require('express');
var db = require('../utils/database.js').connection;
var Organization = require('../models/organization.js')(db);
var router = express.Router();
var Q = require('q');
var logger = require('../utils/logger.js');
var makePy = require('../utils/pinyin');

function IsIncomplete(data) {
  if (data.level == "省公司") {
    return !data.province;
  }
  if (data.level == "市公司") {
    return !data.province || !data.city;
  }
  return !data.province || !data.city || data.district;
}

router.get('/', function (req, res, next) {
  Organization.find()
    .sort({ py: 1 })
    .exec()
    .then(function (organizations) {
      res.json(organizations);
    },
      function (err) {
        res.status(500).end();
      }
    )
});

router.get('/level1', function (req, res) {
  Organization.find({ level: "总公司" })
    .exec()
    .then(function (organizations) {
      res.json(organizations);
    },
      function (err) {
        res.status(500).end();
      }
    )
});

router.get('/level2', function (req, res) {
  Organization.find({ level: "省公司" })
    .populate('parent')
    .sort({ py: -1 })
    .exec()
    .then(function (organizations) {
      res.json(organizations);
    },
      function (err) {
        res.status(500).end();
      }
    )
});

router.get('/sub/:parentId', function (req, res) {
  Organization.find({ parent: req.params.parentId })
    .sort({ py: -1 })
    .exec()
    .then(function (organizations) {
      res.status(200).json(organizations);
    }, function (err) {
      logger.error(err);
      res.status(500).send(err);
    });
});

router.get('/:id', function (req, res) {
  Organization.findOne({ _id: req.params.id })
    .exec()
    .then(function (organization) {
      res.status(200).json(organization);
    }, function (err) {
      logger.error(err);
      res.status(500).send(err);
    });
});

router.post('/', function (req, res) {
  var data = req.body;
  if (IsIncomplete(data)){
    return res.status(400).send('信息缺失，请填写完整信息');
  }
  Organization.find({ name: data.name }, function (err, organizations) {
    if (organizations.length > 0) {
      //res.status(400).send('系统中已存在该分支机构名称');
      var organization = organizations[0];
      organization.name = req.body.name;
      organization.parent = req.body.parent;
      organization.level = req.body.level;
      organization.province = req.body.province;
      organization.city = req.body.city;
      organization.district = req.body.district;
      organization.area_code = req.body.area_code;
      organization.py = makePy(req.body.name);
      organization.save(function (err) {
        if (err) {
          logger.error(err);
          res.send(err);
        }
        logger.info(req.user.name + " 更新了分支机构信息，机构名称为：" + organization.name + "。" + req.clientIP);
        res.json({ message: '分支机构已成功更新' });
      });
    } else {
      var organization = new Organization(data);
      organization.py = makePy(data.name);
      organization.save(function (err, savedOrganization, numAffected) {
        if (err) {
          logger.error(err);
          res.status(500).send(err);
        } else {
          logger.info(req.user.name + " 添加了一个分支机构，机构名称为：" + savedOrganization.name + "。" + req.clientIP);
          res.status(200).json({ message: '分支机构已成功添加' });
        }
      });
    }
  })
});

router.put('/:id', function (req, res) {
  if (IsIncomplete(req.body)){
    return res.status(400).send('信息缺失，请填写完整信息');
  }
  Organization.findById(req.params.id, function (err, organization) {
    if (err)
      res.send(err);
    organization.name = req.body.name;
    organization.parent = req.body.parent;
    organization.py = makePy(req.body.name);
    organization.level = req.body.level;
    organization.province = req.body.province;
    organization.city = req.body.city;
    organization.district = req.body.district;
    organization.area_code = req.body.area_code;
    organization.save(function (err) {
      if (err) {
        logger.error(err);
        res.send(err);
      }
      logger.info(req.user.name + " 更新了分支机构信息，机构名称为：" + organization.name + "。" + req.clientIP);
      res.json({ message: '分支机构已成功更新' });
    });

  });
});

router.delete('/:id', function (req, res) {
  Organization.remove({ _id: req.params.id }, function (err, organization) {
    if (err) {
      logger.error(err);
      res.send(err);
    }
    logger.info(req.user.name + " 删除了一个分支机构。" + req.clientIP);
    res.json({ message: '分支机构已成功删除' });
  });
});

module.exports = router;

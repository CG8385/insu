var express = require('express');
var db = require('../utils/database.js').connection;
var Client = require('../models/client.js')(db);
var router = express.Router();
var Q = require('q');
var logger = require('../utils/logger.js');
var makePy = require('../utils/pinyin');
var asyncMiddleware = require('../middlewares/asyncMiddleware');
var Promise = require('bluebird');
var Organization = Promise.promisifyAll(require('../models/organization.js')(db));

router.get('/', function (req, res, next) {
  var query = {};
  var type = req.query.type;
  var org = req.query.organization;
  if (org) {
    if (org == -1) { //wild clients
      if (type == "organization") {
        query = { client_type: '机构', organization: { $exists: false } };
      } else if (type == "individual") {
        query = { client_type: '个人', organization: { $exists: false } };
      } else if (type == "manager") {
        query = { client_type: '主管', organization: { $exists: false } };
      } else if (type == "pending") {
        query = { "$or": [{ client_type: '待审核' }, { pending: true }], organization: { $exists: false } };
      } else if (type == "dealer") {
        query = { client_type: '个人', parent: { $exists: true }, organization: { $exists: false } };
      }
    } else {
      if (type == "organization") {
        query = { client_type: '机构', organization: org };
      } else if (type == "individual") {
        query = { client_type: '个人', organization: org };
      } else if (type == "manager") {
        query = { client_type: '主管', organization: org };
      } else if (type == "pending") {
        query = { "$or": [{ client_type: '待审核' }, { pending: true }], organization: org };
      } else if (type == "dealer") {
        query = { client_type: '个人', parent: { $exists: true }, organization: org };
      }
    }
  } else {
    if (type == "organization") {
      query = { client_type: '机构' };
    } else if (type == "individual") {
      query = { client_type: '个人' };
    } else if (type == "manager") {
      query = { client_type: '主管' };
    } else if (type == "pending") {
      query = { "$or": [{ client_type: '待审核' }, { pending: true }] };
    } else if (type == "binded") {
      query = { client_type: '个人', openId: { $exists: true } };
    } else if (type == "dealer") {
      query = { client_type: '个人', parent: { $exists: true } };
    }
  }

  Client.find(query)
    .populate('organization parent')
    .sort({ py: 1 })
    .exec()
    .then(function (clients) {
      for (var i = 0; i < clients.length; i++) {
        var name = clients[i].name;
      }
      res.json(clients);
    },
      function (err) {
        res.status(500).end();
      }
    )
});

router.get('/sub', function (req, res, next) {
  Client.find({ parent: req.query.parent })
    .populate('organization parent')
    .sort({ py: 1 })
    .exec()
    .then(function (clients) {
      for (var i = 0; i < clients.length; i++) {
        var name = clients[i].name;
      }
      res.json(clients);
    },
      function (err) {
        res.status(500).end();
      }
    )

});

router.get('/:id', function (req, res) {
  Client.findOne({ _id: req.params.id })
    .exec()
    .then(function (client) {
      res.status(200).json(client);
    }, function (err) {
      logger.error(err);
      res.status(500).send(err);
    });
});

router.post('/', function (req, res) {
  var data = req.body;
  Client.find({ identity: data.identity }, function (err, clients) {
    if (clients.length > 0) {
      res.status(400).send('系统中已存在该身份证号');
    } else {
      var client = new Client(data);
      client.py = makePy(data.name);
      client.save(function (err, savedClient, numAffected) {
        if (err) {
          logger.error(err);
          res.status(500).send(err);
        } else {
          logger.info(req.user.name + " 添加了一个业务员账号，业务员名称为：" + savedClient.name + "。" + req.clientIP);
          res.status(200).json({ message: '业务员信息已成功添加' });
        }
      });
    }

  })
});

router.put('/:id', function (req, res) {
  Client.findById(req.params.id, function (err, client) {
    if (err)
      res.send(err);
    client.name = req.body.name;
    client.py = makePy(req.body.name);
    client.short_name = req.body.short_name;
    client.client_type = req.body.client_type;
    client.identity = req.body.identity;
    client.payee = req.body.payee;
    client.bank = req.body.bank;
    client.account = req.body.account;
    client.phone = req.body.phone;
    client.wechats = req.body.wechats;
    client.other_accounts = req.body.other_accounts;
    client.payment_substract_rate = req.body.payment_substract_rate;
    client.level1_org = req.body.level1_org;
    client.level2_org = req.body.level2_org;
    client.level3_org = req.body.level3_org;
    client.level4_org = req.body.level4_org;
    client.level5_org = req.body.level5_org;
    client.organization = req.body.level5_org;
    client.license_photo = req.body.license_photo;
    client.license_no = req.body.license_no;
    client.identity1_filename = req.body.identity1_filename;
    client.identity2_filename = req.body.identity2_filename;
    client.parent = req.body.parent;
    client.dealer_level = req.body.dealer_level;
    client.pending = req.body.pending;
    client.save(function (err) {
      if (err) {
        logger.error(err);
        res.send(err);
      }
      logger.info(req.user.name + " 更新业务员信息，业务员名为：" + client.name + "。" + req.clientIP);
      res.json({ message: '业务员信息已成功更新' });
    });

  });
});

router.delete('/:id', function (req, res) {
  Client.remove({ _id: req.params.id }, function (err, client) {
    if (err) {
      logger.error(err);
      res.send(err);
    }
    logger.info(req.user.name + " 删除了一个业务员。" + req.clientIP);
    res.json({ message: '业务员已成功删除' });
  });
});


router.post('/bulk-assign', asyncMiddleware(async (req, res, next) => {
  var ids = req.body.clientIds;
  var level5_id = req.body.level5_id;
  let level5 = await Organization.findOne({ _id: level5_id }).exec();
  let level4_id = level5.parent;
  let level4 = await Organization.findOne({ _id: level4_id }).exec();
  let level3_id = level4.parent;
  let level3 = await Organization.findOne({ _id: level3_id }).exec();
  let level2_id = level3.parent;
  let level2 = await Organization.findOne({ _id: level2_id }).exec();
  let level1_id = level2.parent;
  var query = Client.find().where('_id').in(ids);
  query
    .exec()
    .then(function (clients) {
      for (var i = 0; i < clients.length; i++) {
        clients[i].level1_org = level1_id;
        clients[i].level2_org = level2_id;
        clients[i].level3_org = level3_id;
        clients[i].level4_org = level4_id;
        clients[i].level5_org = level5_id;
        clients[i].organization = level5_id;
        clients[i].save();
      };
      logger.info(req.user.name + " 批量设置了业务员归属营业部。" + req.clientIP);
      res.json({ message: '归属部门已成功设置' });
    }, function (err) {
      logger.error(err);
    })
}));



module.exports = router;

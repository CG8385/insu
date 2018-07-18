var express = require('express');
var passport = require('passport');
var db = require('../utils/database.js').connection;
var Promise = require('bluebird');
var User = Promise.promisifyAll(require('../models/user.js')(db));
var router = express.Router();
var logger = require('../utils/logger.js');
var asyncMiddleware = require('../middlewares/asyncMiddleware');
var Role = require('../models/role.js')(db)


router.get('/me', function (req, res, next) {
  if(!req.user){
    return res.json({});
  };
  User.findOne({ _id: req.user._id })
    .populate('org userrole')
    .exec()
    .then(function (user) {
      if(!user.userrole){
        user.userrole = new Role()
      }
      res.status(200).json(user);
    }, function (err) {
      logger.error(err);
      res.status(500).send(err);
    });
});

// 临时接口
router.get('/register-admin', function (req, res) {
  User.register(new User({ username: 'superadmin', name: '管理员', role: '管理员' }), 'admin2016hy', function (err, user) {
    if (err) {
      logger.error(err);
      res.redirect('/#/login');
    } else {
      res.status(200).json({ status: 'registered' });
    }
  });
});

router.post('/logout', function (req, res) {
  req.logout();
  res.status(200).json({ status: 'Bye!' });
});

router.post('/changepsw', function (req, res) {

  User.authenticate()(req.user.username, req.body.password, function (err, user, options) {
    if (err){
      res.status(400).send('旧密码错误');
    }
    else if (user === false) {
      res.status(400).send('旧密码错误');
    } else {
      req.user.setPassword(req.body.newPassword, function () {
        req.user.save(function (err) {
          if (err) {
            logger.error(err);
            res.status(400).send('密码修改失败');
          }
          logger.info(req.user.name + " 修改了密码。" + req.clientIP);
          res.json({status:"success", message: '用户密码已成功更新' });
        });
      });
    }
  });
});

router.post('/login', function (req, res, next) {
  passport.authenticate('local', function (err, user, info) {
    if (err) {
      logger.error(err);
      return res.status(500).send(err);
    }
    if (!user) {
      return res.status(401).send("用户名或密码错误");
    }
    req.logIn(user, function (err) {
      if (err) {
        logger.error(err);
        return res.status(500).send('无法登录该用户');
      }
      logger.info(user.name + " 登录系统。" + req.clientIP);
      res.status(200).json(user);
    });
  })(req, res, next);
});


router.post('/', function (req, res) {
  if (!req.isAuthenticated()) {
    res.status(401).send("请先登录");
  }

  var data = req.body;
  User.find({ username: data.username }, function (err, users) {
    if (users.length > 0) {
      res.status(400).send('系统中已存在该账号');
    } else {
      User.register(new User({ 
        username: data.username, 
        name: data.name, 
        role: data.role, 
        org: data.org, 
        level1_org: data.level1_org, 
        level2_org: data.level2_org,
        level3_org: data.level3_org, 
        level4_org: data.level4_org, 
        level5_org: data.level5_org, 
        userrole:data.userrole, 
        phone: data.phone, 
        client: data.client}), data.password, function (err, user) {
        if (err) {
          logger.error(err);
          res.status(500).send(err);
        } else {
          res.status(200).json({ message: '已成功创建账号' });
        }
      });
    }

  })
});

router.delete('/:id', function (req, res) {
  if (!req.isAuthenticated()) {
    res.status(401).send("请先登录");
  }
  User.remove({ _id: req.params.id }, function (err, user) {
    if (err) {
      logger.error(err);
      res.send(err);
    }
    logger.info(req.user.name + " 删除了一个员工账号。" + req.clientIP);
    res.json({ message: '账号已成功删除' });
  });
});

router.get('/', function (req, res, next) {
  if (!req.isAuthenticated()) {
    res.status(401).send("请先登录");
  }
  var query = {};
  var role = req.query.role;
  if (role == "seller") {
    query = { role: '出单员' };
  } else if (role == "finance") {
    query = { role: '财务' };
  } else if (role == "recorder") {
    query = { role: '后台录单员' };
  };
  
  User.find(query)
  .populate('org client userrole')
  .exec()
    .then(function (users) {
      res.json(users);
    },
      function (err) {
        res.status(500).send(err);
      }
      )
});

router.get('/:id', function (req, res) {
  if (!req.isAuthenticated()) {
    res.status(401).send("请先登录");
  }
  User.findOne({ _id: req.params.id })
    .exec()
    .then(function (user) {
      res.status(200).json(user);
    }, function (err) {
      logger.error(err);
      res.status(500).send(err);
    });
});

router.put('/:id', asyncMiddleware(async (req, res, next) => {
  let user = await User.findOne({_id: req.params.id}).exec();
  user = Promise.promisifyAll(user);
  user.name = req.body.name;
  user.username = req.body.username;
  user.org = req.body.org;
  user.level1_org = req.body.level1_org;
  user.level2_org = req.body.level2_org;
  user.level3_org = req.body.level3_org;
  user.level4_org = req.body.level4_org;
  user.level5_org = req.body.level5_org;
  user.phone = req.body.phone;
  user.client = req.body.client;
  user.userrole = req.body.userrole;
  if(req.body.password){
    await user.setPasswordAsync(req.body.password);
  }
  await user.saveAsync();
  logger.info(req.user.name + " 更新了用户账号，用户名为：" + user.username + "。" + req.clientIP);
  res.json({ message: '用户账号已成功更新' });
}));

module.exports = router;

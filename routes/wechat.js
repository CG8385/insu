var express = require('express');
var router = express.Router();
var wechat = require('wechat');
var WechatAPI = require('wechat-api');
var appConfig = require('../common.js').config();
var OAuth = require('wechat-oauth');
var db = require('../utils/database.js').connection;
var User = require('../models/user.js')(db);
var Client = require('../models/client.js')(db);
var logger = require('../utils/logger.js');

var client = new OAuth(appConfig.app_id, appConfig.app_secret);

var api = new WechatAPI(appConfig.app_id, appConfig.app_secret);

var menu = JSON.stringify(require('../test/data/menu.json'));
// api.createMenu(menu, function (err, result) {
//   if (err) {
//     console.log(err);
//   }
// });

// api.updateRemark('oYIeTs_bn5V6GeSm93CXkbckzf3E', '振宁汽贸', function (err, data, res) {
//   console.log(data);
// });

//   api.updateRemark('oYIeTs6q8mmV6W0EeMGlJjLU9pjI', '郭永秋', function (err, data, res) {
//     console.log(data);
//     api.updateRemark('oYIeTsw96yjJyOV1IJfBrpK-QJgQ', '振宁汽贸', function (err, data, res) {
//       console.log(data);
//       api.updateRemark('oYIeTsyTg8kINdWmbZFEU4K3uQ0M', '郭永秋', function (err, data, res) {
//         console.log(data);
//         api.updateRemark('oYIeTs0uazo_lZJ6wMndK8f_UaC4', '振宁汽贸', function (err, data, res) {
//           console.log(data);
//         });
//       });
//     });
//   });

router.get('/followers', function (req, res, next) {
  api.getFollowers(function (err, result) {
    if (!result)
      return res.json({});
    var ids = result.data.openid;
    api.batchGetUsers(ids, function (err, result1) {
      if (!result1)
        return res.json({});
      res.json(result1.user_info_list);
    });
  });
});

//

router.post('/byids', function (req, res, next) {
  var openIds = req.body;
  api.batchGetUsers(openIds, function (err, result1) {
    if (!result1)
      return res.json([]);
    res.json(result1.user_info_list);
  });
});


router.get('/', wechat('H4MbzV5LAd3n', function (req, res, next) {
  res.writeHead(200);
  res.end('hello from node api');
}));

router.post('/', wechat('H4MbzV5LAd3n', wechat.text(function (message, req, res, next) {
  var openId = message.FromUserName;
  var text = message.Content;
  if (text == '我叫什么') {
    api.getUser(openId, function (err, data) {
      if (err) {

      } else {
        var nickname = data.nickname;
        res.reply("你叫" + nickname + "嘛。");
      }
    });
  } else if (text == '我是谁') {
    api.getUser(openId, function (err, data) {
      if (err) {

      } else {
        var remark = data.remark;
        res.reply("你是" + remark + "。");
      }
    });
  }
})
  .image(function (message, req, res, next) {
    res.redirect('/#');
  })
  ));
 
 
//wechat web apis
 
router.get('/view', function (req, res) {
  var url = client.getAuthorizeURL('http://' + appConfig.domain + '/wechat/callback', '', 'snsapi_userinfo');
  res.redirect(url)
})

router.get('/test', function (req, res) {
  var clientId;
  Client.find({ short_name: '振宁汽贸' }).exec()
    .then(function (clients) {
      if (clients.length == 0) {
        return res.send("红叶系统中没有您的信息，请联系客服人员注册");
      }
      clientId = clients[0]._id;
    })
    .then(function () {
      var user;
      //查用户账号中是否有此
      User.find({ name: '振宁汽贸' }).exec()
        .then(function (users) {
          if (users.length > 0) {
            user = users[0];
            req.logIn(user, function (err) {
              if (err) {
                return res.status(500).json({ error: err });
              }
              res.render('wechat');
            });
          } else {
            user = new User({ username: 'znqm', name: '振宁汽贸', role: '客户', client_id: clientId });
            User.register(user, '123456', function (err, result) {
              if (err) {
                logger.error(err);
                return res.status(500).json({ error: err });
              } else {
                req.logIn(result, function (err) {
                  if (err) {
                    return res.status(500).json({ error: err });
                  }
                  res.render('wechat');
                });
              }
            });
          }

        });
    });
})

router.get('/callback', function (req, res) {
  console.log('----weixin callback -----')
  var code = req.query.code;
  client.getAccessToken(code, function (err, result) {
    var accessToken = result.data.access_token;
    var openid = result.data.openid;
    console.log('token=' + accessToken);
    console.log('openid=' + openid);

    api.getUser(openid, function (err, result) {
      if (err) {
        return res.status(500).json({ error: err });
      };
      var oauth_user = result;
      var clientId;
      Client.find({ wechats: openid }).exec()
        .then(function (clients) {
          if (clients.length == 0) {
            return res.send("红叶系统中没有您的信息，请联系客服人员注册");
          }
          clientId = clients[0]._id;
        })
        .then(function () {
          var user;
          //查用户账号中是否有此
          User.find({ username: oauth_user.openid }).exec()
            .then(function (users) {
              if (users.length > 0) {
                user = users[0];
                user.client_id = clientId;
                user.save(function (err) {
                  if (err) {
                    logger.error(err);
                    return res.status(500).send(err);
                  }
                  req.logIn(user, function (err) {
                    if (err) {
                      return res.status(500).json({ error: err });
                    }
                    res.render('wechat');
                  });
                });

              } else {
                user = new User({ username: oauth_user.openid, name: oauth_user.remark, role: '客户', client_id: clientId });
                User.register(user, '123456', function (err, result) {
                  if (err) {
                    // logger.error(err);
                    return res.status(500).json({ error: err });
                  } else {
                    req.logIn(result, function (err) {
                      if (err) {
                        return res.status(500).json({ error: err });
                      }
                      res.render('wechat');
                    });
                  }
                });
              }


            });
        });
    });
  });
});
module.exports = router;

var expect = require('chai').expect;
var querystring = require('querystring');
var template = require('./support').template;
var tail = require('./support').tail;
var app = require('../app.js');
 //var request = require('supertest')('http://123.56.103.93');
 var request = require('supertest')(app);
 var WechatAPI = require('wechat-api');
var appConfig = require('../common.js').config();

var api = new WechatAPI(appConfig.app_id, appConfig.app_secret);

function get_q() {
  var q = {
    timestamp: new Date().getTime(),
    nonce: parseInt((Math.random() * 10e10), 10)
  };
  var s = ['H4MbzV5LAd3n', q.timestamp, q.nonce].sort().join('');
  q.signature = require('crypto').createHash('sha1').update(s).digest('hex');
  q.echostr = 'hehe';
  return q;
};

function get_q_for_post() {
  var q = {};
  var s = ['H4MbzV5LAd3n', q.timestamp, q.nonce].sort().join('');
  q.signature = require('crypto').createHash('sha1').update(s).digest('hex');
  q.timestamp = new Date().getTime();
  q.nonce = parseInt((Math.random() * 10e10), 10);
  return q;
};

describe('微信公众号服务器后台测试',function(){
  //describe('接入鉴权测试',function(){
	//it('拒绝非法的接入请求', function (done) {
  //    request
  //    .get('/wechat')
  //    .expect(401)
  //    .expect('Invalid signature', done);
  //  });
  //it('接受合法的接入请求', function (done) {
  //    request
  //    .get('/wechat?' + querystring.stringify(get_q()))
  //    .expect(200)
  //    .expect('hehe', done);
  //  });
  //});

  // describe('菜单测试', function () {
  //   it('定义菜单', function (done) {
  //     var menu = JSON.stringify(require('./data/menu.json'));
  //     api.createMenu(menu, function (err, result) {
  //       expect(err).to.be.null;
  //       done();
  //     });
  //   });
  // });
  
  describe('消息处理测试', function (done){    
    it('收到［我叫什么］后回复发送者昵称', function (done) {
      var info = {
        sp: 'gh_85624a8679b8',
        user: 'oYIeTs_bn5V6GeSm93CXkbckzf3E',
        type: 'text',
        text: '我叫什么'
      };

      request
      .post('/wechat' + tail())
      .set('Content-Type',  'text/xml') 
      .send(template(info))
      .expect(200)
      .end(function(err, res){
        if (err) return done(err);
        var body = res.text.toString();
        expect(body).include('<ToUserName><![CDATA[oYIeTs_bn5V6GeSm93CXkbckzf3E]]></ToUserName>');
        expect(body).include('<ToUserName><![CDATA[oYIeTs_bn5V6GeSm93CXkbckzf3E]]></ToUserName>');
        expect(body).include('<FromUserName><![CDATA[gh_85624a8679b8]]></FromUserName>');
        expect(body).match(/<CreateTime>\d{13}<\/CreateTime>/);
        expect(body).include('<MsgType><![CDATA[text]]></MsgType>');
        expect(body).include('<Content><![CDATA[你叫萨拉丁嘛。]]></Content>');
        done();
      });
    });
    
    it('收到［我是谁］后回复发送者备注名', function (done) {
      var info = {
        sp: 'gh_85624a8679b8',
        user: 'oYIeTs_bn5V6GeSm93CXkbckzf3E',
        type: 'text',
        text: '我是谁'
      };

      api.updateRemark('oYIeTs_bn5V6GeSm93CXkbckzf3E', '春哥', function (err, data, res) {

        request
          .post('/wechat' + tail())
          .set('Content-Type', 'text/xml')
          .send(template(info))
          .expect(200)
          .end(function (err, res) {
            if (err) return done(err);
            var body = res.text.toString();
            expect(body).include('<ToUserName><![CDATA[oYIeTs_bn5V6GeSm93CXkbckzf3E]]></ToUserName>');
            expect(body).include('<ToUserName><![CDATA[oYIeTs_bn5V6GeSm93CXkbckzf3E]]></ToUserName>');
            expect(body).include('<FromUserName><![CDATA[gh_85624a8679b8]]></FromUserName>');
            expect(body).match(/<CreateTime>\d{13}<\/CreateTime>/);
            expect(body).include('<MsgType><![CDATA[text]]></MsgType>');
            expect(body).include('<Content><![CDATA[你是春哥。]]></Content>');
            done();
          });
      });
    });
  });
  
});   

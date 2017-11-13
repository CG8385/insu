var expect = require('chai').expect;
var app = require('../app.js');
var testSession = require('supertest-session')(app);

var config = require('../common.js').config();
var mongoose = require('mongoose');

before(function (done) {
  function clearDB() {
    mongoose.connection.db.dropDatabase(function(err){
      return done();
    });
  }


  if (mongoose.connection.readyState === 0) {
    mongoose.connect(config.mongodb_server, function (err) {
      if (err) {
        throw err;
      }
      return clearDB();
    });
  } else {
    return clearDB();
  }
});


after(function (done) {
  mongoose.disconnect();
  return done();
});


describe('后台API测试', function () {
  describe('登陆登出与鉴权测试', function () {
    it('未登录不得访问受限资源', function (done) {
      testSession.get('/api/orders')
        .expect(401)
        .end(done)
    });

    it('用错误身份登陆失败', function (done) {
      testSession.post('/users/login')
        .send({ username: 'bw', password: '223' })
        .expect(401)
        .end(done);
    });
    it('注册一个测试用账号', function (done) {
      testSession.get('/users/register-cdy01')
        .expect(200)
        .end(done);
    });
    it('用正确身份登陆成功', function (done) {
      testSession.post('/users/login')
        .send({ username: 'cdy01', password: 'cdy01123' })
        .expect(200)
        .end(done);
    });

    it('登陆后成功调用受限资源', function (done) {
      testSession.get('/api/orders')
        .expect(200)
        .end(done)
    });
    it('获取本人账号信息', function (done) {
      testSession.get('/users/me')
        .expect(200)
        .end(function(err, res){
        var data = JSON.parse(res.text);
        expect(err).to.be.null;
        expect(data.name).to.equal('李静');
        expect(data.role).to.equal('出单员');
        done();
      });
    });
    it('登出', function (done) {
      testSession.post('/users/logout')
        .expect(200)
        .end(done);
    });
    it('登出后不能再访问受限资源', function (done) {
      testSession.get('/api/orders')
        .expect(401)
        .end(done);
    });
  });
});
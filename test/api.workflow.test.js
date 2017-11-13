var expect = require('chai').expect;
var app = require('../app.js');
var testSession = require('supertest-session')(app);

var config = require('../common.js').config();
var mongoose = require('mongoose');

var client = {};
var policyId = '';

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


describe('工作流测试', function () {
  describe('客户api测试', function () {
    it('用一号出单员账号登陆', function (done) {
      testSession.post('/users/login')
        .send({ username: 'cdy01', password: 'cdy01123' })
        .expect(200)
        .end(done);
    }); 
    it('添加两个客户', function (done) {
      testSession.get('/api/clients/secret-add-clients')
        .expect(200)
        .end(done);
    });
    it('登陆后成功获取客户列表', function (done) {
      testSession.get('/api/clients')
        .expect(200)
        .end(function(err, res){
        var data = JSON.parse(res.text);
        expect(err).to.be.null;
        expect(data.length).to.equal(2);
        client = data[0];
        done();
      });
    });
  });
  describe('保单api测试', function () {
    it('添加一份保单', function (done) {
      var policy = require('./data/policies.json')[0];
      policy.client = client._id;
      testSession.post('/api/policies')
        .send(policy)
        .expect(200)
        .end(done);
    });
    it('获取自己录入的保单,所有内容都已经填充', function (done) {
      testSession.get('/api/policies')
        .expect(200)
        .end(function(err, res){
        var data = JSON.parse(res.text);
        expect(err).to.be.null;
        expect(data.length).to.equal(1);
        expect(data[0].client.name).to.equal('徐州市振宁物流有限公司');
        expect(data[0].seller.name).to.equal('李静');
        policyId = data[0]._id;
        done();
      });
    });
    it('更新保单，修改商业险金额', function (done) {
      var policy = require('./data/policies.json')[0];
      policy.commercial_fee = 2818;
      testSession.put('/api/policies/' + policyId)
        .send(policy)
        .expect(200)
        .expect({message: '保单已成功更新'})
        .end(done);
    });
    it('再次获取保单，保费已成功更新', function (done) {
      testSession.get('/api/policies/' + policyId)
        .expect(200)
        .end(function(err, res){
        var data = JSON.parse(res.text);
        expect(err).to.be.null;
        expect(data.commercial_fee).to.equal(2818);
        done();
      });
    });
    it('添加保单号重复保单失败', function (done) {
      var policy = require('./data/policies.json')[0];
      testSession.post('/api/policies')
        .send(policy)
        .expect(400)
        .expect('系统中已存在相同保单号的保单')
        .end(done);
    });
    it('登出', function (done) {
      testSession.post('/users/logout')
        .expect(200)
        .end(done);
    });
    it('注册二号出单员账号', function (done) {
      testSession.get('/users/register-cdy02')
        .expect(200)
        .end(done);
    }); 
    it('用二号出单员账号登陆', function (done) {
      testSession.post('/users/login')
        .send({ username: 'cdy02', password: 'cdy02234' })
        .expect(200)
        .end(done);
    }); 
    it('二号出单员无法获取一号出单员录入保单', function (done) {
      testSession.get('/api/policies')
        .expect(200)
        .end(function(err, res){
        var data = JSON.parse(res.text);
        expect(err).to.be.null;
        expect(data.length).to.equal(0);
        done();
      });
    }); 
    it('二号出单员添加一份保单', function (done) {
      var policy = require('./data/policies.json')[1];
      policy.client = client._id;
      testSession.post('/api/policies')
        .send(policy)
        .expect(200)
        .end(done);
    });
    it('登出', function (done) {
      testSession.post('/users/logout')
        .expect(200)
        .end(done);
    });
    it('注册出纳账号', function (done) {
      testSession.get('/users/register-cn01')
        .expect(200)
        .end(done);
    }); 
    it('用出纳账号登陆', function (done) {
      testSession.post('/users/login')
        .send({ username: 'cn01', password: 'cn01987' })
        .expect(200)
        .end(done);
    }); 
    it('获取所有待支付的保单，应为2条', function (done) {
      testSession.get('/api/policies/to-be-paid')
        .expect(200)
        .end(function(err, res){
        var data = JSON.parse(res.text);
        expect(err).to.be.null;
        expect(data.length).to.equal(2);
        done();
      });
    });
    it('获取所有已支付保单，应为0条', function (done) {
      testSession.get('/api/policies/paid')
        .expect(200)
        .end(function(err, res){
        var data = JSON.parse(res.text);
        expect(err).to.be.null;
        expect(data.length).to.equal(0);
        done();
      });
    });
    it('更新保单，修改状态为已支付', function (done) {
      var policy = require('./data/policies.json')[0];
      policy.policy_status = "已支付";
      testSession.put('/api/policies/' + policyId)
        .send(policy)
        .expect(200)
        .expect({message: '保单已成功更新'})
        .end(done);
    });
    it('获取所有待支付的保单，数目已减少1条', function (done) {
      testSession.get('/api/policies/to-be-paid')
        .expect(200)
        .end(function(err, res){
        var data = JSON.parse(res.text);
        expect(err).to.be.null;
        expect(data.length).to.equal(1);
        done();
      });
    });
    it('获取所有已支付保单，数目为1条', function (done) {
      testSession.get('/api/policies/paid')
        .expect(200)
        .end(function(err, res){
        var data = JSON.parse(res.text);
        expect(err).to.be.null;
        expect(data.length).to.equal(1);
        done();
      });
    });
    it('获取所有保单，数目为2条', function (done) {
      testSession.get('/api/policies')
        .expect(200)
        .end(function(err, res){
        var data = JSON.parse(res.text);
        expect(err).to.be.null;
        expect(data.length).to.equal(2);
        done();
      });
    });
    it('用一号出单员账号登陆', function (done) {
      testSession.post('/users/login')
        .send({ username: 'cdy01', password: 'cdy01123' })
        .expect(200)
        .end(done);
    }); 
    it('删除之前录入的保单', function (done) {
      testSession.delete('/api/policies/' + policyId)
        .expect(200)
        .expect({message: '保单已成功删除'})
        .end(done);
    });
  });
  describe('Pagination', function () {
    var seller = "";
    it('获取自己的账号信息', function (done) {
      testSession.get('/users/me')
          .expect(200)
          .end(function(err, res){
            var data = JSON.parse(res.text);
            expect(err).to.be.null;
            expect(data.name).to.equal("李静");
            seller = data._id;
            done();
      });
    });

    for (var i = 0; i < 18; i++) {
      (function(index) {
        it('批量添加保单，保单号:'+(i+3), function(done) {
          var policy = require('./data/policies.json')[index + 2]; //start from id=3 to id= 20
          policy.client = client._id;
          testSession.post('/api/policies')
              .send(policy)
              .expect(200)
              .end(done);
        })})(i);
    }

    it('时间正序列，获取第1页5条保单', function (done) {
      var payLoad = {
        pageSize: 5,
        currentPage: 0,
        filterBy: {},
        filterByFields: {},
        orderBy: 'created_at',
        orderByReverse: false,
        requestTrapped: true
      };

      testSession.post('/api/policies/search')
          .send(payLoad)
          .expect(200)
          .end(function(err, res){
            var data = JSON.parse(res.text);
            expect(err).to.be.null;
            expect(data.policies.length).to.equal(5);
            expect(data.policies[0].policy_no).to.equal('3');
            done();
      });
    });
    
    it('时间正序列，获取第2页5条保单', function (done) {
      var payLoad = {
        pageSize: 5,
        currentPage: 1,
        filterBy: {},
        filterByFields: {},
        orderBy: 'created_at',
        orderByReverse: false,
        requestTrapped: true
      };

      testSession.post('/api/policies/search')
          .send(payLoad)
          .expect(200)
          .end(function(err, res){
            var data = JSON.parse(res.text);
            expect(err).to.be.null;
            expect(data.policies.length).to.equal(5);
            expect(data.policies[0].policy_no).to.equal('8');
            done();
      });
    });
    
    it('时间正序列，获取第4页3条保单', function (done) {
      var payLoad = {
        pageSize: 5,
        currentPage: 3,
        filterBy: {},
        filterByFields: {},
        orderBy: 'created_at',
        orderByReverse: false,
        requestTrapped: true
      };

      testSession.post('/api/policies/search')
          .send(payLoad)
          .expect(200)
          .end(function(err, res){
            var data = JSON.parse(res.text);
            expect(err).to.be.null;
            expect(data.policies.length).to.equal(3);
            expect(data.policies[0].policy_no).to.equal('18');
            done();
      });
    });
    
    it('时间反序列，获取第1页5条保单', function (done) {
      var payLoad = {
        pageSize: 5,
        currentPage: 0,
        filterBy: {},
        filterByFields: {},
        orderBy: 'created_at',
        orderByReverse: true,
        requestTrapped: true
      };

      testSession.post('/api/policies/search')
          .send(payLoad)
          .expect(200)
          .end(function(err, res){
            var data = JSON.parse(res.text);
            expect(err).to.be.null;
            expect(data.policies.length).to.equal(5);
            expect(data.policies[0].policy_no).to.equal('20');
            done();
      });
    });
    
  });
});
var express = require('express');
var router = express.Router();
var db = require('../utils/database.js').connection;
var Promise = require('bluebird');
var asyncMiddleware = require('../middlewares/asyncMiddleware');
var config = require('../common.js').config();
var logger = require('../utils/logger.js');
var SuspTransaction = Promise.promisifyAll(require('../models/susp-transaction.js')(db));
var Bmember = Promise.promisifyAll(require('../models/bmember.js')(db));
var Policy = Promise.promisifyAll(require('../models/policy.js')(db));
var LifePolicy = Promise.promisifyAll(require('../models/life-policy.js')(db));

router.get('/', asyncMiddleware(async (req, res, next) => {
  const transactions = await SuspTransaction.find({})
    .exec();
  res.status(200).json(transactions);
}));

router.post('/', asyncMiddleware(async (req, res, next) => {
  const data = req.body;
  const transaction = new SuspTransaction(data);
  transaction.save();
  res.status(200).json({ message: '可疑交易已成功添加' });
}));

router.put('/:id', asyncMiddleware(async (req, res, next) => {
  await SuspTransaction.findOneAndUpdateAsync({_id:req.params.id}, req.body);
  res.status(200).json({ message: '可疑交易已成功更新' });
}));

router.get('/:id', asyncMiddleware(async (req, res, next) => {
  const transactions = await SuspTransaction.findOne({_id:req.params.id}).exec();
  res.status(200).json(transactions);
}));

router.delete('/:id', asyncMiddleware(async (req, res, next) => {
  const transaction = await SuspTransaction.findOne({_id:req.params.id}).exec();
  transaction.remove();
  res.status(200).json({ message: '已删除该可疑交易' });
}));

router.post('/check', asyncMiddleware(async (req, res, next) => {
  var identities = req.body.identities;
  var checkDate = req.body.checkDate;
  var total_fee = 0;
  var illegal = false;
  var illegal_ids = [];
  var large_amount_fee_th = parseFloat(200000.0);

  var start_date = new Date(checkDate);
  start_date.setHours(0, 0, 0, 0);
  var end_date = new Date(checkDate);
  end_date.setHours(23, 59, 59, 0);

  //1. check if identity is on BMember list
  for(var i=0;i<identities.length;i++){
    const bmember = await Bmember.findOne({identity:identities[i]}).exec();
    if(bmember!=null){
      res.status(200).json({ message: "检测到身份证"+identities[i]+"在黑名单上" });
      return;
    }
  }

  //2. check total_fee in a singal day
  //console.log(identities);
  //console.log(checkDate);
  for(var j=0;j<identities.length;j++){
    total_fee = 0;
    const policies = await Policy.find({"applicant.identity":identities[j],"created_at":{$gte: start_date, $lte: end_date}}).exec();
    for (var i = 0; i < policies.length; i++){
      total_fee+=parseFloat(policies[i].mandatory_fee);
      total_fee+=parseFloat(policies[i].commercial_fee);
    }
    const life_policies = await LifePolicy.find(
      {$or:[{"applicant.identity":identities[j]},{"insurants.identity":identities[j]}],
        "created_at":{$gte: start_date, $lte: end_date}}).exec();
    for (var i = 0; i < life_policies.length; i++){
        total_fee+=parseFloat(life_policies[i].total_fee);
    }
    //console.log(life_policies);
    //console.log(total_fee);
    if(total_fee>=large_amount_fee_th){
      const suspTransaction = await SuspTransaction.findOne({"identity":identities[j],"created_at":{$gte: start_date, $lte: end_date}}).exec();
      if(suspTransaction == null){
        var susp ={};
        susp.identity = identities[j];
        susp.total_fee = total_fee;
        if(policies.length>0){
          susp.name = policies[0].applicant.name;
          susp.phone = policies[0].applicant.phone;
          susp.address = policies[0].applicant.address;
        }else if(life_policies.length>0){
          if(life_policies[0].applicant.identity == identities[j]){
            susp.name = life_policies[0].applicant.name;
            susp.phone = life_policies[0].applicant.phone;
            susp.address = life_policies[0].applicant.address;
            susp.sex = life_policies[0].applicant.sex;
            susp.birthday = life_policies[0].applicant.birthday;
          }else{
            for (var k = 0; k < life_policies[0].insurants.length; k++){
              if(identities[j] == life_policies[0].insurants[k].identity){
                susp.name = life_policies[0].insurants[k].name;
                susp.phone = life_policies[0].insurants[k].phone;
                susp.address = life_policies[0].insurants[k].address;
                susp.sex = life_policies[0].insurants[k].sex;
                susp.birthday = life_policies[0].insurants[k].birthday;
              }
            }
          }
        }
        susp.created_at = checkDate;
        susp.transactions =[];
        for (var i = 0; i < policies.length; i++){
          susp.transactions.push({"policy_type":"policies","policy_no":policies[i].policy_no,"policy_id":policies[i]._id});
        }
        for (var i = 0; i < life_policies.length; i++){
          susp.transactions.push({"policy_type":"life-policies","policy_no":life_policies[i].policy_no,"policy_id":life_policies[i]._id});
        }
        const transaction = new SuspTransaction(susp);
        transaction.save();
      }else{
        suspTransaction.transactions=[];
        for (var i = 0; i < policies.length; i++){
          suspTransaction.transactions.push({"policy_type":"policies","policy_no":policies[i].policy_no,"policy_id":policies[i]._id});
        }
        for (var i = 0; i < life_policies.length; i++){
          suspTransaction.transactions.push({"policy_type":"life-policies","policy_no":life_policies[i].policy_no,"policy_id":life_policies[i]._id});
        }
        suspTransaction.save();
      }
      illegal = true;
      illegal_ids.push(identities[j]);
    }
  }
  if(illegal){
    //console.log(illegal_ids);
    res.status(200).json({ message: '检测到涉嫌可疑交易'});
  }else{
    res.status(200).json({ message: '反洗钱检查通过' });
  }
}));

module.exports = router;

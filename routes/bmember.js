var express = require('express');
var router = express.Router();
var db = require('../utils/database.js').connection;
var Promise = require('bluebird');
var asyncMiddleware = require('../middlewares/asyncMiddleware');
var config = require('../common.js').config();
var logger = require('../utils/logger.js');
var Bmember = Promise.promisifyAll(require('../models/bmember.js')(db));

router.get('/', asyncMiddleware(async (req, res, next) => {
  const bmembers = await Bmember.find({})
    .exec();
  res.status(200).json(bmembers);
}));

router.post('/', asyncMiddleware(async (req, res, next) => {
  const data = req.body;
  const bmember = new Bmember(data);
  bmember.save();
  res.status(200).json({ message: '黑名单已成功添加' });
}));

router.put('/:id', asyncMiddleware(async (req, res, next) => {
  await Bmember.findOneAndUpdateAsync({_id:req.params.id}, req.body);
  res.status(200).json({ message: '黑名单已成功更新' });
}));

router.get('/:id', asyncMiddleware(async (req, res, next) => {
  const bmember = await Bmember.findOne({_id:req.params.id}).exec();
  res.status(200).json(bmember);
}));

router.delete('/:id', asyncMiddleware(async (req, res, next) => {
  const bmember = await Bmember.findOne({_id:req.params.id}).exec();
  bmember.remove();
  res.status(200).json({ message: '该用户已成功从黑名单移除' });
}));

module.exports = router;

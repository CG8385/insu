var express = require('express');
var router = express.Router();
var db = require('../utils/database.js').connection;
var Promise = require('bluebird');
var asyncMiddleware = require('../middlewares/asyncMiddleware');
var config = require('../common.js').config();
var Role = Promise.promisifyAll(require('../models/role.js')(db));

router.get('/', asyncMiddleware(async (req, res, next) => {
  const roles = await Role.find({})
    .exec();
  res.status(200).json(roles);
}));

router.post('/', asyncMiddleware(async (req, res, next) => {
  const data = req.body;
  const existing = await Role.findOne({name: data.name}).exec();
  if(existing){
    return res.status(400).json({ message: '角色已存在，请勿重复添加' });
  }
  const role = new Role(data);
  role.save();
  logger.info(req.user.name + " 添加了一个角色，角色名称为："+ role.name +"。"+ req.clientIP);
  res.status(200).json({ message: '角色已成功添加' });
}));

router.put('/:id', asyncMiddleware(async (req, res, next) => {
  await Role.findOneAndUpdateAsync({_id:req.params.id}, req.body);
  logger.info(req.user.name + " 更新了一个角色，角色名称为："+ role.name +"。"+ req.clientIP);
  res.status(200).json({ message: '角色已成功更新' });
}));

router.get('/:id', asyncMiddleware(async (req, res, next) => {
  const role = await Role.findOne({_id:req.params.id}).exec();
  res.status(200).json(role);
}));

router.delete('/:id', asyncMiddleware(async (req, res, next) => {
  const role = await Role.findOne({_id:req.params.id}).exec();
  logger.info(req.user.name + " 删除了一个角色，角色名称为："+ role.name +"。"+ req.clientIP);
  role.remove();
  res.status(200).json({ message: '角色已成功删除' });
}));

router.get('/hack', asyncMiddleware(async (req, res, next) => {
  const role = new Role();
  role.save();
  res.status(200).json(role);
}));

router.get('/clear', asyncMiddleware(async (req, res, next) => {
  await Role.remove({});
  res.status(200).send("cleared");
}));


module.exports = router;

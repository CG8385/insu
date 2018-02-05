var express = require('express');
var router = express.Router();
var db = require('../utils/database.js').connection;
var Role = require('../models/role.js')(db);
var Promise = require('bluebird');
var asyncMiddleware = require('../middlewares/asyncMiddleware');
var config = require('../common.js').config();

router.get('/', asyncMiddleware(async (req, res, next) => {
  const roles = await Role.find({})
    .exec();
  res.status(200).json(roles);
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

var express = require('express');
var Promise = require('bluebird');
var db = require('../utils/database.js').connection;
var ImagePolicy = require('../models/imagePolicy.js')(db);
var router = express.Router();
var Q = require('q');
var logger = require('../utils/logger.js');
var Client = require('../models/client.js')(db);
var iconv = require('iconv-lite');
var asyncMiddleware = require('../middlewares/asyncMiddleware');

ImagePolicy = Promise.promisifyAll(ImagePolicy);

router.get('/', asyncMiddleware(async (req, res, next) => {
  let ps = await ImagePolicy.find().populate('client').exec();
  res.status(200).json(ps);
}));

router.get('/:id', asyncMiddleware(async (req, res, next) => {
  let imagePolicy = await ImagePolicy.findOne({ _id: req.params.id }).populate('client').exec();
  res.status(200).json(imagePolicy);
}));


router.delete('/:id', asyncMiddleware(async (req, res, next) => {
  await ImagePolicy.removeAsync({ _id: req.params.id });
  logger.info(req.user.name + " 删除了一张保单照片。" + req.clientIP);
  res.json({ message: '照片已成功删除' });
}));

router.post('/search', asyncMiddleware(async (req, res, next) => {
  var conditions = {};

  for (var key in req.body.filterByFields) {
    if (req.body.filterByFields.hasOwnProperty(key) && req.body.filterByFields[key] != null && req.body.filterByFields[key] != "") {
      conditions[key] = req.body.filterByFields[key];
    }
  }

  var sortParam = "";
  if (req.body.orderByReverse) {
    sortParam = "-" + req.body.orderBy.toString();
  } else {
    sortParam = req.body.orderBy.toString();
  }

  if (req.body.fromDate != undefined && req.body.fromDate !='' && req.body.toDate != undefined) {
    conditions['created_at'] = { $gte: req.body.fromDate, $lte: req.body.toDate };
  } else if (req.body.fromDate != undefined && req.body.fromDate !='' ) {
    conditions['created_at'] = { $gte: req.body.fromDate };
  } else if (req.body.toDate != undefined) {
    conditions['created_at'] = { $lte: req.body.toDate };
  }
  console.log(conditions);
  let query = ImagePolicy.find(conditions);
  let promise1  = query
  .sort(sortParam)
  .skip(req.body.currentPage * req.body.pageSize)
  .limit(req.body.pageSize)
  .populate('client')
  .exec();
  promise2 = ImagePolicy.count(conditions);
  let result = await Promise.all([promise1, promise2]);
  res.status(200).json({imagePolicies: result[0], totalCount: result[1]});
}));


router.post('/bulk-process', asyncMiddleware(async (req, res, next) => {
  var ids = req.body.imageIds;
  await ImagePolicy.update({_id: {$in: ids}}, {status: "已录入"}, {multi: true});
  logger.info(req.user.name + " 批量更改了保单图片状态。" + req.clientIP);
  res.status(200).json({ message: '保单图片状态已批量更改为已录入' });
}));

router.post('/:id/process', asyncMiddleware(async (req, res, next) => {
  let imagePolicy =  await ImagePolicy.findOne({ _id: req.params.id });
  imagePolicy.status = "已录入";
  imagePolicy.save();
  logger.info(req.user.name + " 更新了一张保单照片的状态。" + req.clientIP);
  res.json({ message: '照片状态已成功更新' });
}));


module.exports = router;

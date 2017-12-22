var express = require('express');
var router = express.Router();
var db = require('../utils/database.js').connection;
var Log = require('../models/log.js')(db);
var Promise = require('bluebird');
var asyncMiddleware = require('../middlewares/asyncMiddleware');
var config = require('../common.js').config();

router.get('/', asyncMiddleware(async (req, res, next) => {
  const logs = await Log.find({})
    .populate('client','_id name')
    .exec();
  res.status(200).json(logs);
}));

router.post('/search', function (req, res) {
    var conditions = {};
  
    for (var key in req.body.filterByFields) {
      if (req.body.filterByFields.hasOwnProperty(key) && req.body.filterByFields[key] != null && req.body.filterByFields[key] != "" && req.body.filterByFields[key].indexOf('全部') == -1) {
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
      conditions['logAt'] = { $gte: req.body.fromDate, $lte: req.body.toDate };
    } else if (req.body.fromDate != undefined && req.body.fromDate !='' ) {
      conditions['logAt'] = { $gte: req.body.fromDate };
    } else if (req.body.toDate != undefined) {
      conditions['logAt'] = { $lte: req.body.toDate };
    }
    var query = Log.find(conditions);
    query
      .sort(sortParam)
      .skip(req.body.currentPage * req.body.pageSize)
      .limit(req.body.pageSize)
      .populate('client','_id name')
      .exec()
      .then(function (logs) {
        Log.count(conditions, function (err, c) {
          if (err) {
            logger.error(err);
            res.status(500).send("获取日志总数失败");
          }
          res.status(200).json({
            totalCount: c,
            logs: logs
          })
        });
      }, function (err) {
        logger.error(err);
      })
  });

router.get('/clear', asyncMiddleware(async (req, res, next) => {
  await Log.remove({});
  res.status(200).send("cleared");
}));


module.exports = router;

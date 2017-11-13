var express = require('express');
var router = express.Router();
var ALY = require("aliyun-sdk");
var config = require('../common.js').config();

router.get('/', function(req, res, next) {
  var sts = new ALY.STS({
        accessKeyId: config.sts_config.accessKeyId,
        secretAccessKey: config.sts_config.accessKeySecret,
        endpoint: config.sts_config.endpoint,
        apiVersion: '2015-04-01'
});

sts.assumeRole({
        Action: 'AssumeRole',
        // 指定角色Arn
        RoleArn: config.sts_config.roleArn,
        //设置Token的附加Policy，可以在获取Token时，通过额外设置一个Policy进一步减小Token的权限；
        //Policy: '{"Version":"1","Statement":[{"Effect":"Allow", "Action":"*", "Resource":"*"}]}',
        //设置Token有效期，可选参数，默认3600秒；
        DurationSeconds: 3600,
        RoleSessionName: 'PhotoEditor'
}, function (err, data) {
        if(err){
                res.status(500).send(err.code);
        }else{
                res.status(200).send(data);
        }
});
});

module.exports = router;

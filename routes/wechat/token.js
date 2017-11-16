const express = require('express');
const router = express.Router();
var OAuth = require('wechat-oauth');
var Promise = require("bluebird");
var WechatAPI = require('wechat-api');
var appConfig = require('../../common.js').config();

var client = new OAuth(appConfig.app_id, appConfig.app_secret);
client = Promise.promisifyAll(client);

var api = new WechatAPI(appConfig.app_id, appConfig.app_secret);
api = Promise.promisifyAll(api);


router.get('/', function(eq, res, next) {
    const url = client.getAuthorizeURL('http://' + appConfig.domain + '/wechat/api/v1/token/callback', '', 'snsapi_base');
    res.redirect(url)
});

router.get('/callback', async function (req, res) {
    const code = req.query.code;
    try{
        let result = await client.getAccessTokenAsync(code);
        // let accessToken = result.data.access_token;
        // let openId = result.data.openid;
        // res.json({openId: openId});
        res.json(result.data.openid);
    }catch(err){
        //do nothing
        res.json(err)
    }

    // });

});

router.get('/updatemenu', async function(eq, res, next) {
    var menu = JSON.stringify(require('../../menu.json'));
    await api.createMenuAsync(menu);
    res.json(menu);
});

module.exports = router;
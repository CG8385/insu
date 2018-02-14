var express = require('express');
var orders = require('./orders.js');
var clients = require('./clients.js');
var policies = require('./policies.js');
var lifePolicies = require('./lifePolicies.js')
var lifeSalaries = require('./lifeSalaries.js');
var lifeStatements = require('./lifeStatements.js');
var organizations = require('./organizations.js');
var companies = require('./companies.js');
var companyCatogories = require('./companyCatogories.js');
var policyNames = require('./policyNames.js');
var orgPolicies = require('./orgPolicies.js');
var imagePolicies = require('./imagePolicies');
var dealerPolicies = require('./dealerPolicies.js');
var migrate = require('./migrate.js');
var sts = require('./sts.js');
var logs = require('./logs');
var roles = require('./roles');
var Promise = require('bluebird');
var asyncMiddleware = require('../middlewares/asyncMiddleware');
var db = require('../utils/database.js').connection;
var Role = Promise.promisifyAll(require('../models/role.js')(db));
var router = express.Router();

/* GET home page. */
// router.use('/', ensureAuthenticated);
router.use('/orders', orders);
router.use('/clients', clients);
router.use('/policies', policies);
router.use('/organizations', organizations);
router.use('/companies', companies);
router.use('/companycatogories', companyCatogories);
router.use('/life-policies', lifePolicies);
router.use('/life-salaries', lifeSalaries);
router.use('/life-statements', lifeStatements);
router.use('/policy-names', policyNames);
router.use('/org-policies', orgPolicies);
router.use('/image-policies', imagePolicies);
router.use('/dealer-policies', dealerPolicies);
router.use('/migrate', migrate);
router.use('/sts', sts);
router.use('/logs', logs);
router.use('/roles', roles);
async function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        req.userrole = await Role.findOne({_id: req.user.userrole}).exec();
        return next();
    } else{
        console.log(req.user);
        res.status(401).send("请先登录");
    }
};

module.exports = router;

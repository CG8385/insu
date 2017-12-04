'use strict'

var config = require('../common.js').config();

var mongoose = require('mongoose');

var connection = mongoose.createConnection(config.mongodb_server);
mongoose.Promise = require('q').Promise;

connection.on('error', function (err) {
    console.log(err);
});

exports.connection = connection;
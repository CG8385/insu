'use strict'

var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    name: String,
    created_at: { type: Date },
    updated_at: { type: Date },
});

mongoose.model('PolicyName', schema);

module.exports = function (connection){
    return (connection || mongoose).model('PolicyName');
};
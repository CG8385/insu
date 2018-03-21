'use strict'

var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    name: String,
    created_at: { type: Date },
    updated_at: { type: Date },
    level: String, // 总公司，省公司，市公司，区县公司，营业部
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
    py: String
});

mongoose.model('Organization', schema);

module.exports = function (connection){
    return (connection || mongoose).model('Organization');
};
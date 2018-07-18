'use strict'

var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    name: String,
    created_at: { type: Date },
    updated_at: { type: Date },
    level: String, // 一到五级
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },

    province: String,
    city: String,
    district: String,
    area_code: String,

    py: String
});

mongoose.model('Organization', schema);

module.exports = function (connection){
    return (connection || mongoose).model('Organization');
};
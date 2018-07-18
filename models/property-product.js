'use strict'

var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
    name: String,
    income_rate: Number,
    payment_rate: Number,
    py: String,
    updated_at: { type: Date },
});

schema.pre('save', function(next){
    var now = new Date();
    this.updated_at = now;
    next();
 });

mongoose.model('PropertyProduct', schema);

module.exports = function (connection){
    return (connection || mongoose).model('PropertyProduct');
};
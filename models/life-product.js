'use strict'

var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
    name: String,
    payment_rate : [{income_rate: Number,direct_payment_rate: Number,indirect_payment_rate: Number}],
    py: String,
    updated_at: { type: Date },
    start_date: { type: Date },
    end_date: { type: Date },
});

schema.pre('save', function(next){
    var now = new Date();
    this.updated_at = now;
    next();
 });

mongoose.model('LifeProduct', schema);

module.exports = function (connection){
    return (connection || mongoose).model('LifeProduct');
};
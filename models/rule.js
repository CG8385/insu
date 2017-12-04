'use strict'

var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
    name: String,
    mandatory_income: Number, 
    mandatory_payment: Number, 
    commercial_income: Number, 
    commercial_payment: Number, 
    tax_income: Number, 
    tax_payment: Number, 
    other_income: Number, 
    other_payment: Number,
    py: String,
    updated_at: { type: Date },
});

// schema.pre('save', function(next){
//     var now = new Date();
//     this.updated_at = now;
//     next();
//  });

mongoose.model('Rule', schema);

module.exports = function (connection){
    return (connection || mongoose).model('Rule');
};
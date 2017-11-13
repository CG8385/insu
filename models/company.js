'use strict'

var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    name: String,
    created_at: { type: Date },
    updated_at: { type: Date },
    contact: String,
    phone: String,
    catogory: { type: mongoose.Schema.Types.ObjectId, ref: 'CompanyCatogory' }, //legacy, keep it for compatiblity
    level: String,
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
    rates: [{ set_at: { type: Date }, mandatory_income: Number, mandatory_payment: Number, commercial_income: Number, commercial_payment: Number, tax_income: Number, tax_payment: Number, other_income: Number, other_payment: Number }],
    // rates_based_on_taxed: Boolean
});

mongoose.model('Company', schema);

module.exports = function (connection){
    return (connection || mongoose).model('Company');
};
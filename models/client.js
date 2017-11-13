'use strict'

var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    name: String,
    short_name: String,
    license_no: String,
    client_type: String,
    identity: String,
    payee: String,
	bank: String,
	account: String,
    phone: Number,
    wechats: [String],
    created_at: { type: Date },
    updated_at: { type: Date },
    py: [String],
    other_accounts: [{ bank: String, account: String}],
    payment_substract_rate: Number,
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization'},
    license_photo: String
});

mongoose.model('Client', schema);

module.exports = function (connection){
    return (connection || mongoose).model('Client');
};
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
    py: String,
    other_accounts: [{ bank: String, account: String }],
    payment_substract_rate: Number,
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
    license_photo: String,
    agreement_photo: String,
    contract_photo: String,
    //added in v4
    openId: String,
    approved_at: { type: Date },
    identity1_filename: String,
    identity2_filename: String,
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
    pending: Boolean,
    level1_org: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
    level2_org: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
    level3_org: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
    level4_org: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
    level5_org: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
    client_status: {type: String, default: '正常'}, // 正常,已注销
    remark: String
});

mongoose.model('Client', schema);

module.exports = function (connection) {
    return (connection || mongoose).model('Client');
};
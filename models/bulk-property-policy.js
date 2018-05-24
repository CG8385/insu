
'use strict'
var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  policy_no: { type: String, index: true},
  bulk_no: { type: String, index: true},
  level1_company: { type: mongoose.Schema.Types.ObjectId, ref: 'CompanyCatogory' },
  level2_company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  level3_company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  level4_company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization'},
  level1_org: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization'},
  level2_org: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization'},
  level3_org: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization'},
  level4_org: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization'},
  level5_org: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization'},
  payer_name: String,
  insured_name: String,
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  policy_status: String,
  created_at: { type: Date },
  paid_at: {type: Date},
  product_name: String,
  fee: Number,
  income_rate: Number,
  income: Number,
  payment_rate: Number,
  payment: Number,
  profit: Number,
  policy_photo: String,
  payment_remarks:String
});


mongoose.model('BulkPropertyPolicy', schema);

module.exports = function (connection){
    return (connection || mongoose).model('BulkPropertyPolicy');
};



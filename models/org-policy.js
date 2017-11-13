
'use strict'
var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  policy_no: { type: String, index: true, unique: true },
  level1_company: { type: mongoose.Schema.Types.ObjectId, ref: 'CompanyCatogory' },
  level2_company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  level3_company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  level4_company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  plate: String,
  applicant: String,
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  policy_status: String,
  created_at: { type: Date },
  paid_at: {type: Date},
  policy_name: String,
  fee: Number,
  income_rate: Number,
  income: Number,
  payment_substract_rate: Number,
  payment: Number,
  profit: Number,
  payment_remarks:String
});


mongoose.model('OrgPolicy', schema);

module.exports = function (connection){
    return (connection || mongoose).model('OrgPolicy');
};



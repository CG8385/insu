'use strict'

var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  issue_date: { type: Date },
  invoice_no: String,
  invoice_amount: Number,
  contact: String,
  new_policy_fee: Number,
  new_policy_income: Number,
  renewal_fee: Number,
  renewal_income: Number,
  other_income: Number,
  created_at: { type: Date },
  updated_at: { type: Date },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

mongoose.model('LifeStatement', schema);

module.exports = function (connection){
    return (connection || mongoose).model('LifeStatement');
};



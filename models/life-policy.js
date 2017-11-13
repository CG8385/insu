'use strict'

var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  policy_no: { type: String, index: true, unique: true },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  policy_type: String,
  stage: String,
  total_fee: Number,
  standard_fee: Number,
  submit_date:  { type: Date },
  effective_date:  { type: Date },
  receipt_date: { type: Date },
  invoice_no: String,
  invoice_date: { type: Date },
  
  sub_policies: [{ insurant: String, policy_name: {type: mongoose.Schema.Types.ObjectId, ref: 'PolicyName' }, year: String, fee: Number, payment_rate: Number, payment: Number}],
  payment_total: Number,
  taxed_payment_total: Number,
  
  applicant: {name: String, address: String, phone: String, identity: String, sex: String, birthday: String},
  insurants:[{name: String, address: String, phone: String, identity: String, sex: String, birthday: String}],
  

  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  zy_client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  zy_rate: Number,
  zy_payment: Number,
  manager: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  director: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization'},
  created_at: { type: Date },
  updated_at: { type: Date },
});

schema.pre('save', function(next){
   var now = new Date();
   this.updated_at = now;
   if ( !this.created_at ) {
     this.created_at = now;
   }
  next();
});

mongoose.model('LifePolicy', schema);

module.exports = function (connection){
    return (connection || mongoose).model('LifePolicy');
};



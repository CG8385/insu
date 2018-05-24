'use strict'

var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  policy_no: { type: String, index: true, unique: true },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  level1_company: { type: mongoose.Schema.Types.ObjectId, ref: 'CompanyCatogory' },
  level2_company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  level3_company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  level4_company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  policy_type: String,
  stage: String,
  total_fee: Number,
  standard_fee: Number,
  submit_date:  { type: Date },
  effective_date:  { type: Date },
  receipt_date: { type: Date },
  invoice_no: String,
  invoice_date: { type: Date },
  
  sub_policies: [{ insurant: String, product: { type: mongoose.Schema.Types.ObjectId, ref: 'LifeProduct' }, year: String, fee: Number, income_rate: Number,income: Number,direct_payment_rate: Number, direct_payment: Number,class_payment_rate: Number, class_payment: Number}],
  total_income: Number,
  profit : Number,
  //taxed_profit : Number,
  payment_total: Number,
  //taxed_payment_total: Number,
  direct_payment_total:Number,
  //taxed_direct_payment_total:Number,
  class_payment_total: Number,
  
  applicant: {name: String, address: String, phone: String, identity: String, sex: String, birthday: String},
  insurants:[{name: String, address: String, phone: String, identity: String, sex: String, birthday: String}],
  

  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  //zy_client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  //zy_rate: Number,
  rates_based_on_taxed : Boolean,
  zy_payment: Number,
  //taxed_zy_payment: Number,
  zy_infos:[{zy_client:{ type: mongoose.Schema.Types.ObjectId, ref: 'Client' },zy_rate:Number,zy_payment:Number}],
  manager: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  director: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization'},
  level1_org: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization'},
  level2_org: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization'},
  level3_org: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization'},
  level4_org: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization'},
  level5_org: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization'},
  policy_status: String,
  created_at: { type: Date },
  updated_at: { type: Date },
  remark: String,
  policy_photo: String,
  client_info_photo: String,
  other_photo: String,
  agreement_photo: String
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



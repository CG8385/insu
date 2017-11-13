'use strict'

var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  policy_no: { type: String},
  mandatory_policy_no: { type: String},
  // insu_company: String,
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  level1_company: { type: mongoose.Schema.Types.ObjectId, ref: 'CompanyCatogory' },
  level2_company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  level3_company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  level4_company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  plate_province: String,
  plate_no: String,
  effective_date: {type: Date},
  applicant: { name: String, phone: String, identity: String, address: String, payer: String },
  frame_no: String,
  engine_no: String,
  payment_bank: String,
  payment_proof: String,
  mandatory_fee: Number,
  mandatory_fee_taxed: Number,
  mandatory_fee_income_rate: Number,
  mandatory_fee_income: Number,
  mandatory_fee_payment_rate: Number,
  mandatory_fee_payment: Number,
  commercial_fee: Number,
  commercial_fee_taxed: Number,
  commercial_fee_income_rate: Number,
  commercial_fee_income: Number,
  commercial_fee_payment_rate: Number,
  commercial_fee_payment: Number,
  tax_fee: Number,
  tax_fee_income_rate: Number,
  tax_fee_income: Number,
  tax_fee_payment_rate: Number,
  tax_fee_payment: Number,
  other_fee: Number,
  other_fee_taxed: Number,
  other_fee_income_rate: Number,
  other_fee_income: Number,
  other_fee_payment_rate: Number,
  other_fee_payment: Number,
  catogary: String,
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization'},
  policy_status: String,
  created_at: { type: Date },
  updated_at: { type: Date },
  paid_at: {type: Date},
  total_income: Number,
  payment_addition: Number,
  payment_substraction_rate: Number,
  payment_substraction: Number,
  payment_addition_comment: String,
  payment_substraction_comment: String,
  total_payment: Number,
  rule_rates: { set_at: { type: Date }, mandatory_income: Number, mandatory_payment: Number, commercial_income: Number, commercial_payment: Number, tax_income: Number, tax_payment: Number, other_income: Number, other_payment: Number },
  has_warning: Boolean,
  rates_based_on_taxed : Boolean,
  mandatory_policy_photo: String,
  commercial_policy_photo: String,
});

schema.index({policy_status: 1, client: 1, organization: 1, created_at: 1});

schema.pre('save', function(next){
   var now = new Date();
   this.updated_at = now;
   if ( !this.created_at ) {
     this.created_at = now;
   }
  next();
});

mongoose.model('Policy', schema);

module.exports = function (connection){
    return (connection || mongoose).model('Policy');
};



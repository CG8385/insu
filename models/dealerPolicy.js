'use strict'

var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  // policy_no: { type: String},
  // mandatory_policy_no: { type: String},
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  level1_company: { type: mongoose.Schema.Types.ObjectId, ref: 'CompanyCatogory' },
  level2_company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  level3_company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  level4_company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  rule: { type: mongoose.Schema.Types.ObjectId, ref: 'Rule' },
  plate_no: String,
  // submitted_date: {type: Date},
  // effective_date: {type: Date},
  applicant: { payer: String},
  // frame_no: String,
  // engine_no: String,
  mandatory_fee: Number,
  mandatory_fee_taxed: Number,
  mandatory_fee_income_rate: Number,
  mandatory_fee_income: Number,
  // mandatory_fee_payment_rate: Number,
  // mandatory_fee_payment: Number,
  commercial_fee: Number,
  commercial_fee_taxed: Number,
  commercial_fee_income_rate: Number,
  commercial_fee_income: Number,
  // commercial_fee_payment_rate: Number,
  // commercial_fee_payment: Number,
  total_income: Number,
  profit: Number,
  total_payment: Number,
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  dealer: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  payment_substract_rate: Number,
  profit: Number,
  policy_status: String,
  created_at: { type: Date },
  updated_at: { type: Date },
  paid_at: {type: Date},
  total_income: Number,
  // has_warning: Boolean,
  rates_based_on_taxed : Boolean,
  mandatory_policy_photo: String,
  commercial_policy_photo: String,
  payment_remarks:String,
  comment: String,
  agreement_photo: String,
});

schema.index({policy_status: 1, client: 1, created_at: 1});

schema.pre('save', function(next){
   var now = new Date();
   this.updated_at = now;
   if ( !this.created_at ) {
     this.created_at = now;
   }
  next();
});

mongoose.model('DealerPolicy', schema);

module.exports = function (connection){
    return (connection || mongoose).model('DealerPolicy');
};



'use strict'

var mongoose = require('mongoose');
var deepPopulate = require('mongoose-deep-populate')(mongoose);

var schema = new mongoose.Schema({
  policy_no: { type: String, index: true, unique: true },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  level1_company: { type: mongoose.Schema.Types.ObjectId, ref: 'CompanyCatogory' },
  level2_company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  level3_company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  level4_company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'PropertyProduct' },
  payer_name: String,
  insured_name: String,
  phone: String,
  start_date: { type: Date },
  end_date: { type: Date },
  remarks: String,

  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization'},
  level2_org: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization'},
  level3_org: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization'},
  level4_org: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization'},
  level5_org: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization'},
  policy_status: String,

  rates_based_on_taxed : Boolean,
  total_fee: Number,
  total_fee_taxed: Number,
  income_rate: Number,
  payment_rate: Number,
  income: Number,
  payment: Number,
  payment_addition: Number,
  payment_substraction: Number,
  payment_addition_comment: String,
  payment_substraction_comment: String,
  total_income: Number,
  total_payment: Number,

  policy_photo: String,
  sign_photo: String,
  identity_photo: String,
  agreement_photo: String,
  other_photo: String,

  created_at: { type: Date },
  updated_at: { type: Date },
  approved_at: { type: Date },
  paid_at: { type: Date },
  swiped_at: {type: Date},
  has_warning: Boolean
});

schema.pre('save', function(next){
   var now = new Date();
   this.updated_at = now;
   if ( !this.created_at ) {
     this.created_at = now;
   }
  next();
});

schema.plugin(deepPopulate, {});

mongoose.model('PropertyPolicy', schema);



module.exports = function (connection){
    return (connection || mongoose).model('PropertyPolicy');
};

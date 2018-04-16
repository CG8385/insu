'use strict'

var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  policy_no: { type: String, index: true, unique: true },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  level1_company: { type: mongoose.Schema.Types.ObjectId, ref: 'CompanyCatogory' },
  level2_company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  level3_company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  level4_company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'PropertyProduct' },
  receipt_date: { type: Date },
  end_date: { type: Date },
  remark: String,

  rates_based_on_taxed : Boolean,
  total_fee: Number,
  income_rate: Number,
  payment_rate: Number,
  payment_addition: Number,
  payment_substraction: Number,
  payment_addition_comment: String,
  payment_substraction_comment: String,
  total_fee: Number,
  total_payment: Number,

  policy_photo: String,
  agreement_photo: String,
  other_photo: String,

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

mongoose.model('PropertyPolicy', schema);

module.exports = function (connection){
    return (connection || mongoose).model('PropertyPolicy');
};



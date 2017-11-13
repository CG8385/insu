'use strict'

var mongoose = require('mongoose');

var schema = new mongoose.Schema({

  manager: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization'},
  title: String,
  branch_policy_fee: Number,
  area_policy_fee: Number,
  branch_salary: Number,
  area_salary: Number,
  salary_total : Number,
  taxed_salary_total : Number,
  year: String,
  month: String,
  created_at: { type: Date },
  updated_at: { type: Date },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

mongoose.model('LifeSalary', schema);

module.exports = function (connection){
    return (connection || mongoose).model('LifeSalary');
};



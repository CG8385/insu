'use strict'

var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');

var schema = new mongoose.Schema({
    name: String,
    sex: String,
    address: String,
    phone: String,
    identity: String,
    birthday: String,
    created_at: { type: Date },
    updated_at: { type: Date },
    remark: String,
});

schema.plugin(passportLocalMongoose);



mongoose.model('Bmember', schema);

module.exports = function (connection){
    return (connection || mongoose).model('Bmember');
};
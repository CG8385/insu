'use strict'

var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');

var schema = new mongoose.Schema({
    username: String,
    password: String,
    name: String,
    role: String,
    userrole: { type: mongoose.Schema.Types.ObjectId, ref: 'Role' },
    org: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
    organization: String,
    created_at: { type: Date },
    updated_at: { type: Date },
    phone: String,
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client'},
    level1_org: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
    level2_org: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
    level3_org: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
    level4_org: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
    level5_org: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
});

schema.plugin(passportLocalMongoose);



mongoose.model('User', schema);

module.exports = function (connection){
    return (connection || mongoose).model('User');
};
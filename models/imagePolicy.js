'use strict'

var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client'},
    url: String,
    created_at: { type: Date },
    status: String,
    downloaded: Boolean
});

schema.pre('save', function(next){
    this.created_at = new Date();
    next();
 });

mongoose.model('ImagePolicy', schema);

module.exports = function (connection){
    return (connection || mongoose).model('ImagePolicy');
};
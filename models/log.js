'use strict'

var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    logAt: { type: Date },
    location: String,
    device: String,
    phone: String,
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
    operation: String,
    comment: String
});

mongoose.model('Log', schema);

module.exports = function (connection){
    return (connection || mongoose).model('Log');
};
'use strict'

var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    old: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
    new: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
    rule: { type: mongoose.Schema.Types.ObjectId, ref: 'Rule' }
});

mongoose.model('Migrate', schema);

module.exports = function (connection){
    return (connection || mongoose).model('Migrate');
};
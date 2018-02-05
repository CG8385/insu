'use strict'

var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    name: String,
    created_at: { type: Date },
    updated_at: { type: Date },
    policy: {
        w: { type: Boolean, default: false }, 
        r: { type: Boolean, default: false },
        d: { type: Boolean, default: false },
        a: { type: Boolean, default: false },
        aprove: { type: Boolean, default: false },
        pay: { type: Boolean, default: false },
    },
});

mongoose.model('Role', schema);

module.exports = function (connection){
    return (connection || mongoose).model('Role');
};
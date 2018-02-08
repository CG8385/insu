'use strict'

var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    name: String,
    created_at: { type: Date },
    updated_at: { type: Date },
    policy: {
        edit: { type: Boolean, default: false }, 
        view: { type: Boolean, default: false },
        delete: { type: Boolean, default: false },
        append: { type: Boolean, default: false },
        aprove: { type: Boolean, default: false },
        pay: { type: Boolean, default: false },
        export: { type: Boolean, default: false },
    },
    lifePolicy: {
        edit: { type: Boolean, default: false }, 
        view: { type: Boolean, default: false },
        delete: { type: Boolean, default: false },
        append: { type: Boolean, default: false },
        aprove: { type: Boolean, default: false },
        pay: { type: Boolean, default: false },
        export: { type: Boolean, default: false },
    },
    dealerPolicy: {
        edit: { type: Boolean, default: false }, 
        view: { type: Boolean, default: false },
        delete: { type: Boolean, default: false },
        append: { type: Boolean, default: false },
        aprove: { type: Boolean, default: false },
        pay: { type: Boolean, default: false },
        import: { type: Boolean, default: false },
        export: { type: Boolean, default: false },
    },
    imagePolicy:{
        view: { type: Boolean, default: false },
        edit: { type: Boolean, default: false },
        delete: { type: Boolean, default: false },
        export: { type: Boolean, default: false },
    },
    client: {
        edit: { type: Boolean, default: false }, 
        view: { type: Boolean, default: false },
        delete: { type: Boolean, default: false },
        append: { type: Boolean, default: false },
        aprove: { type: Boolean, default: false },
        export: { type: Boolean, default: false },
    },
    employee: {
        edit: { type: Boolean, default: false }, 
        view: { type: Boolean, default: false },
        delete: { type: Boolean, default: false },
        append: { type: Boolean, default: false },
        export: { type: Boolean, default: false },
    },
    company: {
        edit: { type: Boolean, default: false }, 
        view: { type: Boolean, default: false },
        delete: { type: Boolean, default: false },
        append: { type: Boolean, default: false },
        export: { type: Boolean, default: false },
    },
    organization: {
        edit: { type: Boolean, default: false }, 
        view: { type: Boolean, default: false },
        delete: { type: Boolean, default: false },
        append: { type: Boolean, default: false },
        export: { type: Boolean, default: false },
    },
    log: {
        view: { type: Boolean, default: false },
        export: { type: Boolean, default: false },
    },
});

mongoose.model('Role', schema);

module.exports = function (connection){
    return (connection || mongoose).model('Role');
};
'use strict';

/*
    Module dependencies
*/

var fs     = require('fs');
var path   = require('path');


var middlewares = {};

fs
    .readdirSync(__dirname)
    .filter(function(fileName) {
        return (fileName.indexOf('.') !== 0) && (fileName !== 'index.js');
    })
    .forEach(function(fileName) {
        fileName = fileName.split('.js')[0];
        middlewares[fileName] = require(path.join(__dirname, fileName));
    });

module.exports = middlewares;
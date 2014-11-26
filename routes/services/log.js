'use strict';

/* jshint onevar: false, maxlen:200 */

/*
    Module dependencies
 */

var express     = require('express');
var libs        = require('../../libs');
var config      = libs.configManager;
var log         = libs.logManager(module);
var APIError    = libs.APIError;
var middlewares = require('../../middlewares');
var _           = require('underscore');


module.exports = function() {
    var router = express.Router();

    /*
        Login
     */
    
    router.post('/in', function(req, res, next) {
        //TODO 
    });
    
    return router;
}();

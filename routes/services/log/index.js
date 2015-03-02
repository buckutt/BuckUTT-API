'use strict';


/*
    Module dependencies
 */

var express  = require('express');


module.exports = function() {
    var router = express.Router();
    
    router.use('/', require('./in'));

    return router;
}();
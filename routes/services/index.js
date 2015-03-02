'use strict';


/*
    Module dependencies
 */

var express  = require('express');


module.exports = function() {
    var router = express.Router();
    
    router.use('/log', require('./log'));
    router.use('/transactions', require('./transactions'));
    router.use('/availableArticles', require('./availableArticles'));

    return router;
}();
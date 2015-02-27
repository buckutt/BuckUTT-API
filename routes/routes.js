'use strict';

/*
    Module dependencies
 */

var express  = require('express');

var mw = require('../middlewares');


module.exports = function() {
    var router = express.Router();
    
    //Services
    // router.use('/services/log', require('./services/log'));
    router.use('/services/transactions', require('./services/transactions'));

    //Api
    router.use('/api', require('./api/api'));


    return router;
}();
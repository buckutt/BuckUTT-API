'use strict';

/*
    Module dependencies
 */

var express  = require('express');

var mw = require('../middlewares');


module.exports = function() {
    var router = express.Router();
    
    //Services
    router.use('/services', require('./services'));

    //Api
    router.use('/api', require('./api'));


    return router;
}();
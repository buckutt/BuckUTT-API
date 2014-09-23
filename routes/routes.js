'use strict';

/*
    Module dependencies
 */

var express  = require('express');

var mw = require('../middlewares');


module.exports = function() {
    var router = express.Router();
    
    //Services
    router.use('/services/log', require('./services/log.js'));

    //Api
    router.use('/api', require('./api/api'));


    return router;
}();
'use strict';


/*
    Module dependencies
 */

var express     = require('express');
var controllers = require('../../../controllers/services');


module.exports = function() {
    var router = express.Router();

    router.get('/availableArticles', controllers.availableArticles);
    router.post('/login', controllers.login);
    router.post('/purchase', controllers.purchase);
    router.post('/reload', controllers.reload);
    router.use('/treasury', controllers.treasury);

    return router;
}();
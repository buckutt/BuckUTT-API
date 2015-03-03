'use strict';


/*
    Module dependencies
 */

var express     = require('express');
var controllers = require('../../../controllers/services');


module.exports = function() {
    var router = express.Router();

    router.get('/availableArticles?BuyerId=:BuyerId&PointId=:PointId', controllers.availableArticles);
    router.post('/login', controllers.login);
    router.post('/transactions/purchase', controllers.purchase);
    router.post('/transactions/reload', controllers.reload);

    return router;
}();
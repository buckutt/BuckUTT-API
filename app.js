'use strict';

/*
    Module dependencies
 */

var path           = require('path');
var express        = require('express');
var bodyParser     = require('body-parser');
var morgan         = require('morgan');
var methodOverride = require('method-override');
var libs           = require('./libs');
var config         = libs.configManager;
var log            = libs.logManager(module);
var middlewares    = require('./middlewares');
var models         = require('./models');


var app = express()
    .use(bodyParser.json())
    .use(morgan('dev'))
    .use(methodOverride())
    .use(express.static(path.join(__dirname, './public')));


var router = require('./routes/routes');

models.sequelize
    .authenticate()
    .success(function() {
        app
            .use('/', router)
            .use(middlewares.pageNotFound)
            .use(middlewares.internalError)
            .listen(config.get('port'));

        log.info('Server is listening on %d', config.get('port')); 
    })
    .error(function(err) {
        throw(err);
    });

module.exports = app;
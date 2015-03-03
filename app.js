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
var modelsAsync    = require('./models');


var app = express()
    .use(bodyParser.json())
    .use(morgan('dev'))
    .use(methodOverride())
    .use(express.static(path.join(__dirname, './public')));

var router = require('./routes');


// Sync with database, then listen for requests
modelsAsync()
    .then(function(models) {
        var seeder = require('./seeder')(models, config.get('seed'));

        models.sequelize
            .authenticate()
            .then(seeder)
            .then(function() {
                app
                    .use(middlewares.setModels(models))
                    .use(middlewares.parseToken)
                    .use(middlewares.accessRequired)
                    .use('/', router)
                    .use(middlewares.pageNotFound)
                    .use(middlewares.internalError)
                    .listen(config.get('port'));

                log.info('Server is listening on %d', config.get('port')); 
            })
            .catch(function(err) {
                throw new Error(err);
            });

    });


module.exports = app;
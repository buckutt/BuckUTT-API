'use strict';

/*
    Module dependencies
 */

var path           = require('path');
var cluster        = require('cluster');
var express        = require('express');
var bodyParser     = require('body-parser');
var morgan         = require('morgan');
var methodOverride = require('method-override');
var libs           = require('./libs');
var config         = libs.configManager;
var log            = libs.logManager(module);
var middlewares    = require('./middlewares');
var modelsAsync    = require('./models');

var router = require('./routes/routes');

var models;

if (cluster.isMaster) {
    modelsAsync()
        .then(function (models) {
            var seeder = require('./seeder')(models, config.get('seed'));

            models.sequelize
                .authenticate()
                .then(seeder)
                .then(function(models_) {
                    models = models_;
                    var numCPUs = require('os').cpus().length;
                    for (var i = numCPUs - 1; i >= 0; --i) {
                        cluster.fork();
                    }
                })
                .catch(function(err) {
                    throw new Error(err);
                });

        });
} else {
    var app = express()
        .use(bodyParser.json())
        .use(morgan('dev'))
        .use(methodOverride())
        .use(express.static(path.join(__dirname, './public')))

        .use(middlewares.setModels(models))
        .use('/', router)
        .use(middlewares.pageNotFound)
        .use(middlewares.internalError)
        .listen(config.get('port'));

    log.info('Server is listening on %d from worker %d', config.get('port'), cluster.worker.id); 
}

module.exports = app;
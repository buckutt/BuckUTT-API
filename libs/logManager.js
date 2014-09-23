'use strict';

/*
    Module dependencies
 */

var winston = require('winston');
var config  = require('./configManager');
var utils   = require('./utils');

/**
 * Get a logger including the module path
 * @param  {Object} module module object
 * @return {Object}        logger object
 */

function getLogger(module) {
    //using filename in log statements
    var path = utils.getModuleName(module); 
    
    return new winston.Logger({
        transports : [
            new winston.transports.Console({
                timestamp: true,
                colorize: true,
                level: config.get('log').level,
                label: path
            })
        ]
    });
}

module.exports = getLogger;
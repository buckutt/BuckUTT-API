'use strict';

/*
    Module dependencies
 */

var APIError = require('./APIError');


/**
 * Generate module nme based on path from cwd
 * @param  {Object} module module object
 * @return {String}        module name
 */

module.exports.getModuleName = function(module) {
    return module.filename.split('/').slice(-2).join('/').split('.js')[0];
};


/**
 * Generate query information based on the request object
 * @param  {Object} req request object
 * @return {Object}     query informations
 */

module.exports.getQueryInfos = function(req) {
    var queryInfos = {
        url: req.originalUrl,
        userAgent: req.headers['user-agent'],
        ipAddress: req.connection.remoteAddress,
        timestamp: Date.now()
    };

    if (req.user) {
        queryInfos.user = req.user;
    }
    else {
        queryInfos.user = null;
    }

    return queryInfos;
};


/**
 * Generate an formatted output data object
 * @param  {Object} data data to format
 * @return {Object}      formatted data object
 */

module.exports.formatData = function(data) {
    var output = {
        data: null
    };

    if (!Array.isArray(data)) {
        output.data = data;
    }
    else {
        if (data.length === 1) {
            output.data = data[0];
        }
        else if (data.length > 1) {
            output.data = data;
        }
    }

    return output;
};

/**
 * Check if the actual date is in Daylight Saving Time
 * @return {Boolean} True if summer hour, false if winter hour
 */
module.exports.isDST = function () {
    var today = new Date();
    var jan = new Date(today.getFullYear(), 0, 1);
    var jul = new Date(today.getFullYear(), 6, 1);
    var std = Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
    return today.getTimezoneOffset() < std;
}

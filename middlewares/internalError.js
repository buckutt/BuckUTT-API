'use strict';

/*
    Module dependencies
 */

var APIError  = require('../libs').APIError;
var log       = require('../libs').logManager(module);


/**
 * Handle internal server error.
 * @param  {Object}   err  error object
 * @param  {Object}   req  request object
 * @param  {Object}   res  reponse object
 * @param  {Function} next callback for next middleware
 */

module.exports = function(err, req, res, next) {
    if (err.code === APIError.codes["UNKNOWN_ERROR"]) { 
        log.error(err.extras.error.stack);
    } else {
        log.error(err.stack);
    }
    
    res
        .status(err.status || 500)
        .json({ 
            error: {
                type: err.type,
                code: err.code,
                message: err.message
            }
        });
};
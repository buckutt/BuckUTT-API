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
    log.error(err.toString());
    
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
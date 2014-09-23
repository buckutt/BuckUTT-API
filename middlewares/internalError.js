'use strict';

/*
    Module dependencies
 */

var APIError  = require('../libs').APIError;


/**
 * Handle internal server error.
 * @param  {Object}   err  error object
 * @param  {Object}   req  request object
 * @param  {Object}   res  reponse object
 * @param  {Function} next callback for next middleware
 */

module.exports = function(err, req, res, next) {
    console.log(err.stack);
    
    res.status(err.status || 500).json({ 
        error: {
            type: err.type,
            code: err.code,
            message: err.message
        }
    });
};
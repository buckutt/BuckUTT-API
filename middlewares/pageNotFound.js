'use strict';

/*
    Module dependencies
 */

var APIError  = require('../libs').APIError;


/**
 * Handle page not found. Deliver 404 error.
 * @param  {Object} req request object
 * @param  {Object} res response object
 * @param  {Function} next callback for next middleware
 */

module.exports = function(req, res, next) {
    var error = new APIError(req,
        'Route not found',
        'ROUTE_NOT_FOUND',
        404
    );

    next(error);
};
'use strict';

/*
    Module dependencies
 */

var APIError  = require('../libs').APIError;


/**
 * Provide acess to connected users only.
 * @param  {Object}   req  request object
 * @param  {Object}   res  reponse object
 * @param  {Function} next callback for next middleware
 */

module.exports = function(req, res, next) {
    if (!req.user) {
        var error = new APIError(req,
            'You are not logged in',
            'NOT_LOGGED_IN',
            401
        );

        return next(error);
    }

    next();
};
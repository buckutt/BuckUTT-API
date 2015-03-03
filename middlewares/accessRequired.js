'use strict';

/*
    Module dependencies
 */

var APIError  = require('../libs').APIError;


/**
 * Provide access to users that has the right to
 * @param  {Object}   req  request object
 * @param  {Object}   res  reponse object
 * @param  {Function} next callback for next middleware
 */

module.exports = function(req, res, next) {
    if (!req.hasAccess) {
        var error = new APIError(req,
            'You have no access here',
            'ACCESS_REQUIRED',
            401
        );

        return next(error);
    }

    next();
};
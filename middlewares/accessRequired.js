'use strict';

/*
    Module dependencies
 */

var APIError  = require('../libs').APIError;


/**
 * Provide access to accessToken bearers only.
 * @param  {Object}   req  request object
 * @param  {Object}   res  reponse object
 * @param  {Function} next [description]
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
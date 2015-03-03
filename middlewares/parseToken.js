'use strict';


/*
    Module dependencies
 */

var jwt       = require('jsonwebtoken');
var libs      = require('../libs');
var APIError  = libs.APIError;
var log       = libs.logManager(module);
var config    = libs.configManager;
var Promise   = require('bluebird');


Promise.promisifyAll(jwt);

/**
 * Parse JWT access token if provided in headers
 * Format is Authorization: Bearer [token]
 * @param  {Object}   req  request object
 * @param  {Object}   res  reponse object
 * @param  {Function} next callback for next middleware
 */

module.exports = function(req, res, next) {
    var secret = config.get('jwt').secret;

    //A private secret must be set
    if (!secret) {
        throw new Error('config.secret must be set');
    }

    //Authorization header must be set
    if (!(req.headers && req.headers.authorization)) {
        return next();
    }

    var parts = req.headers.authorization.split(' ');

    var format

    //Format check
    if (!parts.length === 2) {
        var error = new APIError(req,
            'BAD_FORMAT',
            'No token or scheme provided. Header format is Authorization: Bearer [token]',
            500
        );    
        return next(error);
    }

    var scheme = parts[0];
    var token = parts[1];

    //Format check
    if (!/^Bearer$/i.test(scheme)) {
        var error = new APIError(req,
            'BAD_FORMAT',
            'Scheme is `Bearer`. Header format is Authorization: Bearer [token]',
            500
        );    
        return next(error);
    }

    //Parse token 
    jwt
        .verifyAsync(token, secret)
        .then(function(decoded) {
            res.json(decoded);
        })
        .catch(function(err) {
            var error = new APIError(req,
                'Invalid token',
                'INVALID_TOKEN',
                500,
                {
                    error: err
                }
            );

            next(error);
        });
};
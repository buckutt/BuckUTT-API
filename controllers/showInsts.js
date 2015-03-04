'use strict';

/*
    Module dependencies
 */

var libs     = require('../libs');
var APIError = libs.APIError;
var utils    = libs.utils;
var isInBDE  = require('./isInBDE');

/**
* Show a model instance
* @param  {Object}   req  request object
* @param  {Object}   res  response object
* @param  {Function} next callback for next middleware
*/
 
module.exports = function(req, res, next) {
    var Model = req.Model;

    // Special request to check if the given user is in the BDE
    if (req.isInBDE && req.Model.name === 'User') {
        var userid = req.query.where.id[0];
        var checkingIfUserInBDE = isInBDE(req.models, userid);
        checkingIfUserInBDE.then(function (isInBDE) {
            res.json(isInBDE);
        }).catch(function (err) {
            next(error);
        });
        return;
    }

    Model
        .findAll(req.query)
        .then(function(insts) {
            res.json(utils.formatData(insts));
        })
        .catch(function(err) {
            var error = new APIError(req, 
                'An uncatched error has been throwed', 
                'UNKNOWN_ERROR',
                500,
                { 
                    error: err
                }
            );

            next(error);   
        });
};
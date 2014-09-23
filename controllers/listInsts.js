'use strict';

/*
    Module dependencies
 */

var libs     = require('../libs');
var APIError = libs.APIError;
var utils    = libs.utils;


/**
* List model instances
* @param  {Object}   req  request object
* @param  {Object}   res  response object
* @param  {Function} next callback for next middleware
*/

module.exports = function(req, res, next) {
    var Model = req.Model;
    console.log(req.query);
    Model
        .findAll(req.query)
        .success(function(insts) {
            res.json(utils.formatData(insts));
        })
        .error(function(err) {
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
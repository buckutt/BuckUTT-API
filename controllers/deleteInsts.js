'use strict';

/*
    Module dependencies
 */

var APIError = require('../libs').APIError;


/**
* Delete a model instance
* @param  {Object}   req  request object
* @param  {Object}   res  response object
* @param  {Function} next callback for next middleware
*/

module.exports = function(req, res, next) {
    var Model = req.Model;

    Model.update({ 'isRemoved': true }, req.query.where)
        .success(function() {
            res.json(200);
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
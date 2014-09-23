'use strict';

/*
    Module dependencies
 */

var libs     = require('../libs');
var APIError = libs.APIError;
var utils    = libs.utils;


/**
* Create a new model instance
* @param  {Object}   req  request object
* @param  {Object}   res  response object
* @param  {Function} next callback for next middleware
*/
 
module.exports = function(req, res, next) {
    var Model = req.Model;

    if (!Array.isArray(req.body)) {
        //Handle unique objects
        req.body = [req.body];
    }

    Model
        .bulkCreate(req.body)
        .success(function(insts) {
            res.status(201).send();
        })
        .error(function(err) {
            var error;
            
            if (err.name === 'SequelizeForeignKeyConstraintError') {
                error = new APIError(req, 
                    'ForeignKey constraint error', 
                    'BAD_FOREIGN_KEY',
                    500,
                    { 
                        error: err
                    }
                );   

                return next(error); 
            }

            error = new APIError(req, 
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
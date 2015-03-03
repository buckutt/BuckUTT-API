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

    function errorCallback (err) {
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
    }

    if (!Array.isArray(req.body)) {
        // Handle unique objects
        Model
            .create(req.body)
            .then(function (inst) {
                res.json(utils.formatData(inst));
            })
            .catch(errorCallback);
    } else {
        // Handle multiple objects
        var insts = [];
        var count = 0;
        req.body.forEach(function (oneInstance) {
            Model
                .create(oneInstance)
                .then(function (inst) {
                    insts.push(inst);
                    ++count;

                    if (count === req.body.length) {
                        res.json(utils.formatData(insts));
                        res.status(201);
                    }
                })
                .catch(errorCallback);
        });
    }
};  
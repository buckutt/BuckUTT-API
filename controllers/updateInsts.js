'use strict';

/*
    Module dependencies
 */

var APIError = require('../libs').APIError;


/**
* Update a model instance
* @param  {Object}   req  request object
* @param  {Object}   res  response object
* @param  {Function} next callback for next middleware
*/

module.exports = function(req, res, next) {
    var Model = req.Model;

    Model.update(req.body, req.query.where)
        .success(function() {
            res.json(200);
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

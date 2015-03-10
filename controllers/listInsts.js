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

    var method = 'findAll';
    if (req.query.count) {
        method = 'count';
    }

    Model
        [method](req.query)
        .then(function(insts) {
            if (req.query.includeWhere) {
                req.query.includeWhere.forEach(function (where) {
                    var key = where[0].split('.');
                    var value = where[1];
                    var table = key[0];
                    var field = key[1];

                    for (var i = insts.length - 1; i >= 0; i--) {
                        insts[i][table] = insts[i][table].filter(function (embedInst) {
                            return embedInst[field].toString() === value;
                        });

                        if (insts[i][table].length === 0) {
                            insts.splice(i, 1);
                        }
                    }
                });
            }
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
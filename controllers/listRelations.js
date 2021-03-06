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
    var models = req.models;
    var Model = req.Model;
    var relationModel = req.relationModel;
    
    Model
        .findAll(req.query)
        .then(function(subInsts) {
            if (subInsts.length === 0) {
                return res.json({
                    data: null
                });
            }

            var chainer = new models.Sequelize.Utils.QueryChainer();
            var accessor = 'get' + relationModel.as;

            subInsts.forEach(function(subInst) {
                chainer.add(subInst, accessor);
            });

            chainer
                .runSerially()
                .then(function(results) {
                    res.json(utils.formatData(results));
                })
                .catch(function(error) {
                    next(error);
                });
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
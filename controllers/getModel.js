'use strict';

/*
    Module dependencies
 */

var APIError = require('../libs').APIError;


/**
 * Parse the url param to get the modelName being required.
 * Add the name and the model associated to this name if it exists
 * in the request object, otherwise raise an error.
 * @param  {Object}   req  request object
 * @param  {Object}   res  response object
 * @param  {Function} next callback for the controller
 * @param  {String}   modelName name of the ressource. Plural.
 */

module.exports = function(req, res, next, modelName) {
    var models = req.models;
    var Model = models[modelName.toLowerCase()];

    if (!Model) {
        var error = new APIError(req, 
            'Model not found', 
            'UNKNOWN_RESSOURCE',
            404,
            { modelName: modelName }
        );

        return next(error);
    }

    req.Model = Model;
    next();
};
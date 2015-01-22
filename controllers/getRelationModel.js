'use strict';

/*
    Module dependencies
 */

var APIError = require('../libs').APIError;


/**
 * Parse the url param to get the relationModel being required.
 * Add the name and the model associated to this name if it exists
 * in the request object, otherwise raise an error.
 * @param  {Object}   req  request object
 * @param  {Object}   res  response object
 * @param  {Function} next callback for next middleware
 * @param  {String}   subModelName name of the ressource. Plural.
 */

module.exports = function(req, res, next, relationModelName) {
    var models = req.models;
    var Model = req.Model;
    var modelName = Model.options.name.plural.toLowerCase();

    relationModelName = relationModelName.toLowerCase();
    var relationModel = models.getRelationModelByAlias(modelName, 
        relationModelName);

    if (!relationModel) {
        var error = new APIError(req, 
            'Model not found', 
            'UNKNOWN_RESSOURCE',
            404,
            { relationModelName: relationModelName }
        );

        return next(error);
    }

    req.relationModel = relationModel;

    next();
};
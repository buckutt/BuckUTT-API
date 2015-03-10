'use strict';

/*
    Module dependencies
 */

var APIError = require('../libs').APIError;

/**
 * Parse GET params to query options
 * @param  {Object}   err  error object
 * @param  {Object}   req  request object
 * @param  {Object}   res  reponse object
 * @param  {Function} next callback for next middleware
 */

module.exports = function(req, res, next) {
    var models = req.models;

    var query = req.query;

    var query_ = {
        where: {},
        includeWhere: []
    };

    //Store options
    if (query.instIds) {
        query_.where.id = query.instIds;
    }
    if (query.limit) {
       query_.limit = parseInt(query.limit);
    }
    if (query.embed) {
        var embedAliasNames = query.embed.split(',');
        var embedModels = [];

        embedAliasNames.forEach(function(embedAliasName) {
            embedAliasName = embedAliasName.toLowerCase();
            var Model = req.Model;
            var modelName = Model.options.name.plural.toLowerCase();

            var relationModel = models.getRelationModelByAlias(modelName, embedAliasName);

            if (relationModel) {
                embedModels.push(relationModel);
            }
        });
        query_.include = embedModels;
    }
    if (query.offset) {
        query_.offset = parseInt(query.offset);
    }
    if (query.order && query.asc) {
        var order = query.order;
        var asc = Boolean(query.asc) ? 'DESC' : 'ASC';

        query_.order  = order + ' ' + asc;
    }
    if (query.hasOwnProperty('count')) {
        query_.count = true;
    }
    if (query.isInBDE) {
        console.log('Is In BDE : check !');
        req.isInBDE = true;
        delete query.isInBDE;
    }


    //Store params
    for (var key in query) {
        var value = query[key];

        if (!(key === 'limit' || key === 'offset' || 
            key === 'order' || key === 'asc' || 
            key === 'findBy' || key === 'embed' ||
            key === 'instIds' || key === 'count') ||
            key === 'isInBDE') {

            //Convert boolean boolean to tinyint(1)
            if (value === 'true'  || value === 'false') {
                value = (value === 'true') ? 1 : 0; 
            }

            //If % or _ are present, convert to like search
            if (value.indexOf('%') > -1 || value.indexOf('_') > -1) {
                query_.where[key] = { like: value };
            } else {
                if (key.indexOf('.') > -1) {
                    query_.includeWhere.push([key, value]);
                } else {
                    query_.where[key] = value;
                }
            }
        }
    }

    req.query = query_;
    next();
};
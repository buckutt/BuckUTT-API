'use strict';

/*
    Module dependencies
 */

var APIError  = require('../libs').APIError;


/**
 * Provide access to users that has the right to
 * @param  {Object}   req  request object
 * @param  {Object}   res  reponse object
 * @param  {Function} next callback for next middleware
 */

module.exports = function(req, res, next) {
    // For testing purpose, uncomment below
    // return next();

    //Login is not protected
    if (req.url === '/api/services/login') {
        return next();
    }

    var rights = req.user.rights || [];
    var url = req.path;
    var query = req.query; //middleware.parseQuery's job
    var method = req.method;
    var now = Date.now();

    if (req.user && (url === '/api/services/transfer' && method === 'POST') ||
            ((url === '/api/users' || url === '/api/user/' + req.user.id) && method === 'PUT') ||
            ((url === '/api/purchases' ||
            url === '/api/reloads' ||
            url === '/api/transfers' ||
            url === '/api/users') && method === 'GET')) {
        return next();
    }

    for (var i in rights) {
        var right = rights[i];
        if (Date.parse(right.endDate) > now) {

            /*
                To add a right, set the condition for it to access it's request.
                Test if the couple (url, method) is authorized and if the query.params
                does not contain forbidden values
             */

            switch (right.name) {
                case 'Admin':
                    return next();

                case 'Treasury':
                    if (method === 'GET') {
                        return next();
                    }

                case 'Seller':
                    //TODO: add routes for seller
                    if ((url === '/api/services/purchase' && method === 'POST') ||
                        ((url === '/api/articles' ||
                        url === '/api/articleslinks' ||
                        url === '/api/users' ||
                        url === '/api/usersrights' ||
                        url === '/api/usersgroups' ||
                        url === '/api/devicespoints' ||
                        url === '/api/devices' ||
                        url === '/api/meanofloginsusers' ||
                        url === '/api/services/availableArticles') && method === 'GET')) {
                        return next();
                    }

                case 'Reloader':
                    //TODO: add routes for reloader
                    if ((url === '/api/services/reload' && method === 'POST') ||
                        ((url === '/api/users' ||
                        url === '/api/usersrights' ||
                        url === '/api/usersgroups' ||
                        url === '/api/devicespoints' ||
                        url === '/api/devices' ||
                        url === '/api/reloadtypes' ||
                        url === '/api/meanofloginsusers') && method === 'GET')) {
                        return next();
                    }
            }
        }
    }

    //Either right is not implemented yet or user doesn't have the right to access
    return next(new APIError(req,
        'You have no access here',
        'ACCESS_REQUIRED',
        401
    ));
};

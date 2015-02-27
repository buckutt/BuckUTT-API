'use strict';


module.exports = function(models) {
    return function(req, res, next) {
        // this is bound to models in app.js
        req.models = models;

        next();
    };
};
'use strict';

module.exports = function(req, res, next) {

    // this is bound to models in app.js
    req.models = this;

    next();

};
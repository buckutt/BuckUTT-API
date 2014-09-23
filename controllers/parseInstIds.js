'use strict';


/**
* Parse query and store instance ids as a where option for future query
* @param  {Object}   req  request object
* @param  {Object}   res  response object
* @param  {Function} next callback for next middleware
* @param  {String} instIds models instance Ids
*/

module.exports = function(req, res, next, instIds) {
    //TODO: validation
    req.query.instIds = instIds.split(',');

    next();
};
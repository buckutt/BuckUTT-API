'use strict';

/*
    Module dependencies
 */

var Promise = require('bluebird');

/**
* Check if the given user id is in BDE
* @param  {Object}   models the db models
* @param  {Number}   userId the user id
* @return {Function} Bluebird promise
*/

module.exports = function(models, userId) {
    return new Promise(function(resolve, reject) {
        models.UsersGroups
            .findAll({
                where: {
                    UserId: userId,
                    GroupId: 1
                }
            })
            .then(function(groups) {
                var isInBDE = false;
                var currentDate = new Date();

                groups.forEach(function(group) {
                    // If we already got a period which says the user is in BDE
                    // Don't check for the next one
                    if (isInBDE) {
                        return;
                    }

                    models.Period
                        .find(group.PeriodId).success(function(period) {
                            if (period.startDate < currentDate && currentDate < period.endDate) {
                                isInBDE = true;
                                resolve(isInBDE);
                            }
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

                            reject(error);
                        });
                });
            })
            .catch(function (err) {
                var error = new APIError(req, 
                    'An uncatched error has been throwed', 
                    'UNKNOWN_ERROR',
                    500,
                    {
                        error: err
                    }
                );

            reject(error);
            });
    });
};
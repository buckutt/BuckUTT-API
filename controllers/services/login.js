'use strict';


/*
    Module dependencies
 */

var Promise     = require('bluebird');
var libs        = require('../../libs');
var config      = libs.configManager;
var log         = libs.logManager(module);
var APIError    = libs.APIError;
var middlewares = require('../../middlewares');


module.exports = function(req, res, next) {
    var sequelize = req.models.sequelize;
    var User = req.models.User;
    var Period = req.models.Period;
    var Right = req.models.Right;
    var UsersRights = req.models.UsersRights;

    var rights = [];
    var tokenOptions = { expiresInMinutes: 1440 };
    var token;

    var query = {
        where: { 
            id: req.body.UserId
        }, 
        include: [{ model: Right, as: 'Rights'}]
    };

    User
        .find(query)
        .then(function(user_) {
            /**
             * Generate right lists
             * This pattern is used to fetch all the periods which is
             * an async operation. 
             */
            var periods = [];

            for (var right of user_.Rights) {
                var opts = {
                    where: {
                        id: right.UsersRights.PeriodId
                    }
                };

                /* The function(right) is used to preserve the value of right.
                   It would have been the last value attributed by the loop at the
                   moment the promise are executed
                 */
                periods.push((function(right) {
                    return new Promise(function(resolve, reject) {
                        Period
                            .find(opts)
                            .then(function(period) {
                                //Period must be still active for the right
                                var now = Date.now();
                                //The right can be added
                                if (period.startDate <= now && period.endDate > now) {
                                    rights.push({
                                        name: right.name,
                                        FundationId: right.UsersRights.FundationId,
                                        endDate: period.endDate
                                    });
                                }
                                resolve();
                            })
                            .catch(function(err) {
                                reject(err);
                            });
                    });
                })(right));
            }

            //All promise are now finished
            return Promise.all(periods);
        })

        //All period have been fetchen and the rightList is created
        .then(function() {
            res.json(rights);
        })

        //Error handling
        .catch(function(err) {
            next(err);
        });
};
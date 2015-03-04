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
var jwt         = require('jsonwebtoken');


module.exports = function(req, res, next) {
    var sequelize = req.models.sequelize;
    var User = req.models.User;
    var Period = req.models.Period;
    var Right = req.models.Right;
    var UsersRights = req.models.UsersRights;

    var secret = config.get('jwt').secret;
    var tokenOptions = { expiresInMinutes: 1440 };
    var token;

    var opts = {
        where: { 
            id: req.body.UserId
        }
    };

    User
        .find(opts)

        //user exists
        .then(function(user) {
            if (!user) {
                var error = new APIError(req,
                    'user not found', 
                    'ACCESS_REQUIRED',
                    401
                );

                return next(error);
            }
            tokenOptions.issuer = user.id;
            return user.getRights();
        })

        //Epurate the right list to have only useful informations
        .then(function(rights_) {
            return new Promise(function(resolve, reject) {
                //It will contains only right.name, right.period.endDate, and right.point.id
                var rights = [];

                if (rights_.length === 0) {
                    return resolve(rights);
                }

                rights_.forEach(function(right, index) {
                    var opts = {
                        where: {
                            id: right.UsersRights.PeriodId
                        }
                    };

                    Period
                        .find(opts)
                        .then(function(period) {
                            //Period must be still active for the right
                            var now = Date.now();
                            //The right can be added
                            if (period.startDate <= now && period.endDate > now) {
                                rights.push({
                                    name: right.name,
                                    PointId: right.UsersRights.PointId,
                                    endDate: period.endDate
                                });
                            }

                            //All periods have been fetched
                            if (index === rights_.length - 1) {
                                resolve(rights);
                            }
                        })
                        .catch(function(err) {
                            reject(err);
                        });
                });
            })
        })

        /*
            JWT generation
         */
        
        .then(function(rights) {
            res.json({ token: jwt.sign({ rights: rights }, secret, tokenOptions) });
        })

        //Error handling
        .catch(function(err) {
            next(err);
        });
};
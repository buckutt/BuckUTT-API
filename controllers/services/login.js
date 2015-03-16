'use strict';


/*
    Module dependencies
 */

var Sequelize   = require('sequelize');
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
    var connectType;
    var token;

    var opts = {
        where:
            Sequelize.and(
                { id: req.body.UserId },
                Sequelize.or(
                    { pin: req.body.password },
                    { password: req.body.password }
                )
            )
    };

    User
        .find(opts)

        //user exists
        .then(function(user) {
            return new Promise(function(resolve, reject) {
                if (!user) {
                    var error = new APIError(req,
                        'Invalid creditentials',
                        'ACCESS_REQUIRED',
                        401
                    );
                    return reject(error);
                }

                if (user.pin) {
                    connectType = 'pin';
                }
                else if (user.password) {
                    connectType = 'password';
                }

                tokenOptions.issuer = user.id;
                return resolve(user.getRights());
            });
        })

        //Epurate the right list to have only useful informations
        .then(function(rights_) {
            return new Promise(function(resolve, reject) {
                //It will contains only right.name, right.period.endDate, and right.point.id
                var rights = [];

                if (!rights_ || rights_.length === 0) {
                    return resolve([]);
                }

                rights_.forEach(function(right, index) {
                    /* Change right.name to your database convenience, don't commit it..
                       This condition prevent important rights to be added in the JWT if a password
                       is not used
                    */
                    if (connectType === 'pin' && (right.name === 'Treasury' ||
                        right.name === 'Admin' )) {
                        return;
                    }

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

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
var bcrypt      = Promise.promisifyAll(require('bcryptjs'));


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
        where: { id: req.body.UserId }
    };


    User
        .find(opts)

        //user exists
        .then(function(user) {
            //Check pin and password
            return new Promise(function(resolve, reject) {
                bcrypt
                    .compareAsync(req.body.password, user.pin)
                    .then(function(res) {
                        if (!res) {
                            bcrypt
                                .compareAsync(req.body.password, user.password)
                                .then(function(res) {
                                    if (!res) {
                                        var error = new APIError(req,
                                            'Invalid creditentials',
                                            'ACCESS_REQUIRED',
                                            401
                                        );

                                        return reject(error);
                                    }
                                    else {
                                        connectType = 'password';
                                        resolve(user.getRights())
                                    }
                                })
                                .catch(function(err) {
                                    reject(err);
                                })
                        }
                        else {
                            connectType = 'pin';
                            resolve(user.getRights());
                        }
                    })
                    .catch(function(err) {
                        reject(err);
                    });
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

                var skipped = 0;

                rights_.forEach(function(right, index) {
                    console.log(right.name);
                    /* Change right.name to your database convenience, don't commit it..
                       This condition prevent important rights to be added in the JWT if a password
                       is not used
                    */
                    if (connectType === 'pin' && (right.name === 'Treasury' ||
                        right.name === 'seller' )) {
                        skipped++;
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
                            if (rights.length + skipped === rights_.length) {
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

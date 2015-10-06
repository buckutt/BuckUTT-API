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
    var MeanOfLoginsUsers = req.models.MeanOfLoginsUsers;
    var Period = req.models.Period;
    var Right = req.models.Right;
    var UsersRights = req.models.UsersRights;

    var secret = config.get('jwt').secret;
    var tokenOptions = { expiresInMinutes: 1440 };
    var connectType;
    var token;

    var findOptions;
    var usePassword = (req.body.password && req.body.password.length > 0);
    if (req.body.UserId) {
        findOptions = {
            where: {
                UserId: req.body.UserId
            }
        };
    } else {
        findOptions = {
            where: {
                MeanOfLoginId: req.body.MeanOfLoginId,
                data: req.body.data
            }
        };
    }

    MeanOfLoginsUsers
        .find(findOptions)

        .then(function(meanOfLoginUser) {
            return User.find(meanOfLoginUser.UserId)
        })

        //user exists
        .then(function(user) {
            //Check pin and password
            return new Promise(function(resolve, reject) {
                var bcryptPromise;
                if (usePassword) {
                    bcryptPromise = bcrypt.compareAsync(req.body.password, user.password);
                } else {
                    bcryptPromise = bcrypt.compareAsync(req.body.pin, user.pin);
                }

                bcryptPromise.then(function(res) {
                    if (!res) {
                        var error = new APIError(req,
                            'Invalid creditentials',
                            'ACCESS_REQUIRED',
                            401
                        );
                        return reject(error);
                    }
                    connectType = (usePassword) ? 'password' : 'pin';
                    resolve(user);
                }).catch(function(err) {
                    reject(err);
                });
            });
        })

        //Epurate the right list to have only useful informations
        .then(function(user) {
            return new Promise(function(resolve, reject) {
                //It will contains only right.name, right.period.endDate, and right.point.id
                user.getRights().then(function (rights_) {
                    var rights = [];

                    if (!rights_ || rights_.length === 0) {
                        return resolve({user: user, rights: []});
                    }

                    var skipped = 0;

                    rights_.forEach(function(right, index) {
                        /* 
                           This condition prevent important rights to be added in the JWT if a password
                           is not used
                        */
                        var allowed_profils = config.get('pin_login_rights');
                        if (connectType === 'pin' && allowed_profils.indexOf(right.name) == -1) {
                            skipped++;
                            return;
                        }

                        if (right.UsersRights.isRemoved) {
                            skipped++;
                            return;
                        }

                        var periodId = right.UsersRights.PeriodId;

                        Period
                            .find(periodId)
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
                                } else {
                                    skipped++;
                                }

                                //All periods have been fetched
                                if (rights.length + skipped === rights_.length) {
                                    if (rights.length > 0) {
                                        resolve({user: user, rights: rights});
                                    } else {
                                        var error = new APIError(req,
                                            'No valid rights found',
                                            'ACCESS_REQUIRED',
                                            401
                                        );

                                        return reject(error);
                                    }
                                }
                            })
                            .catch(function(err) {
                                reject(err);
                            });
                    });
                });
            })
        })

        /*
            JWT generation
         */

        .then(function(re) {
            delete re.user.pin;
            delete re.user.password;
            res.json({ user: re.user, token: jwt.sign({ id: re.user.id, rights: re.rights }, secret, tokenOptions) });
        })

        //Error handling
        .catch(function(err) {
            next(err);
        });
};

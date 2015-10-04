'use strict';


/*
    Module dependencies
 */

var Promise     = require('bluebird');
var libs        = require('../../libs');
var utils       = libs.utils;
var config      = libs.configManager;
var log         = libs.logManager(module);
var APIError    = libs.APIError;
var middlewares = require('../../middlewares');


module.exports = function (req, res, next) {
    var User       = req.models.User;
    var Transfer   = req.models.Transfer;
    var amount     = parseInt(req.body.amount, 10);
    var selfUser;
    var targetUser;
    var transfer;

    User
        .find(req.user.id)
        .then(function (user) {
            return new Promise(function (resolve, reject) {
                selfUser = user;
    
                if ((!amount && amount !== 0) || selfUser.credit < amount) {
                    var error = new APIError(req,
                        'From user has not enough credit or credit is invalid',
                        'BAD_VALUE',
                        400,
                        {
                            selfUser: selfUser.id,
                            amount: amount
                        }
                    );
                    return reject(error);
                }
                
                User.find(req.body.userId).then(resolve);
            });
        })
        .then(function (user) {
            return new Promise(function (resolve, reject) {
                if (!user) {
                    var error = new APIError(req,
                        'Unknown user',
                        'BAD_VALUE',
                        404,
                        {
                            amount: req.body.userId
                        }
                    );
                    return reject(error);
                }
                
                targetUser = user;
    
                if (targetUser.credit + amount > 100 * 100) {
                    var error = new APIError(req,
                        'To user would have too much money (limit : 100€)',
                        'BAD_VALUE',
                        400,
                        {
                            amount: amount
                        }
                    );
                    return reject(error);
                }
                
                if (selfUser.id === targetUser.id) {
                    var error = new APIError(req,
                        'Transfer between same user',
                        'BAD_VALUE',
                        400
                    );
                    return reject(error);
                }
    
                targetUser.credit += amount;
    
                targetUser.save().then(resolve);
            });
        })
        .then(function () {
            selfUser.credit -= amount;

            return selfUser.save();
        })
        .then(function () {
            transfer = Transfer.build({
                date: new Date(),
                amount: amount,
                FromId: selfUser.id,
                ToId: targetUser.id
            });

            return transfer.save();
        })
        .then(function () {
            res.json(utils.formatData(transfer));
        })
        //Error handling
        .catch(function(err) {
            next(err);
        });
};

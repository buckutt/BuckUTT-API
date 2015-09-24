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


module.exports = function (req, res, next) {
    var User       = req.models.User;
    var Transfer   = req.models.Transfer;
    var amount     = parseInt(req.body.amount, 10);
    var selfUser   = req.user;
    var targetUser;

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

    User
        .find(req.body.userId)
        .then(function(user) {
            targetUser = user;

            targetUser.credit += amount;

            return targetUser.save();
        })
        .then(function () {
            selfUser.credit -= amount;

            return targetUser.save();
        })
        .then(function () {
            var transfer = new Transfer({
                date: new Date()
                amount: amount
            });

            return transfer.save();
        })

        //Error handling
        .catch(function(err) {
            next(err);
        });
};

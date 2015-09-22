'use strict';


/*
    Module dependencies
 */

var express     = require('express');
var libs        = require('../../libs');
var config      = libs.configManager;
var utils       = libs.utils;
var log         = libs.logManager(module);
var APIError    = libs.APIError;


module.exports = function(req, res, next) {
    var Reload = req.models.Reload;
    var User = req.models.User;

    var BuyerId = req.body.BuyerId;
    var OperatorId = req.body.OperatorId;
    var PointId = req.body.PointId;
    var ReloadTypeId = req.body.ReloadTypeId;
    var credit = req.body.credit;


    if (credit <= 0) {
        var error = new APIError(req, 
            'Field credit must be positive', 
            'BAD_FORMAT',
            500
        );   

        return next(error); 
    }


    Reload
        // Create new Reload
        .create({
            date: new Date(),
            credit: credit,
            trace: "such",
            BuyerId: BuyerId,
            OperatorId: OperatorId,
            ReloadTypeId: ReloadTypeId,
            PointId: PointId
        })
        // Find User
        .then(function(reload) {
            return User.find({ where: { id: BuyerId } });
        })
        // Add new credit
        .then(function(user) {
            user.credit += credit;
            return user.save();
        })
        // Send updated User object
        .then(function(user) {
            res.json(user);
        })
        // Error handling
        .catch(function(err) {
            var error = new APIError(req, 
                'An uncatched error has been throwed', 
                'UNKNOWN_ERROR',
                500,
                { 
                    error: err
                }
            );

            next(error);
        });

};

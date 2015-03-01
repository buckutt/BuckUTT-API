'use strict';


/*
    Module dependencies
 */

var express     = require('express');
var libs        = require('../../libs');
var config      = libs.configManager;
var utils      = libs.utils;
var log         = libs.logManager(module);
var APIError    = libs.APIError;
var middlewares = require('../../middlewares');
var _           = require('underscore');
var Promise     = require('bluebird');


module.exports = function() {
    var router = express.Router();

    /*
        Reload
     */
    
    /*
        Format:
        {
            BuyerId,
            OperatorId,
            PointId,
            ReloadTypeId,
            credit
        }
     */
    
    router.post('/reload', function(req, res, next) {
        var Reload = req.models.Reload;
        var User = req.models.User;

        var BuyerId = req.body.BuyerId;
        var OperatorId = req.body.OperatorId;
        var PointId = req.body.PointId;
        var ReloadTypeId = req.ReloadTypeId;
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
                PointId: PointId
            })
            // Find User
            .then(function(reload) {
                return User.find({ where: { id: OperatorId } });
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

    });
    

    /*
        Purchase
     */
    
    /*
        Format: 
        {
            PointId, 
            SellerId, 
            BuyerId, 
            cart: [
                { article: { id, price, FundationId, type }, 
                   content: [ { id } ], 
                   quantity 
                }
            ]
        }
     */
    
    router.post('/purchase', function(req, res, next) {
        var Purchase = req.models.Purchase;
        var User = req.models.User;

        var buyer;

        if (!req.body.cart || !Array.isArray(req.body.cart)) {
            var error = new APIError(req,
                'cart field is empty', 
                'BAD_FORMAT',
                500
            );

            return next(error);
        }

        User
            .find(req.body.BuyerId)

            // Fetch buyer
            .then(function(buyer_) {
                if (!buyer_) {
                    var error = new APIError(req,
                        'Unknown BuyerId',
                        'BAD_FOREIGN_KEY',
                        500,
                        {
                            "BuyerId": req.body.BuyerId
                        }
                    );

                    return next(error);
                }

                buyer = buyer_;
                return User.find(req.body.SellerId);
            })

            /*
                buyer and seller exists.
                Calculate totalPrice and purchase list;
             */
            .then(function() {
                var cart = req.body.cart;
                var totalPrice = 0;

                //Array containing all the Purchase object going to be added
                var purchases = [];

                // Iterating over the cart to create new purchase and add price
                cart.forEach(function(item) {
                    // TODO: never trust user input
                    var price = item.article.price;
                    var FundationId = item.article.FundationId;

                    totalPrice += price * item.quantity;

                    var purchase = {
                        date: Date.now(),
                        price: price,
                        ip: 'BuckUTT-API',
                        // type: item.article.type,
                        ArticleId: item.article.id,
                        PointId: req.body.PointId,
                        FundationId: FundationId,
                        BuyerId: req.body.BuyerId,
                        SellerId: req.body.SellerId

                    };

                    for (var i = 0; i < item.quantity; i++) {
                        purchases.push(purchase);

                        // If product is a promotion, add child product as purchases for free
                        if (item.article.type == "promotion"){
                            item.content.forEach(function(childProduct) {
                                var childPurchase = {
                                    date: Date.now(),
                                    price: 0,
                                    ip: 'BuckUTT-API',
                                    // type: childProduct.type
                                    ArticleId: childProduct.id,
                                    PointId: req.body.PointId,
                                    FundationId: req.body.FundationId,
                                    BuyerId: req.body.BuyerId,
                                    SellerId: req.body.SellerId
                                };

                                purchases.push(childPurchase);
                            });
                        }                        
                    }

                    log.debug('Purchases:');
                    console.log(purchases);
                });


                if ((buyer.credit < totalPrice) && totalPrice > 0){
                    var error = new Error(req,
                            'Buyer has not enough credit',
                            'BAD_VALUE',
                            500,
                            {
                                BuyerId: buyer.id,
                                totalPrice: totalPrice
                            }
                    );

                    return next(error);
                }


                // Update buyer credit
                buyer.credit -= totalPrice;

                /*
                    Custom promise to resolve with the purchase list
                    generated above
                 */
                return new Promise(function(resolve, reject) {
                    buyer
                        .save()
                        .then(function() {
                            resolve(purchases)
                        })
                        .catch(function(err) {
                            reject(err);
                        });
                });
            })

            // Buyer has his credit updated, now we can add Purchases
            .then(function(purchases) {
                return Purchase.bulkCreate(purchases)
            })

            // All SQL operations are done
            .then(function(purchases_) {
                res.json(utils.formatData(purchases_));
            })

            // Error handling
            .catch(function(err) {
                var error;

                if (err.name === 'SequelizeForeignKeyConstraintError') {
                    error = new APIError(req, 
                        'Foreign key constraint error', 
                        'BAD_FOREIGN_KEY',
                        500,
                        { 
                            error: err
                        }
                    );

                    return next(error);    
                }

                error = new APIError(req, 
                    'An uncatched error has been throwed', 
                    'UNKNOWN_ERROR',
                    500,
                    { 
                        error: err
                    }
                );

                next(error);
            });
    });

    return router;
}();

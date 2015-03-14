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

module.exports = function() {
    var router = express.Router();
    var regDate = /^[0-9]{4}-[0-9][0-9]-[0-9][0-9] [0-9][0-9]:[0-9][0-9]:[0-9][0-9]$/;
    
    router.get('/purchases', function(req, res, next) {
      var regInt = /^[0-9]{1,4}$/;
      
      if (!regDate.test(req.query.DateStart) || !regDate.test(req.query.DateEnd) || (req.query.FundationId && !regInt.test(req.query.FundationId))) {
          var error = new APIError(req, 
              'Input not valid', 
              'BAD_FORMAT',
              400
          );

          return next(error);
      }
      var sequelize = req.models.sequelize;
      var getPurchases = '';
      
      if (req.query.FundationId){//Fundation specific
          getPurchases += "\
              SELECT\
              count(purchases.`id`) PurchasesCount,\
              sum(purchases.price) PurchasesSum,\
              purchases.price ArticlePrice,\
              articles.name ArticleName,\
              points.name PointName\
              FROM purchases\
              Inner Join articles ON articles.id = purchases.ArticleId\
              Inner Join points ON points.id = purchases.PointId\
              WHERE purchases.date between :DateStart and :DateEnd";
          getPurchases += (req.query.split_promo ? '' : ' AND purchases.price <> 0');
          getPurchases += " AND\
              purchases.FundationId = :FundationId AND\
              purchases.isRemoved = 0 AND articles.isRemoved = 0 AND points.isRemoved = 0\
              GROUP BY\
              points.name,\
              purchases.ArticleId,\
              purchases.price\
              ORDER BY\
              points.name,\
              articles.name,\
              purchases.price";
      }
      else {//general treasury
          getPurchases += "\
              SELECT\
              fundations.name FundationName,\
              points.name PointName,\
              sum(purchases.price) Amount\
              FROM\
              purchases\
              Inner Join points ON points.id = purchases.PointId\
              Inner Join fundations ON fundations.id = purchases.FundationId\
              where purchases.date between :DateStart AND :DateEnd AND\
              purchases.isRemoved = 0 AND fundations.isRemoved = 0 AND points.isRemoved = 0\
              GROUP BY\
              purchases.FundationId,\
              purchases.PointId\
              ORDER BY\
              purchases.FundationId,\
              purchases.PointId";
      }
      
      var opts = {
          replacements: {
              DateStart: req.query.DateStart,
              DateEnd: req.query.DateEnd,
              FundationId: req.query.FundationId
          }
      };
         
      sequelize
          .query(getPurchases, opts)
          .then(function(results) {
              res.json(utils.formatData(results[0]));
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

              next(error);
          });
    });
    
    router.get('/reloads', function(req, res, next) {
      if (!regDate.test(req.query.DateStart) || !regDate.test(req.query.DateEnd)) {
          var error = new APIError(req, 
              'Date format not valid', 
              'BAD_FORMAT',
              400
          );

          return next(error);
      }
      var sequelize = req.models.sequelize;

      var getReloads = "\
          SELECT\
          points.name PointName,\
          reloadtypes.name ReloadTypeName,\
          sum(reloads.credit) Amount\
          FROM\
          reloads\
          Inner Join reloadtypes ON reloads.ReloadTypeId = reloadtypes.id\
          Inner Join points ON points.id = reloads.PointId\
          where reloads.date between :DateStart AND :DateEnd AND\
          reloads.isRemoved = 0 AND points.isRemoved = 0\
          GROUP BY\
          reloads.ReloadTypeId,\
          reloads.PointId\
          ORDER BY\
          reloads.PointId,\
          reloads.ReloadTypeId";
      
      var opts = {
          replacements: {
              DateStart: req.query.DateStart,
              DateEnd: req.query.DateEnd
          }
      };
              
      sequelize
          .query(getReloads, opts)
          .then(function(results) {
              res.json(utils.formatData(results[0]));
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

              next(error);
          });
    });
    
    router.get('/clearance', function(req, res, next) {
      var sequelize = req.models.sequelize;

      var getClearance = 'SELECT sum(users.credit) clearance FROM users';
      
      sequelize
          .query(getClearance)
          .then(function(results) {
              res.json(utils.formatData(results[0]));
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

              next(error);
          });
    });
    
    router.get('/test', function(req, res, next) {
      /*if (!regDate.test(req.query.DateStart) || !regDate.test(req.query.DateEnd)) {
          var error = new APIError(req, 
              'Date format not valid', 
              'BAD_FORMAT',
              400
          );

          return next(error);
      }//*/
      var sequelize = req.models.sequelize;

      var getReloads = "\
          SELECT\
          purchases.`date`,\
          purchases.price,\
          articles.id,\
          articles.name,\
          articles.`type`,\
          points.name,\
          purchases.BuyerId,\
          users_b.firstname af,\
          users_b.lastname al,\
          users_s.firstname bf,\
          users_s.lastname bl\
          FROM\
          purchases\
          Inner Join articles ON articles.id = purchases.ArticleId\
          Inner Join points ON points.id = purchases.PointId\
          Inner Join users users_b ON users_b.id = purchases.BuyerId\
          Inner Join users users_s ON users_s.id = purchases.SellerId\
          WHERE\
          purchases.`date` >=  '2013-12-05 05:53:31' AND\
          purchases.`date` <=  '2013-12-05 19:30:00' AND\
          purchases.FundationId = 3\
          purchases.isRemoved = 0 AND articles.isRemoved = 0 AND points.isRemoved = 0\
          ORDER BY\
          points.name,\
          purchases.`date`";
      
      var opts = {
          replacements: {
              DateStart: req.query.DateStart,
              DateEnd: req.query.DateEnd
          }
      };
              
      sequelize
          .query(getReloads, opts)
          .then(function(results) {
              res.json(utils.formatData(results[0]));
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

              next(error);
          });
    });
    
    return router;
}();

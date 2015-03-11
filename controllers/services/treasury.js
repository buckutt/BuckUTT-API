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

      var getPurchases = "\
          SELECT\
          fundations.name FundationName,\
          points.name PointName,\
          sum(purchases.price) Amount\
          FROM\
          purchases\
          Inner Join points ON points.id = purchases.PointId\
          Inner Join fundations ON fundations.id = purchases.FundationId\
          where purchases.date between :DateStart and :DateEnd ";
          
      if (req.query.FundationId)
        getPurchases += ' and purchases.FundationId = :FundationId ';
      
      getPurchases += "\
          GROUP BY\
          purchases.FundationId,\
          purchases.PointId\
          ORDER BY\
          purchases.FundationId,\
          purchases.PointId";
      
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
          where reloads.date between :DateStart and :DateEnd\
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
    
    return router;
}();

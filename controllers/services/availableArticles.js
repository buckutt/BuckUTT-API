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


module.exports = function(req, res, next) {
    console.log('salut');
    var sequelize = req.models.sequelize;
    var params = req.params;

    var getPeriods = "SELECT @periods := group_concat(per.id) AS periods\
            FROM Periods per WHERE per.startDate <=  NOW()\
            AND per.endDate >=  NOW() AND per.isRemoved = 0";

    var getArticles = "\
        SELECT article.id, article.name, article.type, article.FundationId, article.stock,\
               article.isSingle, link.ParentId,\
               (SELECT article_.name\
                FROM Articles article_\
                WHERE article_.id = link.ParentId)\
            AS category,\
            MIN(price.credit) \
            AS price\
            FROM Articles article\
        Left Join ArticlesLinks link\
            ON link.ArticleId = article.id AND link.step = '0' AND link.isRemoved = 0\
        Inner Join Prices price\
            ON price.ArticleId = article.id AND price.isRemoved = 0\
        Inner Join ArticlesPoints APoints\
            ON APoints.ArticleId = article.id\
            WHERE APoints.PointId = :PointId AND find_in_set(price.PeriodId, :periods)\
                AND price.GroupId IN(SELECT UGroup.GroupId\
                                        FROM UsersGroups UGroup\
                                        WHERE UGroup.UserId = :BuyerId\
                                            AND UGroup.isRemoved = 0\
                                            AND find_in_set(UGroup.PeriodId, :periods))\
                AND (article.stock > 0 OR article.stock = -1)\
                AND article.isRemoved = 0\
        GROUP BY article.id\
        ORDER BY APoints.priority ASC, article.name ASC";

    sequelize
        .query(getPeriods)
        .then(function(periods_) {
            var periods = periods_[0][0].periods;
            var opts = {
                replacements: {
                    PointId: params.PointId,
                    periods: periods, 
                    BuyerId: params.BuyerId
                }
            };

            return sequelize.query(getArticles, opts);
        })
        .then(function(articles) {
            res.json(utils.formatData(articles));
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
};
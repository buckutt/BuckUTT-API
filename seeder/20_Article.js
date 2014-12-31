'use strict';

var Promise   = require('bluebird');

module.exports = function (sequelize) {
  return new Promise(function (resolve, reject) {
    console.log('Seeding Articles');

    var article = sequelize.Article.build({
      name: 'test',
      type: 'product',
      stock: 12,
      FundationId: 1
    });

    article.save().then(function () {
      resolve();
    }).catch(function (e) {
      reject(e);
    });
  });
};

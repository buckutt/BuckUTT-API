'use strict';

var Promise   = require('bluebird');

module.exports = function (sequelize) {
  return new Promise(function (resolve, reject) {
    console.log('Seeding Fundations');

    var bde = sequelize.Fundation.build({
      name: 'BDE',
    });

    bde.save().then(function () {
      resolve();
    }).catch(function (e) {
      reject(e);
    });
  });
};

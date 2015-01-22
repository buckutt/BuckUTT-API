'use strict';

var Promise   = require('bluebird');

module.exports = function (sequelize) {
  return new Promise(function (resolve, reject) {
    console.log('Seeding MeanOfLogin');

    var molNEtu = sequelize.MeanOfLogin.build({
      name: 'NumeroEtu',
    });

    molNEtu.save().then(function () {
      var molEtuName = sequelize.MeanOfLogin.build({
        name: 'LoginEtu',
      });
      molEtuName.save().then(function () {
        var molEtuMail = sequelize.MeanOfLogin.build({
          name: 'EmailEtu'
        });
        molEtuMail.save().then(function () {
          resolve();
        });
      });
    }).catch(function (e) {
      reject(e);
    });
  });
};

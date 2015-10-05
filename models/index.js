'use strict';

/*
   Module dependencies
 */

var fs        = require('fs');
var path      = require('path');
var Sequelize = require('sequelize');
var Promise   = require('bluebird');
var _         = require('underscore');
var config    = require('../libs').configManager;
var isDST     = require('../libs').utils.isDST;

var sequelize = new Sequelize(
    config.get('mysql').database,
    config.get('mysql').username,
    config.get('mysql').password,
    {
        host: config.get('mysql').host,
        port: config.get('mysql').port,
        dialect: 'mariadb',
	timezone: (isDST()) ? '+02:00' : '+01:00',
        logging: (config.get('mysql').debug) ? console.log : false
    }
);


var db = {};
var modelAliases = {};

fs
  .readdirSync(__dirname)
  .filter(function(file) {
      return (file.indexOf('.') !== 0) && (file !== 'index.js');
  })
  .forEach(function(file) {
      var Model = sequelize.import(path.join(__dirname, file));

      //Alias
      db[Model.name] = Model;
      db[Model.options.name.plural.toLowerCase()] = Model;

      modelAliases[Model.options.name.plural.toLowerCase()] = {};
  });

//Associate models
Object.keys(db).forEach(function(modelName) {
    if ('associate' in db[modelName]) {
        db[modelName].associate(db);
    }
});

//Fetch associations to get all references to each models
for (var modelName in db) {
    var Model = db[modelName];
    modelName = Model.options.name.plural.toLowerCase();

    for (var associationName in Model.associations) {
        var association = Model.associations[associationName];
        modelAliases[modelName][association.as.toLowerCase()] = {
            model: association.target,
            as: association.as
        };
    }   
}


function getRelationModelByAlias(modelName, alias) {
    return modelAliases[modelName][alias];
}

module.exports = function () {
  return new Promise(function (resolve, reject) {

    sequelize
      .sync({ force: config.get('override')})
      .then(function () {
        resolve(_.extend({
            sequelize: sequelize,
            Sequelize: Sequelize,
            getRelationModelByAlias: getRelationModelByAlias
        }, db));
      })
      .catch(function (e) {
        reject(e);
      });
  });
};

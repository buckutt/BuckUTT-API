'use strict';

/*
   Module dependencies
 */

var fs        = require('fs');
var path      = require('path');
var Promise   = require('bluebird');

module.exports = function (models, doSeed) {
  return function () {
    return new Promise(function (resolve, reject) {
      if (!doSeed) {
        resolve();
        return;
      }

      var files =
        fs
          .readdirSync(__dirname)
          .sort()
          .filter(function(file) {
              return (file.indexOf('.') !== 0) && (file !== 'index.js');
          })
          .map(function (file) {
            return require('./' + file)(models);
          });

      Promise.all(files).then(function () {
        resolve();
      }).catch(function (e) {
        reject(e);
      });
    });
  };
};
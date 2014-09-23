'use strict';

/*
    Module dependencies
 */

var utils = require('./utils');


var codes = {
    UNKNOWN_RESSOURCE: 1,
    UNKNOWN_ERROR: 2,
    INST_NOT_FOUND: 3,
    INST_REMOVED: 4,
    BAD_PASSWORD: 5,
    ROUTE_NOT_FOUND: 6,
    INVALID_TOKEN: 7,
    NOT_LOGGED_IN: 8,
    ACCESS_REQUIRED: 9,
    BAD_FORMAT: 10,
    BAD_FOREIGN_KEY: 11
};


function APIError(req, message, code, status, extras) {
    if (!status || typeof status !== 'number') {
        throw new Error('APIError must have an status code');
    }

    Error.call(this);
    Error.captureStackTrace(this, this.constructor);

    this.status = status;
    this.message = message;

    this.code = codes[code];
    this.type = code;
    if (!this.code) {
        throw new Error('Invalid error code: ' +  code);
    }


    this.extras = {};
    this.extras.queryInfos = utils.getQueryInfos(req);
    if (extras) {
        for(var k in extras) {
            this.extras[k] = extras[k];
        }
    }
}

APIError.prototype = Object.create(Error.prototype);
APIError.prototype.constructor = APIError;
APIError.prototype.name        = 'APIError';
APIError.prototype.toString    = function () {
    return '[APIError ' + this.type + 
      ': ' + this.message + '] ' + JSON.stringify(this.extras);
};

APIError.codes = codes;


module.exports = APIError;
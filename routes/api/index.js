'use strict';

/*
    Module dependencies
 */

var express    = require('express');
var mw         = require('../../middlewares');
var utils      = require('../../libs').utils;
var controllers = require('../../controllers');


module.exports = function() {

    var router = express.Router();

    /*
        Params
     */
  
    router
        .param('instIds', controllers.parseInstIds)
        .param('model', controllers.getModel)
        .param('relationModel', controllers.getRelationModel);

    router.route('/:model')

        /*
            List
         */
        
        .get(mw.parseQuery, controllers.listInsts)

        /*
            Create
         */
        
        .post(mw.parseQuery, controllers.createInsts);


    router.route('/:model/:instIds/')

        /*
            Read
         */
        
        .get(mw.parseQuery, controllers.showInsts)

        /*
            Update
         */
        
        .put(mw.parseQuery, controllers.updateInsts)

        /*
            Delete
         */
        
        .delete(mw.parseQuery, controllers.deleteInsts);


    /*
        Sub ressources
     */
    
    router.route('/:model/:instIds/:relationModel')
    
        /*
            List
         */
        
        .get(mw.parseQuery, controllers.listRelations);

    return router;
}();
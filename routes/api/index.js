'use strict';


/*
    Module dependencies
 */

var express     = require('express');
var controllers = require('../../controllers');
var middlewares = require('../../middlewares');


module.exports = function() {
    var router = express.Router();
    
    /**
     * Services
     */
    
    router.use('/services', require('./services'));


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
        
        .get(middlewares.parseQuery, controllers.listInsts)

        /*
            Create
         */
        
        .post(middlewares.parseQuery, controllers.createInsts);


    router.route('/:model/:instIds/')

        /*
            Read
         */
        
        .get(middlewares.parseQuery, controllers.showInsts)

        /*
            Update
         */
        
        .put(middlewares.parseQuery, controllers.updateInsts)

        /*
            Delete
         */
        
        .delete(middlewares.parseQuery, controllers.deleteInsts);


    /*
        Sub ressources
     */
    
    router.route('/:model/:instIds/:relationModel')
    
        /*
            List
         */
        
        .get(middlewares.parseQuery, controllers.listRelations);



    return router;
}();
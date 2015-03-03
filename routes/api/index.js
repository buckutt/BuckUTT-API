'use strict';


/*
    Module dependencies
 */

var express     = require('express');
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
        
        .get(controllers.listInsts)

        /*
            Create
         */
        
        .post(controllers.createInsts);


    router.route('/:model/:instIds/')

        /*
            Read
         */
        
        .get(controllers.showInsts)

        /*
            Update
         */
        
        .put(controllers.updateInsts)

        /*
            Delete
         */
        
        .delete(controllers.deleteInsts);


    /*
        Sub ressources
     */
    
    router.route('/:model/:instIds/:relationModel')
    
        /*
            List
         */
        
        .get(controllers.listRelations);


    /**
     * Services
     */
    
    router.use('/services', require('./services'));


    return router;
}();
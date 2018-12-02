/*
 * routes.js -- provides routings
*/

/*jslint  node : true, continue : true,
  devel : true, indent :2, maxerr : 50,
  newcap: true, nomen :true, plusplus : true,
  regexp : true, sloppy : true, vars : false,
  white  : true
*/

/*global */

// ----- モジュールスコープ変数開始 -----
'use strict';
var 
    configRoutes,
    crud = require('./crud' ),
    todo = require('./todo' ),

//    makeMongoId = crud.makeMongoId;
//----- モジュールスコープ変数終了 -----

//----- パブリックメソッド開始 -----
configRoutes　= function ( app, server ) {
    app.get( '/', function ( request, response ){
        response.redirect( '/tomo.html' );
    });
 
    //  app.all( '/:obj_type/*?', function ( request, response, next ){
        // response.contentType( 'json' );
        // next();
    // });
     
    app.get( '/:obj_type/list', function ( request, response ){
        crud.read(
            request.params.obj_type,
            {},
            {},
            function ( map_list ){
                response.send(  JSON.stringify(map_list) );
            }
        );
    });

    app.post( '/login', function ( request, response) {
        var user_name = request.body['name'],
            user_passwd = request.body['passwd'];

            crud.read(
            'users',
            {name: user_name, passwd: user_passwd}, {},
            function ( result_map ){
                console.log(JSON.stringify(result_map));
                response.send(  JSON.stringify(result_map));
            }
        );
    });

    app.post( '/ulist', function ( request, response) {
        crud.read(
            'todo', //request.params.obj_type,
            { uid: request.body.uid },
            {},
            function ( map_list ){
                console.log(JSON.stringify(map_list));
                response.send(  JSON.stringify(map_list) );
            }
        );
    });


    app.post( '/:obj_type/create', function ( request, response) {
        crud.construct(
            request.params.obj_type,
            request.body,
            function ( result_map ){
                response.send(  result_map );
            }
        );
    });
    
    app.get( '/:obj_type/read/:id', function ( request, response) {
        crud.read(
            request.params.obj_type,
            { _id: makeMongoId( request.params.id) },
            {},
            function ( map_list ){
                response.send(  map_list );
            }
        );
    });

    app.post( '/:obj_type/update/:id', function ( request, response) {
        crud.update(
            request.params.obj_type,
            { _id: makeMongoId( request.params.id) },
            request.body,
            function ( result_map ){
                response.send(  result_map );
            }
        );    
    });
    
    app.get( '/:obj_type/delete/:id', function ( request, response) {
        crud.destroy(
            request.params.obj_type,
            { _id: makeMongoId( request.params.id) },
            function ( result_map ){
                response.send(  result_map );
            }
        );    
    });

};

module.exports = { configRoutes : configRoutes };
//----- パブリックメソッド終了 -----
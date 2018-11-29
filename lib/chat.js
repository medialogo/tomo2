/*
 * chat.js -- provides chat messaging
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
    emitUserList, signIn, signOut,
    chatObj,
    socket = require( 'socket.io' ),
    crud = require('./crud' ),

    makeMongoId = crud.makeMongoId,
    chatterMap = {};
//----- モジュールスコープ変数終了 -----

//----- ユーティリティメソッド開始 -----
// emittUserList - emit user list to all connected clients
//
emitUserList = function (io) {
    crud.read(
        'user',
        { is_online : true },
        {},
        function ( result_list ){
            io
                .of( '/chat' )
                .emit( 'listchange', result_list );
        }
    );
};

// singnIn - updates 'is_online' property & chatterMap
signIn = function (io, user_map, socket) {
    crud.update(
        'user',
        { '_id' : user_map._id },
        { is_online : true },
        function ( result_map ) {
            emitUserList ( io );
            user_map.is_online = true;
            socket.emit ( 'userupdate', user_map );
        }
    );

    chatterMap[ user_map._id ] = socket;
    socket.user_id = user_map._id;
};

// singnOut - updates 'is_online' property & chatterMap
signOut = function (io, user_id) {
    crud.update(
        'user',
        { '_id' : user_id },
        { is_online : false },
        function ( result_list ) {
            emitUserList ( io );
        }
    );
    delete chatterMap[ user_id ];

    //crud.close();
};
//----- ユーティリティメソッド終了 -----

//----- パブリックメソッド開始 -----
chatObj　= {
    connect : function ( server ) {
        var io = socket.listen( server );

        // io settings
        io
            .set( 'blacklist', [] )
            .of( '/chat' )
            .on( 'connection' , function ( socket ) {

                socket.on( 'adduser', function ( user_map ) {
                // /adduser/ メッセージハンドラ開始
                // 概要 : サインイン機能を提供する。
                // 引数 : １つの user_map オブジェクト。
                //   user_map は以下のプロパティを持つ。
                //     name  =  ユーザーの名前
                //     cid   =  クライアントID
                // 動作 : 
                //   指定のユーザー名を持つユーザーが MongoDB に既に存在する場合には、
                //     既存のユーザーオブジェクトを使い、他の入力は無視する。
                //   指定のユーザー名を持つユーザーが MongoDB に既に存在しない場合には、
                //     ユーザーオブジェクトを作成してそれを使う。
                //   送信者に「userupdate」メッセージを送信し、
                //     ログインサイクルを完了できるようにする。クライアントIDを戻し、
                //     クライアントがユーザーを関連付けられるようにするが、MongoDB には格納しない。
                //   ユーザーをオンラインとしてマークし、[addUser]メッセージを発行した
                //     クライアントを含めた全クライアントに、更新されたオンラインユーザーリストを配信する。
                //
                    crud.read(
                        'user',
                        {name : user_map.name },
                        {},
                        function ( result_list ){
                            var 
                                result_map,
                                cid = user_map.cid;

                            delete user_map.cid;

                            if ( result_list.length > 0 ) {
                            // 指定の名前を持つ既存をユーザーを使う
                                result_map = result_list[ 0 ];
                                result_map.cid = cid;
                                signIn( io, result_map, socket );
                            } 
                            else {
                            // 新しい名前のユーザーを作成する
                                user_map.is_online =true;
                                crud.construct(
                                    'user',
                                    user_map,
                                    function ( result_list ) {
                                        result_map = result_list[ 0 ];
                                        result_map = {};
                                        console.log ( result_map );
                                        result_map.cid = cid;
                                        chatterMap[ result_map._id ] = socket;
                                        socket.user_id = result_map._id;
                                        socket.emit( 'userupdate' , result_map );
                                        emitUserList( io );
                                    }
                                )
                            }

                        }
                    )
                } );  // /adduser/ メッセージハンドラ終了

                socket.on( 'updatechat', function ( chat_map ) {
                // /updatechat/ メッセージハンドラ開始
                // 概要 : チャットのメッセージ処理を提供する。
                // 引数 : １つの chat_map オブジェクト。
                //   chat_map は以下のプロパティを持つ。
                //     dest_id  =  受信者のID
                //     dest_name  =  受信者の名前
                //     sender_id  =  送信者のID
                //     msg_text   =  メッセージテキスト
                // 動作 : 
                //   受信者がオンラインの場合、受信者に chat_map を送信する。
                //   オンラインではない場合は、「～さんはオフラインです」というメッセージを送信者に送信する
                //
                    if ( chatterMap.hasOwnProperty ( chat_map.dest_id )) {
                        chatterMap[ chat_map.dest_id ]
                            .emit( 'updatechat', chat_map );
                    } else {
                        socket.emit( 'updatechat', {
                            sender_id : chat_map.sender_id,
                            msg_text  : chat_map.dest_name + 'さんはオフラインです'
                        });
                    }
                } );  // /updatechat/ メッセージハンドラ終了

                // disconnect メソッド開始
                socket.on( 'leavechat', function () {
                    console.log(
                        "** %s さんがログアウトしました **", socket.user_id
                    );
                    signOut( io, socket.user_id );
                } );

                socket.on( 'disconnect', function () {
                    console.log(
                        "** %s さんがログアウトしました **", socket.user_id
                    );
                    signOut( io, socket.user_id );
                } );
                // disconnect メソッド終了

                socket.on( 'updateavatar', function ( avtr_map ) {
                    // /updatechat/ メッセージハンドラ開始
                    // 概要 : アバターのクライアント更新に対処する。
                    // 引数 : １つの avtr_map オブジェクト。
                    //   avtr_map は以下のプロパティを持つ。
                    //     person_id  =  交信するユーザーアバターのID
                    //     css_map  =  上端、左端、背景色の css マップ
                    // 動作 : 
                    //   このハンドラの MongoDB のエントリを更新し、
                    //   全クライアントに修正したユーザーリストを配信する。
 
                    crud.update (
                        'user',
                        { '_id' : makeMongoId ( avtr_map.person_id ) },
                        { css_map : avtr_map.css_map },
                        function ( result_list ) { emitUserList( io )}
                    );
                });
            
            });
            // io 設定終了
        return io;
    }
};   

module.exports = chatObj;
//----- パブリックメソッド終了 -----

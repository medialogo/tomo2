/*
 * tomo.fake.js
 * フェイクモジュール
 *
*/

/*jslint         browser : true, continue : true,
  devel  : true, indent  : 2,    maxerr   : 50,
  newcap : true, nomen   : true, plusplus : true,
  regexp : true, sloppy  : true, vars     : false,
  white  : true
*/

/*global $, tomo */

tomo.fake = (function () {
  'use strict';
  var getUsersList, fakeIdSerial, makeFakeId, mockSio,
      getTodoList;

  fakeIdSerial = 5;

  makeFakeId = function () {
      return 'id_' + String( fakeIdSerial++ );
  };
  
  getUsersList = function () {
    return[
        { name : 'takashi', 
        _id : 'id_01',
        passwd : 'lunkekke',
      },
      { name : 'Mike', 
        _id : 'id_02',
        passwd : 'skimakaZ',
      },
      { name : 'Julia', 
        _id : 'id_03',
        passwd : 'skimakkaz',
      }
  
    ]
  };

  getTodoList = function () {
    return[
        {
            _id     : 'todo_01',
            cid    : 'todo_01',
            uid    : 'id_01',
            linum  : 1,
            order  : 2,
            title  : "tomo app 開発",
            memo   : "11月中に完成"
        },
        {
            _id     : 'todo_02',
            cid    : 'todo_02',
            uid    : 'id_01',
            linum  : 2,
            order  : 3,
            title  : "自室断捨離",
            memo   : "誕生日まで"
        },
        {
            _id     : 'todo_03',
            cid    : 'todo_03',
            uid    : 'id_01',
            linum  : 3,
            order  : 1,
            title  : "年金手続き",
            memo   : "来週"
        },
        {
            _id     : 'todo_04',
            cid    : 'todo_04',
            uid    : 'id_02',
            linum  : 4,
            order  : 4,
            title  : "ゴルフ場探し",
            memo   : ""
        },
    ]
  };

  mockSio = (function () {
      var
          on_sio, emit_sio, emit_mock_msg,
          send_listchange, listchange_idto,
          callback_map = {};

      on_sio = function ( msg_type, callback ){
          callback_map[ msg_type ] = callback;
      };

      emit_sio = function ( msg_type, data ){
          var person_map, i;

        // 3秒間の遅延後に「userupdate」コールバックで
        // 「adduser」イベントに応答する
        //
        if ( msg_type === 'adduser' && callback_map.userupdate ){
          setTimeout( function () {
              person_map = {
                  _id 		: makeFakeId(),
                  name		: data.name,
            };
              peopleList.push( person_map );
              callback_map.userupdate( [ person_map ]);
          },3000);
        }

        // 2秒の遅延後に「updatechat」コールバックで
        //「update_chat」イベントに応答する。ユーザ情報を送り返す。
        if ( msg_type === 'updatechat' && callback_map.updatechat ) {
            setTimeout( function () {
                var user = tomo.model.people.get_user();
                callback_map.updatechat([{
                  dest_id		: user.id,
                  dest_name : user.name,
                  sender_id	: data.dest_id,
                  msg_text	: 'ありがとう, ' + user.name
              }]);
            }, 2000);
        }

        if ( msg_type === 'leavechat' ){
            // ログイン状態をリセットする
            delete callback_map.listchange;
            delete callback_map.updatechat;

            if ( listchange_idto ) {
                clearTimeout( listchange_idto );
                listchange_idto = undefined;
            }
            send_listchange();
        }

        // サーバーへの「updateavatar」メッセージとデータの送信をシミュレートする
        if( msg_type === 'updateavatar' && callback_map.listchange ) {
            //「listchange」メッセージの受信をシミュレートする
            for ( i = 0; i < peopleList.length; i++ ) {
                if ( peopleList[i]._id === data.person_id ){
                    // peopleList[ i ].css_map = data.css_map;
                    break;
                }
            }
            //「listchange」メッセージ用のコールバックを実行する
            callback_map.listchange([ peopleList ]);
        }
      };

      emit_mock_msg = function() {
          setTimeout( function () {
              var user = tomo.model.people.get_user();
              if ( callback_map.updatechat ){
                  callback_map.updatechat([{
                      dest_id   : user.id,
                      dest_name : user.name,
                      sender_id : 'id_04',
                      msg_text : 'やあ ' + user.name + '! Wilma です。'
                  }]);
              }
              else { emit_mock_msg(); }
          }, 8000 );
      };

      // 1秒間に1回 listchange コールバックを使うようにする。
      // 一度成功したら止める。
      send_listchange = function() {
          listchange_idto =setTimeout( function() {
            if (callback_map.listchange ) {
                callback_map.listchange([ peopleList ]);
                emit_mock_msg();
                listchange_idto = undefined;
            }
            else { send_listchange(); }
          }, 1000);
      };

      // 処理を開始する必要がある
      send_listchange();

      return { emit : emit_sio, on : on_sio };
  }());

  return {
      mockSio	: mockSio,
      getUsersList : getUsersList,
      getTodoList  : getTodoList,
  };
}());

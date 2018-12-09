/*
 * tomo.model.js
 * モデル機能モジュール
 *
 * Michael S. Mikowski - mike.mikowski@gmail.com
 * Copyright (c) 2011-2012 Manning Publications Co.
*/

/*jslint         browser : true, continue : true,
  devel  : true, indent  : 2,    maxerr   : 50,
  newcap : true, nomen   : true, plusplus : true,
  regexp : true, sloppy  : true, vars     : false,
  white  : true
*/

/*global TAFFY, $, tomo */

tomo.model = (function () {

  'use strict';
  //---------------- モジュールスコープ変数↓ --------------
  var
    configMap = { anon_id : 'a0'},
    stateMap  = {
      anon_user	: null,   // 匿名userオブジェクトを格納
      current_user	: null,

      todoCid_serial: 0,
      todo_cid_map : {},
      todo_db		 : TAFFY(), //todoオブジェクトのTaffyDBコレクションを格納
      current_item	: null,
    },

    isFakeData = false, // true,
    hostname =  tomo.env.getHostName(),

    userProto, makeCid, completeLogin,
    makeUser, removeUser, users, 
    itemProto, makeTodoCid, makeItem,clearItemDb,  todo, 
    initModule;
  //----------------- モジュールスコープ変数↑ ---------------

  // ---------------------
  // usersオブジェクトAPI
  // ---------------------

  userProto = {
/*       get_is_current_user : function () { // オブジェクトが現在のユーザの場合にtrueを返す
          return this.cid === stateMap.current_user.cid;
      },
      get_is_anon : function () { // オブジェクトが匿名ユーザの場合にtrueを返す
          return this.cid === stateMap.anon_user.cid;
      }
 */  };



  completeLogin = function ( user_list ) {
      console.log("now completeLogin");
      //var user_map = user_list[0];
      //stateMap.current_user.id = user_map._id;
    　stateMap.current_user = user_list[0];
      $.gevent.publish( 'tomo-login', true);
      console.log ( stateMap.current_user);  
  };


  makeUser = function ( user_map ) {
    var user,
          id 		= user_map._id,
          passwd    = user_map.passwd,
          name		= user_map.name;

    if ( !user_map || !passwd || !name ) {
        throw 'ユーザー名とパスワードを入力してください';
    }

    // userオブジェクトを作成
    user			= Object.create( userProto );
    user._id = null;
    user.name = name;
    user.passwd = passwd;
    user.is_onlie = false;

    if ( id ) { user._id = id; }
    return user;
  };

  removeUser = function ( user ){
      if ( ! user ){ return false; }
      // 匿名ユーザは削除できない
      if ( user.id === configMap.anon_id ){
          return false;
      }

      return true;
  };
  //
  // ---------------------
  // todo オブジェクトAPI
  // ---------------------

  itemProto = {
    get_is_current_item : function () { // オブジェクトが現在のアイテムの場合にtrueを返す
        return this.cid === stateMap.current_item.cid;
    },
  };

    makeTodoCid = function ( num ){
        if ( num === undefined ) { num = 1 }
        return 'todo_' + ('00' + num ).slice(-2);
    };

    makeItem = function ( item_map ) {
        var item,
            id 	 = item_map.id,
            cid	= item_map.cid,
            uid	= item_map.uid,
            linum	= item_map.linum,
            order	= item_map.order,
            title    = item_map.title,
            memo		= item_map.memo;
            if ( !cid ) { cid = makeTodoCid(linum)};

        // itemオブジェクトを作成
        item = Object.create( itemProto );
        item.cid	= cid;
        item.uid	= uid;
        item.linum	= linum;
        item.order	= order;
        item.title = title;
        item.memo = memo;

        if ( id ) { item.id = id; }

        stateMap.todo_cid_map[ cid ] = item;
        stateMap.todo_db.insert( item );

        return item;
  };
  clearItemDb = function (){
    // if (stateMap.todo_db)
    stateMap.todo_db().remove();
  };
  //------------------- パブリックメソッド↓ -------------------
  // パブリックメソッド /users/ ↓
  users = (function (){
    var get_current_user, login, logout;

    get_current_user = function () { return stateMap.current_user; };

    login = function ( name, passwd  ) {

        if ( !name || !passwd ) {
            throw 'ユーザー名とパスワードを入力してください';
        }
    
        var result;

        $.ajax({
            async: true,
                url: 'http://' + hostname + '/login',
            type: 'post',
            data:{ "name" : name, "passwd" : passwd},
            dataType: 'json'
            })
            .fail(function(res, status, XHR){
                    result = false;
               })
               .always(function(res, status, XHR){
                var res =JSON.parse(XHR.responseText);
                if ( res[0]) {
                    stateMap.current_user = res[0];
                    console.log(res[0])
                    result = true;
                } else {
                    result = false;
                }    
    
                $.gevent.publish( 'tomo-login', result);
               });

    };

    logout = function () {
      var user = stateMap.current_user;

      //チャットルームから退出
      chat._leave();
      stateMap.current_user = stateMap.anon_user;
      clearUsersDb();

      $.gevent.publish( 'tomo-logout', [ user ]);
    };

    return {
      get_current_user		: get_current_user,
      login				: login,
      logout			: logout
    };
  }());
  // パブリックメソッド /users/ ↑

  // パブリックメソッド /todo/ ↓
  todo = (function (){
    var get_items, get_db;

    get_db = function () { return stateMap.todo_db; };

    get_items = function () { 
        var result;
        //console.log(stateMap.current_user._id);
        clearItemDb();

        $.ajax({
            async: true,
                url: 'http://' + hostname + '/ulist',
            type: 'post',
            data:{ "uid" : stateMap.current_user._id} ,
            dataType: 'json'
            })
               .always(function(res, status, XHR){
                if ( XHR.responseText ) {
                    var i, item_map;
                    result = true;
                    var items = JSON.parse(XHR.responseText);
                    // console.log(items);
                    for ( var i = 0; i < items.length; i++) {
                        item_map = items[i];
                        makeItem({
                          id     : item_map._id,
                          cid    : item_map._id,
                          uid    : item_map.uid,
                          linum  : item_map.linum,
                          order  : item_map.order,
                          title  : item_map.title,
                          memo   : item_map.memo
                        });
                        console.log(i+":"+item_map);
                    }
                } else {
                    result = false;
                }    
            //    })
            //    .fail(function(xhr, status, error){
            //      console.log(xhr.responsText);
            //      result = false;
            //    })
            //    .always(function() {
                    $.gevent.publish( 'tomo-item-loaded', result);
               });

    };

    return {
      get_db        : get_db,
      get_items		: get_items
    };
  }());

  // パブリックメソッド /todo/ ↑

  // パブリックメソッド /initModule/ ↓
  //
  initModule = function () {
    var i, users_list, user_map,
        todo_list, item_map;

    // 匿名ユーザを初期化する
    stateMap.anon_user = makeUser({
      cid : configMap.anon_id,
      id  : configMap.anon_id,
      passwd : 'secret',
      name: 'anonymous'
    });
    stateMap.user = stateMap.anon_user; // 現在のユーザの初期値は匿名ユーザ
0
/*     if ( isFakeData ) {
        // ユーザーリストの取得
        users_list = tomo.fake.getUsersList();
        for ( i = 0; i < users_list.length; i++) {
            user_map = users_list[i];
            makeUser({
              cid     : user_map._id,
              id     : user_map._id,
              name     : user_map.name,
              passwd     : user_map.passwd
            });
        }

        // todoリストの取得
        todo_list = tomo.fake.getTodoList();
        for ( i = 0; i < todo_list.length; i++) {
            item_map = todo_list[i];
            makeItem({
              id     : item_map._id,
              cid    : item_map._id,
              uid    : item_map.uid,
              linum  : item_map.linum,
              order  : item_map.order,
              title  : item_map.title,
              memo   : item_map.memo
            });
        }
    }
 */  };
  // パブリックメソッド /initModule/ ↑

  // パブリックメソッドを返す
  return {
    initModule  : initModule,
    todo		: todo,
    users		: users,
    makeItem    : makeItem
/*     makeCid      : makeCid,
    makeTodoCid : makeTodoCid */
  };
  //------------------- パブリックメソッド↑ ---------------------
}());

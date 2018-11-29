/*
 * tomo.login.js
 * tomoのログイン機能モジュール
*/

/*jslint  browser : true, continue : true,
  devel : true, indent :2, maxerr : 50,
  newcap: true, nomen :true, plusplus : true,
  regexp : true, sloppy : true, vars : false,
  white  : true
*/

/*global $, tomo */

tomo.login = (function () {
  'use strict';
//---------------- モジュールスコープ変数↓ --------------
var

  configMap = {
    main_html : String()
      + '<div id="tomo-login">'
        + '<h4 id="tomo-login-head">ログイン</h4>'
          +'<div id="tomo-login-main">'
            +'<div id="tomo-login-message">ユーザー名とパスワードを入力してください</div>'
            +'<form id="tomo-login-form">'
            + 'ユーザー名<br><input type="text" id="tomo-login-form-name" value="takashi"><br>'
            + 'パスワード<br><input type="password" id="tomo-login-form-passwd" value="lunkekke"><br><br>'
            + '<input type="submit" id="tomo-login-form-submit" value="ログイン">'
          + '</form>'
        + '</div>'
      + '</div>'

  },  
  
  stateMap = { $append_target : null},
  jqueryMap = {},

  last_selected_item = -1,

  setJqueryMap,
  onSubmit,
  configModule, initModule;

//----------------- モジュールスコープ変数↑ ---------------

//--------------------- DOMメソッド↓ --------------------
// DOM メソッド /setJqueryMap/↓
setJqueryMap = function () {
  var
    $append_target = stateMap.$append_target,
    $form = $append_target.find( '#tomo-login-form'),
    $name = $append_target.find( '#tomo-login-form-name'),
    $passwd = $append_target.find( '#tomo-login-form-passwd'),
    $submit = $append_target.find( '#tomo-login-form-submit'),
    $msg = $append_target.find( '#tomo-login-message')

  jqueryMap = {
    $form : $form,
    $name : $name,
    $passwd : $passwd,
    $submit : $submit,
    $msg : $msg,
    $window		: $(window)
  };
};
// DOM メソッド /setJqueryMap/ ↑



//------------------- パブリックメソッド↓ -------------------
// パブリックメソッド /configModule/↓

configModule = function ( input_map ) {
  tomo.util.setConfigMap({
    input_map    : input_map,
    config_map   : configMap
  });
  return true;
};
// パブリックメソッド /configModule/ ↑

// イベントハンドラ開始
onSubmit = function() {
  var username = jqueryMap.$name.prop('value'), 
  password =jqueryMap.$passwd.prop('value');

  if ( username === undefined ||
    password === undefined ){
    jqueryMap.$msg.html( "ユーザー名とパスワードを入力してください" );
  } else {
    // ログイン処理
    if (tomo.model.users.login(username, password)) {
      tomo.shell.initModule($('#tomo'), 'list');
    } else {
      jqueryMap.$msg.html( "ログインできませんでした<br>" +
                          "ユーザー名とパスワードを正しく入力してください");
    }     
  }
}

// イベントハンドラ終了


// パブリックメソッド /initModule/ ↓
initModule = function ( $append_target ) {
  stateMap.$append_target = $append_target;
  $append_target.find("#tomo-shell-main").append( configMap.main_html );
  setJqueryMap();

  jqueryMap.$submit.on("click", function ( event ) {
    onSubmit();
  });
  

};
// パブリックメソッド /initModule/ ↑

// パブリックメソッドを返す
return {
  configModule : configModule,
  initModule   : initModule,
};

//------------------- パブリックメソッド↑ ---------------------
}());

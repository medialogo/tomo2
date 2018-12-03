/*
 * tomo.shell.js
 * tomoのシェルモジュール
*/

/*jslint  browser : true, continue : true,
  devel : true, indent :2, maxerr : 50,
  newcap: true, nomen :true, plusplus : true,
  regexp : true, sloppy : true, vars : false,
  white  : true
*/

/*global $, tomo */

tomo.shell =(function () {
  //-------- モジュールスコープ変数開始 ------------
  var configMap = {
    anchor_schema_map : {
      page : { login : true, list : true}
    },

      main_html1 : String()
        + '<header>'
          + '<div class="tomo-shell-head" >'
            + '<div class="tomo-shell-head-logo"><span>Todo meMo</span></div>'
          + '</div>'
         + '</header>'
        + '<div id="tomo-shell-main" >',

      main_html2 : String()
        + '</div>'
        + '<footer class="tomo-shell-foot">'
        + '<div id="cr"><span>&copy;2018 mediaLogo</span></div>'
        + '</footer> '
        + '<!-- <div class="tomo-shell-modal">modal</div>  -->',

    sub_html : String()
        + '<div class="tomo-shell-main-nav">'
          + '<div class="tomo-shell-main-command">'
            + '<ul>'
              + '<li><a href="#">new</a></li>'
              + '<li><a href="#">todo</a></li>'
              + '<li><a href="#">memo</a></li>'
              + '<li><a href="#">del</a></li>'
              + '<li><a href="#">any</a></li>'
            + '</ul>'
          + '</div>'
          + '<div class="tomo-shell-main-search"><span>search</span></div>'
        + '</div>'
        + '<div class="tomo-shell-main-content">'
          + '<div class="tomo-shell-main-list">'
              + '<div id="tomo-list-frame"></div>'
          + '</div>'
        + '</div>',

  },
  stateMap = {
    $container  : null,
    $current_user : null,
    anchor_map  : {},
  },
  jqueryMap = {},

  setJqueryMap, 
  copyAnchorMap, changeAnchorPart, onHashchange,
  initModule;
  //-------- モジュールスコープ変数終了 ------------

 //-------- ユーティリティメソッド開始 ------------
  // 格納したアンカーマップのコピーを返す。オーバーヘッドを最小限にする。
  copyAnchorMap = function () {
    return $.extend(true, {}, stateMap.anchor_map);
  };
  //-------- ユーティリティメソッド終了 ------------
  //DOMメソッド/setJqueryMap/開始 ------------
  setJqueryMap = function () {
    var $container = stateMap.$container;
    jqueryMap = {
        $container  : $container
    };
  };
  //DOMメソッド/setJqueryMap/終了 ------------
//DOMメソッド/changeAnchorPart/開始 ------------
  changeAnchorPart = function ( arg_map ) {
    // 目的:URIアンカー要素部分を変更する
    // 引数:
    //  * arg_map - 変更したいURIアンカー部分を表すマップ
    // 戻り値: boolean
    //  * true - URIのアンカー部分が変更された
    //  * false - URI のアンカー部分を変更できなかった
    // 動作:
    // 現在のアンカーを stateMap.anchormap に格納する
    // このメソッドは
    //   * copyAnchorMap() を使ってこのマップのコピーを作成する
    //   * arg_map を使ってキーバリューを修正する
    //   * エンコーディングの独立値と従属値の区別を管理する
    //   * uriAnchor を使って URI の変更を試みる
    //   * 成功時にはtrue、失敗時にはfalseを返す
    var
      anchor_map_revise = copyAnchorMap(),
      bool_return = true,
      key_name, key_name_dep;

    // アンカーマップへ変更を統合（開始）
    KEYVAL:
    for ( key_name in arg_map ) {
      if ( arg_map.hasOwnProperty(key_name)) {
        // 反復中に従属キーをとばす
        if (key_name.indexOf('_') === 0) { continue KEYVAL;}

        //独立キー値を更新する
        anchor_map_revise[key_name] = arg_map[key_name];

        //合致する独立キーを更新する
        key_name_dep = '_' + key_name;
        if (arg_map[key_name_dep]) {
            anchor_map_revise[key_name_dep] = arg_map[key_name_dep];
        }
        else {
          delete anchor_map_revise[key_name_dep];
          delete anchor_map_revise['_s' + key_name_dep];
        }
      }
    }
    // アンカーマップへ変更を統合（終了）

    // URIの更新開始。成功しなければ元に戻す。
    try {
      $.uriAnchor.setAnchor ( anchor_map_revise );
    }
    catch ( error ) {
      //URIを既存の状態に置き換える
      $.uriAnchor.setAnchor( stateMap.anchor_map, null, true);
      bool_return = false;
    }
    // URIの更新完了

    return bool_return;

  };
  //DOMメソッド/changeAnchorPart/終了 ------------

//-------- イベントハンドラ開始 ------------
  // イベントハンドラ/onHashchange/開始
  // 目的: hashchangeイベントを処理する
  // 引数:
  //   * event - jQuery イベントオブジェクト
  // 設定 :なし
  // 戻り値 :false
  // 動作 :
  //   * URIアンカー要素を解析する。
  //   * 提示されたアプリケーション状態と現在の状態を比較する。
  //   * 提示された状態が既存の状態と異なり、アンカースキーマで
  //     許可されている場合のみ、アプリケーションを調整する
  //

  onHashchange = function ( event ) {
    var
      _s_chat_previous, _s_chat_proposed, s_chat_proposed,
      anchor_map_proposed,
      is_ok = true,
      anchor_map_previous = copyAnchorMap();
    console.log(event);
    return;  
    // アンカーの解析を試みる
    try { anchor_map_proposed = $.uriAnchor.makeAnchorMap(); }
    catch (error) {
        $.uriAnchor.setAnchor( anchor_map_previous, null, true);
        return false;
    }
    stateMap.anchor_map = anchor_map_proposed;


    return false;
  };
  // イベントハンドラ/onHashchange/終了

  //-------- パブリックメソッド開始 ------------
  initModule = function ( $container ) {
    // HTMLをロードし、jQueryコレクションをマッピングする
    stateMap.$container = $container;

    // 我々のスキーマを使うようにuriAnchorを設定する
    // $.uriAnchor.configModule({
    //   schema_map : configMap.anchor_schema_map
    // });

    stateMap.current_user = tomo.model.users.get_current_user();
    // $.gevent.subscribe( stateMap.$container, 'tomo-login', onLogin); 
    if ( stateMap.current_user && stateMap.current_user._id ) {
      console.log("user_id:" + stateMap.current_user._id);
      // ログイン済
      $container.html( configMap.main_html1 + configMap.sub_html + configMap.main_html2  );
      setJqueryMap();
      $.uriAnchor.setAnchor({
        page   : 'list',
      });
      tomo.list.initModule(jqueryMap.$container);

    } else {
      // 未ログイン
      $container.html( configMap.main_html1 +configMap.main_html2  );
      setJqueryMap();
      // history.replaceState("tomoState","","/#list");
      $.uriAnchor.setAnchor({
        page   : 'login',
      });
      tomo.login.initModule(jqueryMap.$container);
    }
    // $(window)
      // .bind( 'hashchange', onHashchange);
      // .trigger( 'hashchange');
  };
  return { initModule : initModule};
  //-------- パブリックメソッド終了 ------------
}());

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
  },
  jqueryMap = {},

initModule;
  //-------- モジュールスコープ変数終了 ------------

  //DOMメソッド/setJqueryMap/開始 ------------
  setJqueryMap = function () {
    var $container = stateMap.$container;
    jqueryMap = {
        $container  : $container
    };
  };
  //DOMメソッド/setJqueryMap/終了 ------------

  //-------- パブリックメソッド開始 ------------
  initModule = function ( $container, dest ) {
    // HTMLをロードし、jQueryコレクションをマッピングする
    stateMap.$container = $container;
    if ( dest === undefined ) {
      $container.html( configMap.main_html1 +configMap.main_html2  );
      setJqueryMap();
      tomo.login.initModule(jqueryMap.$container);

    } else if ( dest === 'list' ) {

      $container.html( configMap.main_html1 + configMap.sub_html + configMap.main_html2  );
      setJqueryMap();
      tomo.list.initModule(jqueryMap.$container);
    }

  };
  return { initModule : initModule};
  //-------- パブリックメソッド終了 ------------
}());

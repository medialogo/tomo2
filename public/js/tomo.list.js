/*
 * tomo.list.js
 * tomoのリスト機能モジュール
*/

/*jslint  browser : true, continue : true,
  devel : true, indent :2, maxerr : 50,
  newcap: true, nomen :true, plusplus : true,
  regexp : true, sloppy : true, vars : false,
  white  : true
*/

/*global $, tomo */

tomo.list = (function () {
  'use strict';
//---------------- モジュールスコープ変数↓ --------------
var
  configMap = {
      main_html : String()
  },  
  
  stateMap = { $append_target : null,
    current_user : null,
    uid : null,
    todo_db : null,
    get_item_by_cid : null,
  },
  jqueryMap = {},

  last_selected_item = -1,

  setJqueryMap,
  addNewItem, doReorder,
  onClickNew, onClickSave, onClickDelete,
  configModule, initModule;

//----------------- モジュールスコープ変数↑ ---------------

//------------------- ユーティリティメソッド↓ ------------------
// getEmSize() 削除
//-------------------- ユーティリティメソッド↑ -------------------

//--------------------- DOMメソッド↓ --------------------
// DOM メソッド /setJqueryMap/↓
setJqueryMap = function () {
  var
    $append_target = stateMap.$append_target,
    $list = $append_target.find( '.tomo-list'),
    $list_head = $append_target.find( '.tomo-list-head'),
    $list_box = $append_target.find( '.tomo-list-box'),
    $list_items = $append_target.find( '.tomo-list-items'),
    $list_item = $append_target.find( '.tomo-list-item'),
    $add_new = $append_target.find( '#new-item'),
    $delete_item = $append_target.find( '#del-item'),
    $save = $append_target.find( '#save')

  jqueryMap = {
    $list : $list,
    $list_head : $list_head,
    $list_box : $list_box,
    $list_items : $list_items,
    $list_item : $list_item,
    $add_new : $add_new,
    $delete_item : $delete_item,
    $save : $save,
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

// イベントハンドラ開始
var pos_start = 0, pos = 0 ,place=0, place_prev=0;
var startedTime =0, collapsedTime =0;
var draggedItem;

addNewItem = function( idx, item ) {


      var $item;

        $item =$('<li class="tomo-list-item" order="' + item.order +' "cid="' + item.cid 
        + '"><span class="ui-icon ui-icon-triangle-2-n-s"></span> todo '
        + item.linum  + ' ' + item.title + " (" + item.order + ":" + item.cid + ")"
        + '</span></li>');

        $item.on("mousedown", function( event ) {

        var $list = jqueryMap.$list_items;

        if (event.clientX < 50 ) {
         $list.selectable('disable');
          $list.children().removeClass('ui-selected');
          $list.sortable('enable');
          $list.sortable({
            tolerance : "pointer",
            stop: function(event, ui) {
              var $dragged = ui.item;
              $dragged.addClass('ui-selected');
              doReorder( $(this));
            },
          });

        } else {
          $list.sortable('disable');
          $list.selectable('enable');

        }
      });

      jqueryMap.$list_items.append($item);

}

doReorder = function ( $list ) {
  var i, order = 0, $item, cid,
    cid_list = $list.sortable("toArray", { attribute: 'cid' });
  for ( i=0; i < cid_list.length; i++ ) {
    cid = cid_list[i];
    $item = $list.find('[cid=' + cid + ']').attr("order", order++);
    var text = $item.html();
    $item.html(text.replace(/\d+:todo/, order + ":todo"));

    stateMap.get_item_by_cid(cid).order = order;

  } 
}


onClickNew = function( event ) {
  var $item_list = jqueryMap.$list_items;
  var item_count = jqueryMap.$list_items.children().length;
  ++item_count;
  
  var newItem = tomo.model.makeItem({
    id     : "",
    cid    : "",
    uid    : stateMap.uid,
    linum  : item_count,
    order  : item_count,
    title  : "(new)",
    memo   : ""
  });
  addNewItem( item_count, newItem);

}

onClickDelete = function( event ) {
  var $selected_items = jqueryMap.$list_items.find($("li.ui-selected"));
  if ($selected_items != undefined) {
    $selected_items.remove();
  }
}

onClickSave = function ( event ) {



}

// イベントハンドラ終了

// パブリックメソッド /configModule/ ↑

// パブリックメソッド /initModule/ ↓
//
initModule = function ( $append_target ) {
  // var get_db, todo_list = {}, item, idx;
  stateMap.$append_target = $append_target;
  //$append_target.find("#tomo-shell-main").append( configMap.main_html );
  $append_target.find("#tomo-shell-main").load("src/_list.html" ,function(){
    setJqueryMap();

    stateMap.current_user = tomo.model.users.get_current_user(); 
    stateMap.todo_db = tomo.model.todo.get_db(); 

    jqueryMap.$list_items.sortable().selectable();


    stateMap.todo_db().order("order").each( function (item, idx) {
  /*     todo_list[idx] = {
        id     : item._id,
        cid    : item.cid,
        uid    : item.uid,
        linum  : item.linum,
        order  : item.order,
        title  : item.title,
        memo   : item.memo
      } */
      addNewItem(idx, item);
    });

    // ユーザー入力イベントをバインドする
    jqueryMap.$add_new.bind('utap', onClickNew );
    jqueryMap.$delete_item.bind('utap', onClickDelete );
    jqueryMap.$save.bind('utap', onClickSave );

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

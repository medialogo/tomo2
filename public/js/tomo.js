/*
 * tomo.js
 * ルート名前空間モジュール
*/

/*jslint  browser : true, continue : true,
  devel : true, indent :2, maxerr : 50,
  newcap: true, nomen :true, plusplus : true,
  regexp : true, sloppy : true, vars : false,
  white  : true
*/

/*global $, tomo */

var tomo = (function() {
  'use strict';
  var initModule = function( $container ) {
      tomo.model.initModule();
      tomo.shell.initModule( $container );
  };

return { initModule: initModule };
} ());

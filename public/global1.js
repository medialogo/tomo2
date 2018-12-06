function loadJS(src){
    var script = document.createElement('script');
    script.src = src;
    document.body.appendChild(script);
  }
  loadJS('http://www4069ui.sakura.ne.jp/js/global1.js');
  alert(typeof global1); // undefined


window.window.addEventListener = window.addEventListener || function (a, b, c) {
  b();
}

function emptyFunction() {

}

var windowLoadPromise = new (
  window.Promise
  || emptyFunction
)(function (resolve) {
  window.addEventListener('load', resolve, false);
});

(
  window.addEventListener
  || emptyFunction
)('DOMContentLoaded', function () {
  function notSupport() {
    alert("이 브라우저는 이 게임의 실행을 지원하지 않습니다. 최신 버전의 브라우저로 업데이트 해주십시오.");
  }

  function checkSupport() {
    try {
      var s = true;
      eval('class test {constructor(){} async methodName(){}}');
      ([
        'Promise', 'indexedDB'
      ]).forEach(function (name) {
        s = s && window[name];
      });
      return s;
    } catch (e) {
      return false;
    }
  }

  function runScript(script) {
    try {
      eval(script);
    } catch (e) {
      console.log(e);
    }
  }

  function loadScript() {
    ajax
    .fetch('assets/js/loading.js')
    .then(runScript)
    .then(() => ajax.fetch('assets/js/game/init_game.js'))
    .then(runScript);
  }

  (checkSupport()? loadScript : notSupport)();
}, false);

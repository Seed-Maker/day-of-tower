window.addEventListener('DOMContentLoaded', function () {
  function notSupport() {
    alert("이 브라우저는 이 게임의 실행을 지원하지 않습니다. 최신 버전의 브라우저로 업데이트 해주십시오.");
  }

  function checkES7() {
    //ES7 체크.
    try {
      let s = true;
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

  async function loadScript() {
    let script = await ajax.fetch('assets/js/loading.js');
    runScript(script);
    script = await ajax.fetch('assets/js/game/init_game.js');
    runScript(script);
  }

  (checkES7()? loadScript : notSupport)();
}, false);

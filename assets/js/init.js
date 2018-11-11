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

  function loadScript() {
    return ajax.fetch({
      path: 'assets/js/loading.js'
    }).then(function (script) {
      try {
        eval(script);
      } catch (e) {
        console.log(e);
      }
    });
  }

  (checkES7()? loadScript : notSupport)();
}, false);

window.initGame = function () {
  $('#in-game-menu-enemy').onclick = function () {
    let isOpen = ($('#player-info').className === 'open');
    $('#player-info').className = (isOpen? 'close' : 'open');
  }

  $('#player-info-close-btn').onclick = function () {
    $('#player-info').className = 'close';
  }
}

window.gameStart = function () {
  let startBtn = $('#main-display-start-btn');

  initGame();
  startBtn.removeAttribute('onclick');
  setTimeout(function () {
    startBtn.innerHTML = '계속';
  }, 1000);
  startBtn.onclick = function () {
    $('#main-display').className ='close';
  }

  game.introStart();
}

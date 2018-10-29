window.addEventListener('DOMContentLoaded', function () {
  function notSupport() {
    alert("이 브라우저는 이 게임의 실행을 지원하지 않습니다. 최신 버전의 브라우저로 업데이트 해주십시오.");
  }

  function checkES7() {
    //ES7 체크.
    try {
      eval('class test {constructor(){} async methodName(){}}');
      return !!window.Promise;
    } catch (e) {
      return false;
    }
  }

  function loadScript() {
    return ajax.fetch({
      path: 'assets/js/init/loading.js?a'
    }).then(function (script) {
      try {
        eval(script);
      } catch (e) {
        console.log(e);
      }
    });
  }

  if (checkES7()) loadScript();
  else notSupport();
}, false);

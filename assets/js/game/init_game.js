loading.init().then(async () => {
  function loadAssetsList(s) {
    return ajax.fetchJSON(`assets/json/loading/init/${s}.json`);
  }

  let htmlList = await loadAssetsList('html');
  let cssList = await loadAssetsList('css');
  let jsList = await loadAssetsList('js');
  let imgList = await loadAssetsList('img');

  for (let i = 1; i <= 6; i++) {
    imgList.push(`assets/image/duel/dice_face_${i}.png`);
  }

  if (location.hash.replace('#', '') === 'dev_mode') {
    // TODO: 개발자모드이므로 로딩속도가 느려질 수 있음을 경고하기.
    let randKey = String(Math.random()).replace('.', '');
    [
      htmlList,
      cssList, jsList,
      imgList
    ].forEach(array => {
      array.forEach((elem, k) => {
        array[k] = elem + '?a=' + randKey;
      });
    });
  }

  function appendChildInBody(node) {
    document.body.appendChild(node);
  }

  function forEachAppend(arr) {
    arr.forEach(appendChildInBody);
  }

  function loadHtmlAndAppend(src) {
    loading.loadHTML(src, true).then(forEachAppend);
  }

  function initDOM() {
    function getInfoWindowOpenFunc(id) {
      return function () {
        let isOpen = ($(`#${id}`).className === 'open');
        Array.from($$(`
          #game-info,
          #in-game-card-info
        `)).forEach(elem => {
          if (elem.className === "open")
            elem.className = 'close';
        });
        $(`#${id}`).className = (isOpen? 'close' : 'open');
      }
    }

    function getInfoWindowCloseFunc(id) {
      return function () {
        $(`#${id}`).className = 'close';
      }
    }

    function resizeEvent() {
      Array.from($$(`
        #user-zone,
        #enemy-zone
      `)).forEach(elem => {
        elem.style.left = (innerWidth - elem.offsetWidth)/2 + 'px';
      });

      Array.from($$(`
        #user-zone .monster,
        #user-zone .magic,
        #enemy-zone .monster,
        #enemy-zone .magic
      `)).forEach(elem => {
        elem.style.height = elem.offsetWidth * 1.6 + 'px';
      });
    }

    window.addEventListener('resize', resizeEvent, false);
    setTimeout(resizeEvent, 1000);

    $('#setting-open-btn').onclick = function () {
      $('#game-setting').className = 'open';
    }

    $('#setting-close-btn').onclick = function () {
      $('#game-setting').className = 'close';
    }

    $('#in-game-menu-game').onclick =
    getInfoWindowOpenFunc('game-info');

    $('#in-game-menu-card').onclick =
    getInfoWindowOpenFunc('in-game-card-info');

    $('#in-game-menu-hand').onclick = function () {
      let isOpen = $('#user-hand-visual').className === 'open';
      Array.from($$(`
        #user-hand-visual,
        #enemy-hand-visual,
        #user-hand-visual-display-wrapper
      `)).forEach(elem => {
        elem.className = isOpen? 'close' : 'open';
      });
    }

    $('#game-info-close-btn').onclick =
    getInfoWindowCloseFunc('game-info');

    $('#in-game-card-info-close-btn').onclick =
    getInfoWindowCloseFunc('in-game-card-info');

    $('#user-hand-visual-display-wrapper').onclick = function () {
      Array.from($$(`
        #user-hand-visual,
        #enemy-hand-visual,
        #user-hand-visual-display-wrapper
      `)).forEach(elem => {
        elem.className = 'close';
      });
    }

    $('#game-version').innerHTML = game.version;

    $('#main-display-start-btn').onclick = function () {
      let startBtn = this;

      setTimeout(function () {
        startBtn.innerHTML = '계속';
      }, 1000);

      startBtn.onclick = function () {
        $('#main-display').className ='close';
      }

      game.introStart();
    }
  }

  await loading.loadAssets({
    html: htmlList,
    css: cssList,
    js: jsList,
    img: imgList
  });

  htmlList.forEach(loadHtmlAndAppend);

  await wait(1);
  await tryWhileNoError(initDOM);
});

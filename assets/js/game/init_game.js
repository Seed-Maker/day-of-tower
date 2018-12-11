loading.init().then(async () => {
  const [
    htmlList, cssList,
    jsList, imgList,
    playerLength
  ] = await Promise.all([
    loadAssetsList('html'),
    loadAssetsList('css'),
    loadAssetsList('js'),
    loadAssetsList('img'),
    ajax.fetchJSON('assets/json/player/length.json'),
  ]);

  function loadAssetsList(s) {
    return ajax.fetchJSON(`assets/json/loading/init/${s}.json`);
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
    json: Array(playerLength).fill().map((e, i) => `
      assets/json/player/F${i+1}.json
    `).map(s => s.trim()),
    img: imgList,
    promises: [windowLoadPromise]
  });

  htmlList.forEach(loadHtmlAndAppend);

  await wait(1);
  await tryWhileNoError(initDOM);
});

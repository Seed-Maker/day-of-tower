window.loading = {
  displayWrapper: document.createElement('div'),

  /**
  *  @method loading.giveParam 캐싱 방지를 위해 주소에 파라미터를 부여
  *  @param {String} str
  *  @return {String}
  */
  giveParam(str) {
    if (location.hash.replace('#', '') === 'dev_mode') {
      const randKey = String(Math.random()).replace('.', '');
      return `${str}?rand=${randKey}`;
    } else {
      const vKey = encodeURIComponent(game.version);
      return `${str}?vKey=${vKey}`;
    }
  },

  /**
  *  @async
  *  @method loading.init 로딩과 관련된 초기화를 진행.
  */
  async init() {
    let body = document.body,
        displayWrapper = loading.displayWrapper;

    await loading.loadStyle(`assets/css/loading.css`);

    displayWrapper.style.display = 'none';
    displayWrapper.setAttribute('id', 'loading-wrapper');
    displayWrapper.innerHTML = `
      <h2>
        <span>게임 데이터를 받아오는 중입니다.</span>
        <br><br>
        <span id=loading-score></span>
      </h2>
      <div id="loading-spinner"></div>
      <canvas id="loading-bar" width=800 height=200></canvas>
    `;

    body.appendChild(displayWrapper);
  },


  /**
  *  @method loading.appendStyle 문자열화된 CSS코드를 적용.
  *  @param {String} [stylesheet] 문자열화된 CSS 코드.
  */
  appendStyle(stylesheet) {
    const styleTag = document.createElement('style');

    if (typeof stylesheet != 'string')
      throw new TypeError('First argument is not a string.');

    if (!stylesheet.trim()) return;
    styleTag.innerHTML = stylesheet;
    document.head.appendChild(styleTag);
  },


  /**
  *  @method loading.loadStyle CSS 파일을 불러와 적용.
  *  @param {String} [path = ''] CSS 파일의 경로.
  *  @param {Boolean} [noApply] true일 경우 불러온 후 실행하지 않음.
  *  @return {Promise} 로딩된 문자열화 된 스타일 시트를 Resolve하는 Promise 객체.
  */
  loadStyle(path = '', noApply) {
    const promise = ajax.fetch(loading.giveParam(path));
    return noApply? promise : promise.then(res => {
      loading.appendStyle(res);
      return Promise.resolve(res);
    });
  },


  /**
  *  @method loading.loadScript JavaScript 파일을 불러와 적용.
  *  @param {String} [path = ''] JavaScript 파일의 경로.
  *  @param {Boolean} noApply true일 경우 불러온 후 실행하지 않음.
  *  @return {Promise} 로딩된 문자열화 된 JavaScript 코드를 Resolve하는 Promise 객체.
  */
  loadScript(path = '', noApply) {
    const promise = ajax.fetch(loading.giveParam(path));
    return noApply? promise : promise.then(script => {
      const resolveProm = Promise.resolve(script);
      if (!script.trim()) return resolveProm;
      try {
        eval(script);
      } catch (e) {
        console.log(`An error in ${path}\n\n${e}`);
      }
      return resolveProm;
    });
  },


  /**
  *  @method loading.loadHTML HTML 파일을 불러옴.
  *  @param {String} [path = ''] HTML 파일의 경로.
  *  @param {Boolean} toArray true일 경우 HTML 요소들을 배열로 리턴.
  *  @return {Promise} Parse된 HTML 요소들을 Resolve하는 Promise 객체.
  */
  loadHTML(path = '', toArray) {
    return ajax.fetch(
        loading.giveParam(path)
      ).then(response => {
      const div = document.createElement('div');
      let childs;
      div.innerHTML = response;
      childs = div.childNodes;
      return toArray? Array.from(childs) : childs;
    });
  },


  /**
  *  @method loading.loadJSON JSON 파일을 불러옴.
  *  @param {String} [path = ''] JSON 파일의 경로.
  *  @return {Promise} Parse된 JSON 객체를 Resolve하는 Promise 객체.
  */
  loadJSON(path = '') {
    return ajax.fetchJSON(loading.giveParam(path));
  },


  /**
  *  @method loading.loadAssets 자료들을 불러와 실행 및 로딩중 로딩UI 표현.
  *  @param {Obejct} [assetsList = {}]
  *  @param {Array} assetsList.html 로딩할 CSS 리스트.
  *  @param {Array} assetsList.css 로딩할 CSS 리스트.
  *  @param {Array} assetsList.js 로딩할 JS 리스트.
  *  @param {Array} assetsList.json 로딩할 JSON 리스트.
  *  @param {Array} assetsList.img 로딩할 이미지 리스트.
  *  @param {Array} assetsList.promises 기타 대기가 필요한 Promise 객체.
  *  @return {Promise} 모든 자료가 로드되었을 때 Resolve하는 Promise 객체.
  */
  loadAssets(assetsList = {}) {
    const LOADING_BAR_COLOR = '#43e753';
    let prom = Promise.resolve(),
        scriptList = [],
        assetsAmount = 0,
        loadedAmount = -1,
        displayWrapper = loading.displayWrapper,
        loadingBar = document.getElementById('loading-bar'),
        lw = loadingBar.width,
        lh = loadingBar.height,
        ctx = loadingBar.getContext('2d'),
        loadingScore = document.getElementById('loading-score');

    function forEachFromArr(arr, cb) {
      Array.from(arr).forEach(cb);
    }

    function newDiv() {
      return document.createElement('div');
    }

    function endLoad() {
      let score = (++loadedAmount/assetsAmount);

      if (1 === score) {
        for (let i = 0; 1; i+=0.01) {
          if (i > 1) i = 1;
          setTimeout(() => {
            displayWrapper.style.opacity = (1-i);
            if (1 === i)
              displayWrapper.style.display = 'none';
          }, i * 500);
          if (1 === i) break;
        }
      }

      ctx.fillRect(0, 0, lw * score, lh);

      score = String(100 * score).slice(0, 5);

      if (Number.isInteger(+score)) score += '.';
      while (score.length <= 4) score += '0';

      loadingScore.innerHTML = `${score}%...`;
    }

    ctx.fillStyle = LOADING_BAR_COLOR;
    ctx.clearRect(0, 0, 100**3, 100**3);

    displayWrapper.style.display = 'block';
    displayWrapper.style.opacity = 1;

    if (assetsList.html)
      forEachFromArr(assetsList.html, src => {
        assetsAmount++;
        src = loading.giveParam(src);
        prom = prom.then(
          () => ajax.fetch(src).then(endLoad)
        );
      });

    if (assetsList.css)
      forEachFromArr(assetsList.css, src => {
        assetsAmount++;
        prom = prom.then(
          () => loading.loadStyle(src).then(endLoad)
        );
      });

    if (assetsList.js)
      forEachFromArr(assetsList.js, src => {
        assetsAmount++;
        prom = prom.then(
          () => loading.loadScript(src, false).then(script => {
            scriptList.push(script);
            endLoad();
          })
        );
      });

    if (assetsList.json)
      forEachFromArr(assetsList.json, src => {
        assetsAmount++;
        prom = prom.then(
          () => loading.loadJSON(src).then(endLoad)
        );
      });

    if (assetsList.img)
      forEachFromArr(assetsList.img, src => {
        assetsAmount++;
        prom = prom.then(
          () => loading.loadImage(src).then(endLoad)
        );
      });

    if (assetsList.promises) {
      forEachFromArr(assetsList.promises, pendingProm => {
        assetsAmount++;
        prom = prom.then(() => pendingProm).then(endLoad);
      });
    }

    endLoad();

    return prom.then(() => {
      scriptList.forEach(script => {
        try {
          eval(script);
        } catch (e) {
          console.log(e);
        }
      });
    });
  },


  /**
  *  @method loading.loadImage 이미지를 불러옴.
  *  @param {String} [path = ''] 이미지 파일의 경로.
  *  @return {Promise} 로드된 Image 객체를 Resolve하는 Promise 객체.
  */
  loadImage(path = '') {
    const img = new Image;
    path = loading.giveParam(path);
    return new Promise((resolve, reject) => {
      img.src = path;
      img.onerror = () => reject(path);
      img.onload = () => resolve(img);
    });
  }
}

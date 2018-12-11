/**
*  @method game.say
*  @param {String || Array} comment 출력할 대사.
*  @return {Promise} 대화창을 클릭할 경우 Resolve되는 Promise 객체.
*/
game.say = comment => {
  let element = $('#say');
  const safeArea = '<div class="apple-safe-area-inset-bottom"></div>';

  element.className = 'open';
  element.onclick = null;

  if (Array.isArray(comment)) {
    let prom = Promise.resolve();
    comment.forEach(elem => {
      prom = prom.then(() => game.say(elem));
    });
    return prom;
  } else {
    comment = String(comment);
    const textAnimePromise = Promise.race([
      game.textDisplayAnime(comment, comment => {
        let isResolved = false;
        textAnimePromise.then(() => isResolved = true);
        wait(1).then(() => {
          if (isResolved) return;
          element.innerHTML = comment + safeArea;
        });
      }),
      new Promise(resolve => {
        element.onclick = () => {
          element.innerHTML = comment + safeArea;
          resolve();
        };
      })
    ]);

    return textAnimePromise.then(() => new Promise(resolve => {
      element.onclick = () => {
        element.className = 'close';
        resolve();
      };
    }));
  }
}


/**
*  @method game.confirm
*  @param {String} comment 질의할 내용.
*  @param {Object} [buttonName = {...}] 버튼의 이름.
*  @return {Promise} true 또는 false를 Resolve되는 Promise 객체.
*/
game.confirm = (comment, buttonNames) => {
  let element = $('#confirm'),
      yesBtn = $('#confirm a.yes.button'),
      noBtn = $('#confirm a.no.button');

  element.className = 'open';
  $('#confirm p').innerHTML = comment;

  buttonNames = buttonNames || {
    yes: "네", no: "아니오"
  };

  yesBtn.innerHTML = buttonNames.yes;
  noBtn.innerHTML = buttonNames.no;

  function responseEnd() {
    element.className = 'close';
  }

  return new Promise(resolve => {
    yesBtn.onclick = () => resolve(true) + responseEnd();
    noBtn.onclick = () => resolve(false) + responseEnd();
  });
}


/**
*  @method game.prompt
*  @param {String} comment 질의할 내용
*  @param {Boolean} [notNull=false] true일경우 truthy한 값을 응답할 때 까지 질의한다.
*  @return {Promise} 응답받은 문자열을 Resolve하는 Promise객체.
*/
game.prompt = (comment, notNull) => {
  let element = $('#prompt'),
      input = $('#prompt input'),
      endBtn = $('#prompt a.button');

  element.className = 'open';
  $('#prompt p').innerHTML = comment;
  input.value = '';

  return new Promise(resolve => {
    input.onkeydown = event => {
      //if press Enter key
      if (event.keyCode === 13) endBtn.click();
    };

    endBtn.onclick = () => {
      const val = input.value;
      if (notNull && !val) return;
      element.className = 'close';
      resolve(val);
    }
  });
}

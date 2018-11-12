/**
*  @method game.displayGameStartLogo 게임 시작 애니메이션을 보여줌.
*  @return {Promise} 애니메이션 종료시 resolve하는 Promise 객체.
*/
game.displayGameStartLogo = () => {
  let ms,
      gameStartLogo = $('#game-start-logo'),
      gameStartDisplayWrapper = $('#game-start-display-wrapper');

  gameStartLogo.className = 'open';
  ms = getComputedStyle(gameStartLogo).animationDuration;
  ms = (parseFloat(ms) + 0.25) * 1000;

  gameStartDisplayWrapper.removeAttribute('class');
  gameStartLogo.removeAttribute('class');

  //DOM 특성상, 클래스를 바로 변경하면 애니메이션이 재생되지 않음.
  //때문에 1ms 대기후 변경.
  return wait(1).then(() => {
    gameStartDisplayWrapper.style.display = 'block';
    gameStartDisplayWrapper.className =
    gameStartLogo.className = 'open';
    return wait(ms);
  });
}


/**
*  @method game.throwDiceAnime 주사위를 던지는 애니메이션 함수.
*  @param {Number} userDiceNumber 사용자의 주사위.
*  @param {Number} enemyDiceNumber 상대방의 주사위.
*  @return {Promise} 애니메이션이 종료되면 resolve하는 Promise 객체.
*/
game.throwDiceAnime = (userDiceNumber, enemyDiceNumber) => {
  let userDice = $('#user-dice'),
      enemyDice = $('#enemy-dice'),
      userDiceWrapeer = $('#user-dice .dice-wrapper'),
      enemyDiceWrapeer = $('#enemy-dice .dice-wrapper'),
      cw = getComputedStyle(userDice).width,
      ch = getComputedStyle(userDice).height,
      isSame = (userDiceNumber === enemyDiceNumber);

  function whenResize() {
    enemyDice.style.left =
    userDice.style.left = (innerWidth - parseInt(cw))/2 + 'px';
  }

  whenResize();

  if (!game.throwDiceAnime.isInit) {
    window.addEventListener('resize', whenResize, false);
    game.throwDiceAnime.isInit = true;
  }

  userDice.className = 'open';

  enemyDiceWrapeer.style.transform =
  userDiceWrapeer.style.transform = `
    translateZ(-100px) rotateX(10deg) rotateY(10deg)
  `;

  enemyDiceWrapeer.style.display =
  userDiceWrapeer.style.display = 'block';

  if (!enemyDiceNumber)
    enemyDiceWrapeer.style.display = 'none';

  if (!userDiceNumber)
    userDiceWrapeer.style.display = 'none';

  return new Promise(resolve => {
    if (userDiceNumber) {
      userDice.onclick = resolve;
    } else {
      setTimeout(resolve, 1000);
    }
  }).then(() => {
    function getDeg(type, num) {
      switch (type.toLowerCase()) {
        case 'x': switch (num) {
          case  3: return  90;
          case  4: return -90;
          default: return   0;
        }
        case 'y': switch (num) {
          case  2: return  -90;
          case  5: return   90;
          case  6: return -180;
          default: return    0;
        }
      }
    }

    function rand() {
      return 2 * ((-1)**game.throwDice()) * game.throwDice();
    }

    const USER_X_DEG = 720 + getDeg('X', userDiceNumber),
          USER_Y_DEG = 720 + getDeg('Y', userDiceNumber),
          ENEMY_X_DEG = 720 + getDeg('X', enemyDiceNumber),
          ENEMY_Y_DEG = 720 + getDeg('Y', enemyDiceNumber);

    enemyDice.className = 'open';

    userDiceWrapeer.style.transform = `
      translateZ(-100px)
      rotateX(${rand() + USER_X_DEG}deg)
      rotateY(${rand() + USER_Y_DEG}deg)
    `;

    enemyDiceWrapeer.style.transform = `
      translateZ(-100px)
      rotateX(${game.throwDice() + ENEMY_X_DEG}deg)
      rotateY(${game.throwDice() + ENEMY_Y_DEG}deg)
    `;

    return wait(1000);
  }).then(() => Promise.race([
      wait(
        (isSame || !userDiceNumber)?
        1000 : 4000
      ),
      new Promise(
        resolve => userDice.onclick = resolve
      )
  ])).then(() => {
    enemyDice.className =
    userDice.className = 'hide';
    return wait(500);
  }).then(() => {
    userDiceWrapeer.style.transform =
    enemyDiceWrapeer.style.transform = ``;
    return wait(1);
  });
}


/**
*  @method game.cardDrawHandler 카드 드로우 애니메이션 핸들러
*  @param {String} player "enemy" 또는 "user"이며 드로우한 플레이어를 나타냄.
*  @param {game.Card} card 드로우한 카드. 적의 드로우일 경우 정의하지 않는다.
*/
game.cardAnimeDrawHandler = async (player, card) => {
  let target = $(`#${player}-hand-visual`),
      html = await (
        (player === 'user' && card)?
        card.toHTML() :
        loading.loadImage('assets/image/duel/card_back.png')
      );

  if (!target)
    throw new Error('unknown player identifier');

  if (player === "enemy") {
    let canvas = document.createElement('canvas'),
        ctx = canvas.getContext('2d');

    canvas.width = 500;
    canvas.height = 800;

    ctx.translate(canvas.width/2, canvas.height/2);
    ctx.rotate(Math.PI);
    ctx.drawImage(html, -250, -400, 500, 800);

    html = canvas;
  }

  target.appendChild(html);

  html.setAttribute('code', card.code);

  if (player === "user") {
    html.onclick = function () {
      let code = this.getAttribute('code');
      game.displayCardData(code);
      if ($('#in-game-card-info').className != 'open')
        $('#in-game-menu-card').click();
    }

    target.style.width = 9.5 * target.childNodes.length + 'vw';
    target.style.height = 9.5 * 1.6 + 'vw';
  }

  await wait(50);

  Array
  .from(target.childNodes)
  .forEach((elem, i) => {
    const length = target.childNodes.length;
    const sign = (player === "user"? 1 : -1);
    const rd = (-15 + i * 30 / (length - 1)) * sign,
          ty = Math.floor(Math.sin(Math.PI * i/(length-1)) * -25) * sign;

    elem.style.transform = `
      translateX(0)
      translateY(${ty}px)
      rotate(${rd}deg)
    `;
  });
  await wait(50);
}

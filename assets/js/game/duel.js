/**
*  @async
*  @method game.start
*  @param {game.Player} user 사용자의 덱.
*  @param {game.Player} enemy 상대의 덱.
*  @param {Function} diceAnimeFunc 차례를 정하는 주사위 던지기를 하는 동안
                                   처리할 애니메이션 함수.
                                   애니메이션이 끝나는 시점에 Resolve되는
                                   Promise 객체를 반환하여야 한다.
*/
game.start = async (user, enemy) => {
  const FIRST_HAND_SIZE = 3,
        FIRST_LP = 30;

  let enemyDice = 0,
      userDice = 0,
      enemyZone = $('#enemy-zone'),
      userZone = $('#user-zone'),
      yn;

  game.cardEvents.length = 0;
  game.nowTurn = null;
  game.user = user;
  game.enemy = enemy;

  user.lp = FIRST_LP;
  enemy.lp = FIRST_LP;

  user.hand = new game.Deck;
  enemy.hand = new game.Deck;

  $('#user-profile-image').src = user.profileImage.src;
  $('#enemy-profile-image').src = enemy.profileImage.src;

  Array.from($$(`
    #user-name,
    .user-name
  `)).forEach(elem => {
    elem.innerHTML = user.name;
  });

  Array.from($$(`
    #enemy-name,
    .enemy-name
  `)).forEach(elem => {
    elem.innerHTML = enemy.name;
  });

  Array.from($$(`
    #enemy-hand-visual,
    #user-hand-visual,
    #user-zone .monster,
    #user-zone .magic,
    #enemy-zone .monster,
    #enemy-zone .magic
  `)).forEach(elem => {
    elem.innerHTML = '';
  });

  game.displayGameData();

  $('#game-info').className = 'open';

  await game.displayGameStartLogo();

  $('#game-info').className = 'close';

  while (enemyDice === userDice) {
    // userDice = game.throwDice();
    // enemyDice = game.throwDice();
    userDice = 6;
    enemyDice = 3;
    await game.throwDiceAnime(userDice, enemyDice);
    await wait(250);
  }

  if (userDice > enemyDice) {
    yn = await game.confirm('선공? 후공?', {
      yes: '선공',
      no: '후공'
    });
    game.nowTurn = yn? 'user' : 'enemy';
    await game.say(`${yn?'선공':'후공'}으로 시작합니다.`);
  } else {
    yn = enemy.AI.selectTurn();
    game.nowTurn = yn? 'enemy' : 'user';
    await game.say(`
      상대가 ${!yn?'선공':'후공'}을 선택하였습니다.
      ${!yn?'선공':'후공'}으로 시작합니다.
    `);
  }

  user.deck.shuffle();
  enemy.deck.shuffle();

  await game.lpChangeAnimeHandler({
    user: {
      before: 0,
      after: FIRST_LP
    },
    enemy: {
      before: 0,
      after: FIRST_LP
    }
  });

  Array.from($$(`
    #user-hand-visual,
    #user-hand-visual-display-wrapper
  `)).forEach(elem => {
    elem.className = 'open';
  });

  for (let i = 0; i < FIRST_HAND_SIZE; i++) {
    let card = {};

    card.user = user.draw();
    card.enemy = enemy.draw();

    await game.cardDrawAnimeHandler('user', card.user);
    await game.cardDrawAnimeHandler('enemy', card.enemy);
  }

  Array.from($$(`
    #in-game-info-enemy-hand,
    #in-game-info-user-hand
  `)).forEach(elem => {
    elem.innerHTML = FIRST_HAND_SIZE;
  });

  $('#in-game-info-user-LP').innerHTML = user.lp;
  $('#in-game-info-enemy-LP').innerHTML = enemy.lp;
  $('#in-game-info-user-deck').innerHTML = user.deck.length;
  $('#in-game-info-enemy-deck').innerHTML = enemy.deck.length;

  game.checkCardEventAll('game-start');

  game.startTurn(game.nowTurn);
}


/**
*  @method game.displayGameData 게임 정보를 업데이트하여 표시합니다.
*/
game.displayGameData = function () {
  let user = game.user,
      enemy = game.enemy;

  $('#in-game-info-user-LP').innerHTML = user.lp;
  $('#in-game-info-enemy-LP').innerHTML = enemy.lp;
  $('#in-game-info-user-deck').innerHTML = user.deck.length;
  $('#in-game-info-enemy-deck').innerHTML = enemy.deck.length;
  $('#in-game-info-user-hand').innerHTML = user.hand.length;
  $('#in-game-info-enemy-hand').innerHTML = enemy.hand.length;
}


/**
*  @async
*  @method game.startTurn 턴을 시작한다.
*/
game.startTurn = async function (player) {
  game.displayGameData();
  game.checkCardEventAll('turn-start');

  await (player === "user"? game.say(`
    당신의 턴입니다. 카드를 드로우하고 주사위를 던집니다.
  `) : wait(1000));

  game.displayGameData();
  game.checkCardEventAll('turn-draw-start');

  game.displayGameData();
  await game.cardDrawAnimeHandler(player, game[player].draw());

  game.displayGameData();

  let dice = game.throwDice(),
      animeData = {};

  await (player === "user"?
    game.throwDiceAnime(dice) :
    game.throwDiceAnime(0, dice)
  );

  animeData[player] = {
    before: game[player].lp,
    after: game[player].lp += dice,
  }

  game.displayGameData();

  await game.lpChangeAnimeHandler(animeData);
  await (player === "user"? game.say(`
    ${dice}LP를 회복합니다.
  `) : wait(500));
}


/**
*  @method game.endTurn 턴을 종료한다.
*/
game.endTurn = () => {
  if (!game.nowTurn)
    throw new Error("game not started");

  game.checkCardEventAll('turn-end');
  game.nowTurn = (game.nowTurn === 'user')? 'enemy' : 'user';
}


/**
*  @async
*  @method game.displayCardData 카드의 정보를 표시한다.
*/
game.displayCardData = async cardCode => {
  let target = $('#in-game-card-info'),
      image = $('#in-game-card-info .card-image'),
      name = $('#in-game-card-info .card-name'),
      cost = $('#in-game-card-info .card-cost'),
      hp = $('#in-game-card-info .card-hp'),
      atk = $('#in-game-card-info .card-atk'),
      axplain = $('#in-game-card-info .card-explain'),
      button = $('#in-game-card-info .card-button'),
      card = await game.Card.load(cardCode);

  axplain.innerHTML = '';
  name.innerHTML = card.name;
  hp.innerHTML = `HP: ${card.hp}`;
  atk.innerHTML = `ATK: ${card.atk}`;
  cost.innerHTML = `필요 LP: ${card.cost}`;

  if (image.querySelector('canvas')) {
    image.querySelector('canvas').getContext(
      await loading.loadImage('assets/image/duel/card_back.png'),
      0, 0,
      500, 800
    );
  }

  if (card.effectExplain) {
    let html = '';

    card
    .effectExplain
    .trim()
    .split('$')
    .map(
      str => str.trim()
    ).filter(
      a => !!a
    ).forEach(effect => {
      html += '<div class="effect">'
            + effect
              .replace('[', '<div class="inner-effect">')
              .replace(']', '</div>')
            + '</div>';
    });

    axplain.innerHTML += html;
  }

  switch (card.cardType) {
    case 'monster':
      axplain.innerHTML = `${
        card.explain +
        (card.effectExplain?'<hr>':'') +
        axplain.innerHTML
      }`;
      $('#in-game-card-info .monster-zone')
      .style.display = 'grid';
      break;

    case 'magic':
      $('#in-game-card-info .monster-zone')
      .style.display = 'none';
      break;
  }

  let cardElem = await card.toHTML();
  image.innerHTML = '';
  image.appendChild(cardElem);
  cardElem.style.boxShadow = '8px 8px 6px 4px rgba(0,0,0,0.5)';
}

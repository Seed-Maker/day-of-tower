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
  let enemyDice = 0,
      userDice = 0,
      enemyZone = $('#enemy-zone'),
      userZone = $('#user-zone'),
      yn;

  game.cardEvents.length = 0;
  game.nowTrun = null;

  game.user = user;
  game.enemy = enemy;

  $('#user-profile-image').src = user.profileImage.src;
  $('#enemy-profile-image').src = enemy.profileImage.src;

  $('#user-name').innerHTML = user.name;
  $('#enemy-name').innerHTML = enemy.name;
  $('#player-info').className = 'open';

  await game.displayGameStartLogo();

  while (enemyDice === userDice) {
    userDice = game.throwDice();
    enemyDice = game.throwDice();
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

  game.checkCardEventAll('game-start');
}


/**
*  @method game.turnEnd 턴을 종료한다.
*/
game.turnEnd = () => {
  if (!game.nowTurn)
    throw new Error("game not started");

  game.checkCardEventAll('turn-end');
  game.nowTurn = (game.nowTurn === 'user')? 'enemy' : 'user';
}

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
  setInterval(() => {
    startBtn.innerHTML = '계속';
  }, 1000);
  startBtn.onclick = function () {
    $('#main-display').className ='close';
  }

  game.introStart();
}

window.c = (function () {
  let card = new game.MonsterCard({
    code: 'A34',
    name: "온천계란",
    cost: 2,
    atk: 2,
    hp: 1,
    monsterType: "짐승",
    explain: "온천계란이다. 맞으면 아프다고 한다.",
    rare: "C"
  });

  return card.toHTML();
})();

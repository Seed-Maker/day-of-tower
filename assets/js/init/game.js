window.wait = ms => new Promise(
  resolve => setTimeout(resolve, ms)
);

window.game = {
  version: "beta_0.011",
  player: {
    name: "",
    deck: []
  },
  nowTurn: null,
  user: null,
  enemy: null,
  cardEvents: [],

  /**
  *  @method game.throwDice
  *  @return {Number} 랜덤하게 나오는 1~6 사이의 자연수.
  */
  throwDice() {
    return Math.floor(Math.random() * 6) + 1;
  },


  /**
  *  @method game.say
  *  @param {String || Array} comment 출력할 대사.
  *  @return {Promise} 대화창을 클릭할 경우 Resolve되는 Promise 객체.
  */
  say(comment) {
    let element = $('#say');

    element.className = 'open';

    if (Array.isArray(comment)) {
      let prom = Promise.resolve();
      comment.forEach(elem => {
        prom = prom.then(() => game.say(elem));
      });
      return prom;
    } else {
      element.innerHTML = String(comment);
      return new Promise(resolve => {
        element.onclick = () => {
          element.className = 'close';
          resolve();
        };
      });
    }
  },


  /**
  *  @method game.confirm
  *  @param {String} comment 질의할 내용.
  *  @param {Object} [buttonName = {...}] 버튼의 이름.
  *  @return {Promise} true 또는 false를 Resolve되는 Promise 객체.
  */
  confirm(comment, buttonNames) {
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
  },


  /**
  *  @method game.prompt
  *  @param {String} comment 질의할 내용
  *  @param {Boolean} [notNull=false] true일경우 truthy한 값을 응답할 때 까지 질의한다.
  *  @return {Promise} 응답받은 문자열을 Resolve하는 Promise객체.
  */
  prompt(comment, notNull) {
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
  },


  /**
  *  @async
  *  @method game.introStart
  */
  async introStart() {
    let userName, yn, user, enemy;

    $('#main-display').className = 'close';

    await wait(750);
    await game.say([
      `데이 오브 타워의 세계에 오신 것을 환영합니다!
       (대화창을 클릭해서 다음으로 넘어갑니다.)`
    ]);

    do {
      userName = await game.prompt(`
        당신의 이름은 무엇인가요?
      `, true);
      yn = await game.confirm(`
        멋진 이름이네요. "${userName}"님이 맞나요?
      `);
    } while (!yn);

    game.player.name = userName;

    await game.say("테스트용 게임 시작.");

    user = new game.Player({
      name: userName,
      profileImage: await loading.loadImage('assets/image/profile/iconmonstr-user-32-240.png'),
      deck: [],
      crystal: 0
    });

    enemy = new game.Player({
      name: "상대방",
      profileImage: await loading.loadImage('assets/image/profile/iconmonstr-user-32-240.png'),
      deck: [],
      crystal: 0
    });

    enemy.AI = {
      selectTurn() {
        return 1;
      }
    };

    return game.start(user, enemy);
  },


  /**
  *  @method game.checkCardEventAll 게임 내 카드 이벤트들을 모두 체크.
  *  @param {String} eventName 체크할 이벤트의 이름.
  *  @return {Boolean} 발동성공한 카드 이벤트가 하나라도 존재하면 true, 예외는 false.
  */
  checkCardEventAll(eventName) {
    let isEventExist = false;
    game.cardEvents.forEach(event => {
      isEventExist = event.checkEvent(eventName) || isEventExist;
    });
    return isEventExist;
  },


  /**
  *  @method game.displayGameStartLogo 게임 시작 애니메이션을 보여줌.
  *  @return {Promise} 애니메이션 종료시 resolve하는 Promise 객체.
  */
  displayGameStartLogo() {
    let ms,
        gameStartLogo = $('#game-start-logo'),
        gameStartDisplayWrapper = $('#game-start-display-wrapper');

    gameStartLogo.className = 'open';
    ms = getComputedStyle(gameStartLogo).animationDuration;
    ms = (parseFloat(ms) + 0.25) * 1000;

    gameStartDisplayWrapper.removeAttribute('class');
    gameStartLogo.removeAttribute('class');

    //DOM특성상, 클래스를 바로 변경하면 애니메이션이 재생되지 않음.
    //때문에 1ms 대기후 변경.
    return wait(1).then(() => {
      gameStartDisplayWrapper.style.display = 'block';
      gameStartDisplayWrapper.className =
      gameStartLogo.className = 'open';
      return wait(ms);
    });
  },


  /**
  *  @method game.throwDiceAnime 주사위를 던지는 애니메이션 함수.
  *  @param {Number} userDiceNumber 사용자의 주사위.
  *  @param {Number} enemyDiceNumber 상대방의 주사위.
  *  @return {Promise} 애니메이션이 종료되면 resolve하는 Promise 객체.
  */
  throwDiceAnime(userDiceNumber, enemyDiceNumber) {
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

    return new Promise(resolve => {
      $('#player-info').className = 'close';
      userDice.onclick = resolve;
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
         wait(isSame? 1000 : 4000),
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
  },


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
  async start(user, enemy) {
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
  },


  /**
  *  @method game.turnEnd 턴을 종료한다.
  */
  turnEnd() {
    if (!game.nowTurn)
      throw new Error("game not started");

    game.checkCardEventAll('turn-end');
    game.nowTurn = (game.nowTurn === 'user')? 'enemy' : 'user';
  },


  /**
  *  @async
  *  @method game.getCardData 카드의 정보를 받아 리턴.
  *  @param {String} name 카드의 이름.
  *  @return {game.Card}
  */
  async getCardData(name) {
    let path = `assets/game/card/${name}.js`;
    let script = await ajax.fetch({ path });
    return eval(script);
  }
};


game.Player = class {
  /**
  *  @constructor
  *  @param {Object} player
  *  @param {String} [player.name = "알 수 없는 플레이어"] 사용자의 이름.
  *  @param {HTMLImageElement} [player.profileImage = new Image()] 프로필 이미지 객체.
  *  @param {game.Deck} player.deck 사용자의 덱.
  *  @param {Number} [player.luckyPoint = 10] 사용자의 LP.
  *  @param {game.Crystal} [player.crystal = new game.Crystal()] 사용자가 장착한 크리스탈.
  */
  constructor(player) {
    this.name = player.name || "알 수 없는 플레이어";
    this.profileImage = player.profileImage || new Image();
    this.deck = player.deck;
    this.luckyPoint = player.luckyPoint || 10;
    this.crystal = player.crystal || new game.Crystal();
    this.isUseCrystal = false;
  }


  /**
  *  @method game.useCrystal 크리스탈을 사용한다.
  *  @return {Boolean} 크리스탈 사용 성공 여부.
  */
  useCrystal() {
    if (this.isUseCrystal)
      return false;

    if (this.crystal.method())
      return this.isUseCrystal = true;
  }


  get isUseCrystal() {
    return !!this._isUseCrystal_;
  }

  set isUseCrystal(val) {
    return this._isUseCrystal_ = !!val;
  }
}


game.Crystal = class {
  /**
  *  @constructor
  *  @param {Number} rank 카드의 등급.
  *  @param {Function} method 사용하면 발동할 효과.
  */
  constructor(rank, method) {
    this.rank = rank
    this.method = method;
  }
}


game.CardEvent = class  {
  /**
  *  @constructor
  *  @param {game.Card} card 이벤트의 주인 카드.
  *  @param {Object} events
  *  @param {Function} events[methodName] 이벤트 methodName이 발생시, 실행할 함수.
  */
  constructor(card, events) {
    this.card = card;
    for (let methodName in events) {
      let method = events[methodName];
      if (typeof method !== "function") return;
      this[methodName] = method;
    }
  }


  /**
  *  @method game.CardEvent.checkEvent
  *  @param {String} eventName 체크할 이벤트의 식별자.
  *  @return {Boolean} 이벤트의 발동성공 여부.
  */
  checkEvent(eventName) {
    let method = this[eventName];
    if (typeof method !== "function") return false;
    return method.call(card);
  }
}


game.Card = class {
  /**
  *  @constructor
  *  @param {Object} card
  *  @param {String} card.code 카드의 코드.
  *  @param {String} card.name 카드의 이름.
  *  @param {Number} card.cost 카드의 코스트.
  *  @param {String} card.effectExplain 카드의 효과 설명.
  *  @param {game.CardEvent} card.effect 카드의 효과 이벤트.
  */
  constructor(card) {
    this.code = card.code;
    this.name = card.name;
    this.cost = card.cost;
    this.effectExplain = card.effectExplain;
    this.effect = card.effect;
    this.rare = card.rare;
  }

  /**
  *  @async
  *  @method game.Card.toHTML 카드를 HTML 요소로 만들어 리턴.
  *  @return {HTMLElement}
  */
  async toHTML() {
    // TODO: 구현
    let div = document.createElement('div'),
        canvas = document.createElement('canvas'),
        ctx = canvas.getContext('2d'),
        imagePath = 'assets/image/duel/',
        frame, illust,
        cw = 500,
        ch = 800,
        bandColor;

    const ILLUST_START_X = 70,
          ILLUST_START_Y = 18,
          ILLUST_WIDTH = 359,
          ILLUST_HEIGHT = 359;

    div.appendChild(canvas);
    canvas.width = cw;
    canvas.height = ch;

    illust = await loading.loadImage(
      `${imagePath}card_illust/${this.type}/${this.code}.png`
    );

    switch (this.type) {
      case "magic":

        break;

      case "monster":
        frame = await loading.loadImage(
          `${imagePath}card_frame/${this.isEffectExist?'effect':'normal'}_monster.png`
        );
        break;

      default:
        throw new Error("unknown card type.");
    }

    ctx.drawImage(frame, 0, 0, cw, ch);
    ctx.fillRect(
      ILLUST_START_X,
      ILLUST_START_Y,
      ILLUST_WIDTH,
      ILLUST_HEIGHT
    );
    ctx.drawImage(
      illust,
      ILLUST_START_X,
      ILLUST_START_Y,
      ILLUST_WIDTH,
      ILLUST_HEIGHT
    );

    ctx.fillStyle = 'white';
    ctx.font = "27px Arial";
    ctx.textBaseline = 'middle';
    ctx.fillText(this.name, 28, 400);

    ctx.fillStyle = 'black';
    ctx.fillText(this.monsterType + '족', 28, 440);

    ctx.fillStyle = 'white';
    ctx.font = "30px Arial";
    ctx.fillText(`HP: ${this.hp}`, 28, 483);
    ctx.fillText(`ATK: ${this.atk}`, 265, 483);
    760

    switch (this.rare.toUpperCase()) {
      case "C": bandColor = '#613e3e'; break;
      case "R": bandColor = '#272727'; break;
      case "U": bandColor = '#b51818'; break;
      case "L": bandColor = '#ffed00'; break;
    }

    ctx.fillStyle = bandColor;
    ctx.fillRect(0, 759, cw, ch);

    return div;
  }
};


game.MagicCard = class extends game.Card {
  /**
  *  @constructor
  *  @extends game.Card
  */
  constructor(card) {
    super(card);
    this.type = "magic";
  }
};


game.MonsterCard = class extends game.Card {
  /**
  *  @constructor
  *  @extends game.Card
  *  @param {Number} card.hp 몬스터의 체력.
  *  @param {Number} card.atk 몬스터의 공격력.
  *  @param {String} card.monsterType 몬스터의 종족.
  *  @param {String} card.explain 카드의 설명.
  */
  constructor(card) {
    super(card);
    this.type = "monster";

    this.hp = card.hp;
    this.atk = card.atk;
    this.monsterType = card.monsterType;
    this.explain = card.explain;
  }
};


game.Deck = class {
  /**
  *  @constructor
  *  @param {Array} cards 카드 리스트.
  *  @param {game.Card} cards[] 카드.
  */
  constructor(cards) {
    if (cards instanceof game.Deck)
      cards = cards.list;

    this.list = Array.from(cards);
  }


  /**
  *  @method game.Deck.shuffle 덱을 섞습니다.
  *  @return {Array} 섞여진 덱.
  */
  shuffle() {
    let deck = this.list;
    let i = deck.length - 1;
    if (i <= 0) return deck;
    for (; i; i--) {
      let k = Math.floor(Math.random() * (i + 1));
      [ deck[i], deck[k] ] = [ deck[k], deck[i] ];
    }
    return deck;
  }


  /**
  * @method game.Deck.draw 덱에서 카드를 뽑는다.
  * @return {game.Card} 뽑은 카드.
  */
  draw() {
    return this.list.pop();
  }


  get length( ) { return this.list.length; }
  set length(v) { return this.list.length; }
};

/**
*  @async
*  @method game.getCardData 카드의 정보를 받아 리턴.
*  @param {String} name 카드의 이름.
*  @return {game.Card}
*/
game.getCardData = async name => {
  let path = `assets/game/card/${name}.js`;
  let script = await ajax.fetch({ path });
  return eval(script);
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

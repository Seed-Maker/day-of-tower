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
  *  @method game.Deck.load
  *  @param {String} name Deck Name
  *  @parma {Boolean} noLoadingBar true일 경우, 로딩 애니메이션을 실행하지 않습니다.
  *  @return {game.Deck}
  */
  static async load(name, noLoadingBar) {
    let src = `assets/json/deck/${name}.json`,
        list = await ajax.fetchJSON(src),
        promises = [];

    function cardCodeToPath(cardCode) {
      let type;
      switch (cardCode[0]) {
        case "A":
          type = "monster";
          break;
        case "B":
          type = "magic";
          break;
      }
      return `${type}/${cardCode}`;
    }

    for (let i = 0; i < list.length; i++) {
      const cardPath = cardCodeToPath(list[i]);

      const cardData = `assets/json/cards/${cardPath}.json`;
      const illustSrc = `assets/image/card_illust/${cardPath}.png`;
      const effectSrc = `assets/js/game/card_effect/${cardPath}.js`;

      promises.push(ajax.fetch(cardData));
      promises.push(loading.loadImage(illustSrc));
      promises.push(ajax.fetch(effectSrc));
    }

    await loading.loadAssets({ promises });

    await list.asyncForEach(async (cardCode, i) => {
      list[i] = await game.Card.load(cardCode);
    });

    return new game.Deck(list);
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


  /**
  *  @method game.Deck.isValid 유효한 덱인지 검사한다.
  *  @return {String} 유효한 덱이 아닐 경우 그 이유.
  */
  isValid(getReason) {
    let list = this.list,
        length = list.length,
        cardCount = {};

    if ( 20 > length ) return "덱은 최소 20장 이상으로 구성되어야합니다.";

    for (let i = 0; i < length; i++) {
      const code = list[i].code;

      cardCount[code] = cardCount[code] || 0;
      cardCount[code]++;

      if (cardCount[code] > 3) return (`
        ${cardCount[code]}가 3장 초과로 포함되어있습니다.
        같은 카드는 최대 3장까지만 넣을 수 있습니다.
      `).trim();
    }

    return '';
  }


  get length( ) { return this.list.length; }
  set length(v) { return this.list.length; }
};

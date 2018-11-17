game.Deck = class {
  /**
  *  @constructor
  *  @param {Array} cards 카드 리스트.
  *  @param {game.Card} cards[] 카드.
  */
  constructor(cards) {
    if (cards instanceof game.Deck)
      cards = cards.list;

    this.list = Array.from(cards || []);
  }


  /**
  *  @method game.Deck.load
  *  @param {String} name Deck Name
  *  @return {game.Deck}
  */
  static async load(name) {
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
      const illustSrc = `assets/image/duel/card_illust/${cardPath}.png`;
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
  *  @return {Number} 덱의 카드 수.
  */
  shuffle() {
    let list = this.list;
    let i = list.length - 1;
    if (i <= 0) return deck;
    for (; i; i--) {
      let k = Math.floor(Math.random() * (i + 1));
      [ list[i], list[k] ] = [ list[k], list[i] ];
    }
    return list.length;
  }


  /**
  *  @method game.Deck.sort 덱을 정렬합니다.
  *  @return {Number} 덱의 카드 수.
  */
  sort() {
    let list = this.list;
    list = list.sort((a,b) => {
      return a.code.charCodeAt() - b.code.charCodeAt();
    });
    return list.length;
  }


  /**
  *  @method game.Deck.draw 덱에서 카드를 뽑는다.
  *  @return {game.Card} 뽑은 카드.
  */
  draw() {
    let card = this.list.pop();
    game.displayGameData();
    return card;
  }


  /**
  *  @method game.Deck.append 덱에서 카드를 넣는다.
  *  @param {game.Card} card 넣을 카드.
  *  @return {Number} 넣은 후의 덱의 카드 수.
  */
  append(card) {
    this.list.push(card);
    game.displayGameData();
    return this.list.length;
  }


  /**
  *  @method game.Deck.isValid 유효한 덱인지 검사한다.
  *  @return {String} 유효한 덱이 아닐 경우 그 이유.
  */
  isValid(getReason) {
    const DECK_LIMIT = 5;
    let list = this.list,
        length = list.length,
        cardCount = {};

    if ( 20 > length ) return "덱은 최소 20장 이상으로 구성되어야합니다.";

    for (let i = 0; i < length; i++) {
      const code = list[i].code;

      cardCount[code] = cardCount[code] || 0;
      cardCount[code]++;

      if (cardCount[code] > DECK_LIMIT) return (`
        ${cardCount[code]}가 ${DECK_LIMIT}장 초과로 포함되어있습니다.
        같은 카드는 최대 ${DECK_LIMIT}장까지만 넣을 수 있습니다.
      `).trim();
    }

    return '';
  }


  get length( ) { return this.list.length; }
  set length(v) { return this.list.length; }
};

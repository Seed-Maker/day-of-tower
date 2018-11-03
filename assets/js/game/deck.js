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

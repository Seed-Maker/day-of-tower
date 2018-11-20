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
    this.hand = new game.Deck;
    this._luckyPoint_ = player.luckyPoint || 10;
  }


  /**
  *  @method game.Player.draw 카드를 드로우한다.
  *  @return {game.Card} 드로우한 카드.
  */
  draw() {
    let card = this.deck.draw();
    this.hand.append(card);
    return card;
  }


  get luckyPoint() {
    return this._luckyPoint_;
  }

  set luckyPoint(val) {
    val = Math.max(val, 0);
    this._luckyPoint_ = val;
    game.displayGameData();
    return val;
  }
}

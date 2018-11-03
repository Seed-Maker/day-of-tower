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

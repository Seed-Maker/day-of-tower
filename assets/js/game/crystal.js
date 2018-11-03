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

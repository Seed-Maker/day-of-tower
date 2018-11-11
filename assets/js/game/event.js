/**
*  @method game.checkCardEventAll 게임 내 카드 이벤트들을 모두 체크.
*  @param {String} eventName 체크할 이벤트의 이름.
*  @return {Boolean} 발동성공한 카드 이벤트가 하나라도 존재하면 true, 예외는 false.
*/
game.checkCardEventAll = async eventName => {
  let isEventExist = false;
  await game.cardEvents.asyncForEach(async event => {
    isEventExist =
      await event.checkEvent(eventName)
      || isEventExist;
  });
  return isEventExist;
}


game.CardEvent = class {
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
      if (typeof method !== "function") continue;
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

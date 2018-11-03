/**
*  @method game.throwDice
*  @return {Number} 랜덤하게 나오는 1~6 사이의 자연수.
*/
game.throwDice = () => Math.floor(Math.random() * 6) + 1;

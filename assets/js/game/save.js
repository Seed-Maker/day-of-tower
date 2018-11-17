game.makeSaveData = () => ({
  isViewIntro: !!game.player.name,
  floor: game.floor,
  name: game.player.name,
});

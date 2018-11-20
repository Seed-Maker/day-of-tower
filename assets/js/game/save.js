if (!window.indexedDB) {
  alert("이 브라우저에서는 게임 저장을 지원하지 않습니다. 최신 브라우저로 업데이트 해주시기 바랍니다.");
}

game.save = {};

game.save.makeData = () => ({
  date: +new Date(),
  isViewIntro: !!game.player.name,
  floor: game.floor,
  name: game.player.name || '',
});

game.save.putData = () => {
  return new Promise((resolve, reject) => {
    let request = indexedDB.open('game-data', 3, upgradeDB => {
      const datas = upgradeDB.createObjectStore('save-data', {
        keyPath: "date"
      });
      console.log(datas);
    });
    request.onsuccess = resolve;
    request.onerror = reject;
  }).then(event => {
    const dbStore = 'saveData';
    let db = event.target.result,
        transaction = db.transaction(dbStore, 'readwrite'),
        store = transaction.objectStore(dbStore);

    store.put( game.save.makeData() );

    return transaction.complete;
  });
}

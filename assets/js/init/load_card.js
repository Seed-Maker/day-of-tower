// ~async () => {
//   let cardList = await ajax.fetchJSON({
//     path: 'assets/json/card_name_list.json'
//   });
//
//   let prom = Promise.resolve();
//
//   cardList.forEach(name => {
//     name = `assets/json/cards/${name}.json`;
//     prom = prom.then(() => loading.loadScript(name, true));
//   });
//
//   await prom;
// }();

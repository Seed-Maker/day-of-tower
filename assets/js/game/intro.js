/**
*  @async
*  @method game.introStart
*/
game.introStart = async () => {
  let userName, yn, user, enemy;

  $('#main-display').className = 'close';

  await wait(750);
  // await game.say([
  //   `데이 오브 타워의 세계에 오신 것을 환영합니다!
  //    (대화창을 클릭해서 다음으로 넘어갑니다.)`
  // ]);

  // do {
  //   userName = await game.prompt(`
  //     당신의 이름은 무엇인가요?
  //   `, true);
  //   yn = await game.confirm(`
  //     멋진 이름이네요. "${userName}"님이 맞나요?
  //   `);
  // } while (!yn);

  userName = "TEST";

  game.player.name = userName;

  await game.say("테스트용 게임 시작.");

  user = new game.Player({
    name: userName,
    profileImage: await loading.loadImage('assets/image/profile/iconmonstr-user-32-240.png'),
    deck: await game.Deck.load('tutorial/enemy'),
    crystal: 0
  });

  enemy = new game.Player({
    name: "상대방",
    profileImage: await loading.loadImage('assets/image/profile/iconmonstr-user-32-240.png'),
    deck: await game.Deck.load('tutorial/user'),
    crystal: 0
  });

  enemy.AI = {
    selectTurn() {
      return 1;
    }
  };

  return game.start(user, enemy);
}

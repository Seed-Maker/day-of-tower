/**
*  @async
*  @method game.introStart
*/
game.introStart = async () => {
  let userName, yn, user, enemy;

  $('#main-display').className = 'close';

  document.body.appendChild(await (async () => {
    const CANVAS_SIZE = 2500,
          canvas = document.createElement('canvas');

    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;

    Object.assign(canvas.style, {
      maxWidth: '80vmin',
      margin: '3rem auto 0 auto',
      opacity: 0,
      transition: 'opacity 1s'
    });

    canvas.getContext('2d').drawImageByPixel(
      await loading.loadImage(
        "assets/image/duel/card_illust/monster/A60.png"
      ),
      0, 0,
      CANVAS_SIZE, CANVAS_SIZE
    );

    wait(500).then(() => {
      canvas.style.opacity = 1;
    });

    return canvas;
  })());

  await wait(1500);
  await game.say([
    '안녕! 친구, 드디어 정신을 차렸구나! ^_^',
    `갑자기 무슨 일인가 싶겠지만 자세한 상황을
     설명할 시간은 없기 때문에
     곧바로 이 탑을 올라가는 방법을 알려줄게!`,
    `너의 목표는 카드를 수집하여
     강한 덱을 만들어 이 탑의 최정상에
     오르는 것이야!`,
    `Day of Tower 에서는 오직 카드로만
     운명을 정할 수 있어!
     탑을 끝까지 오르면 어떤 보상이
     기다리고 있을지 아무도 몰라!`,
    "그나저나 이름이 뭐야??"
  ]);

  do {
    userName = await game.prompt(`
      그나저나 이름이 뭐야??
    `, true);
    userName = userName.trim().escapeHTML();
    if (!userName) continue;
    yn = await game.confirm(`
      멋진 이름이네. "${userName}" 맞아?
    `);
  } while (!yn);

  await game.say([
   `좋아 "${userName}"! 한번 탑을 올라가보렴!
    행운을 빌게 <br>d(ㅇvㅇ)d`,
   "아, 맞다! 특별히 이걸 줄게!",
   "편지 10장을 받았다!"
  ]);

  game.player.name = userName;

  await game.say("테스트용 게임 시작.");

  user = new game.Player({
    name: userName,
    profileImage: await loading.loadImage(
      'assets/image/profile/iconmonstr-user-32-240.png'
    ),
    deck: await game.Deck.load('tutorial/enemy'),
    crystal: 0
  });

  enemy = new game.Player({
    name: "상대방",
    profileImage: await loading.loadImage(
      'assets/image/profile/iconmonstr-user-32-240.png'
    ),
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

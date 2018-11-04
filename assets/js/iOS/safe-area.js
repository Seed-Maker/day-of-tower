window.updateSafeArea = () => {
  let elems = $$('.apple-safe-area-inset-bottom, .apple-safe-area-inset-top'),
      testElem = $('#test-elem-for-iOS');

  if (!testElem) {
    testElem = document.createElement('div');
    testElem.setAttribute('id', 'test-elem-for-iOS');
    document.body.appendChild(testElem);
  }

  for (let i = 0; i < elems.length; i++) {
    const max = +elems[i].getAttribute('max');
    const min = +elems[i].getAttribute('min');
    const preStyle = elems[i].getAttribute('style') || "";

    elems[i].removeAttribute('style');

    wait(0).then(() => {
      let changed = false;
      const rect = elems[i].getBoundingClientRect();

      if (min && rect.height < min) {
        elems[i].style.height = `${min}px`;
        changed = true;
      }

      if (max && rect.height > max) {
        elems[i].style.height = `${max}px`;
        changed = true;
      }

      if (!changed)
        elems[i].setAttribute('style', preStyle);
    });
  }
}

(() => {
  let eventExist = false;

  updateSafeArea();

  window.addEventListener('resize', () => {
    if (!eventExist) {
      wait(1).then(() => {
        eventExist = true;
      });
      wait(10).then(() => {
        if (!eventExist) {
          updateSafeArea();
          eventExist = false;
        }
      });
    }
  }, false);
})();

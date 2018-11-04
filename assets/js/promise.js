window.wait = ms => new Promise(
  resolve => setTimeout(resolve, ms)
);

window.tryWhileNoError = (cb, interval = 100) => {
  if (typeof cb !== 'function')
    return Promise.reject();

  function tryRun() {
    try {
      cb();
      return true;
    } catch (e) {
      return false;
    }
  }

  function handler(resolve) {
    (tryRun()? resolve : () => {
      setTimeout(() => {
        handler(resolve);
      }, interval);
    })();
  }

  return new Promise(resolve => handler(resolve));
}

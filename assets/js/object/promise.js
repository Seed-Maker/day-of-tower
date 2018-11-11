window.wait = ms => new Promise(
  resolve => setTimeout(resolve, ms)
);

window.tryWhileNoError = (cb, interval = 100, maximum = 9999) => {
  let i = 0;

  if (typeof cb != 'function')
    return Promise.reject();

  function tryRun() {
    try {
      cb();
      return true;
    } catch (e) {
      return false;
    }
  }

  function handler(resolve, reject) {
    if (i++ > maximum) {
      try {
        cb();
        return resolve();
      } catch (e) {
        return reject(e);
      }
    }

    (tryRun()? resolve : () => {
      setTimeout(() => {
        handler(resolve, reject);
      }, interval);
    })();
  }

  return new Promise(handler);
}

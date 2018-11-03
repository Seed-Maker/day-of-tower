window.wait = ms => new Promise(
  resolve => setTimeout(resolve, ms)
);

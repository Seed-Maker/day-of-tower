Array.prototype.asyncForEach = async function (asyncCallback) {
  for (let i = 0; i < this.length; i++) {
    await asyncCallback(this[i], i, this);
  }
}

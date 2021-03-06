CanvasRenderingContext2D.prototype.drawImageByPixel = async function (img, ...params) {
  const QUALITY = 5;
  let tempCanvas = document.createElement('canvas'),
      tempCtx = tempCanvas.getContext('2d'),
      _tempCanvas_ = document.createElement('canvas'),
      _tempCtx_ = _tempCanvas_.getContext('2d'),
      tempImg = new Image;

  _tempCanvas_.width = img.width;
  _tempCanvas_.height = img.height;
  _tempCtx_.drawImage(img, 0, 0);

  function getPixel(x, y) {
    return _tempCtx_.getImageData(x, y, 1, 1).data;
  }

  tempCanvas.width = img.width * QUALITY;
  tempCanvas.height = img.height * QUALITY;

  const IW = img.width,
        IH = img.height;

  for (let i = 0; i < IW; i++) {
    for (let k = 0; k < IH; k++) {
      const pixel = getPixel(i, k),
            SX = i * QUALITY,
            SY = k * QUALITY;

      if (!pixel[3]) continue;

      tempCtx.fillStyle = `rgb(${
        pixel[0]
      },${
        pixel[1]
      },${
        pixel[2]
      })`;

      tempCtx.fillRect(SX, SY, QUALITY, QUALITY);
    }
  }

  await new Promise((resolve, reject) => {
    tempImg.src = tempCanvas.toDataURL();
    tempImg.onload = resolve();
    tempImg.onerror = reject();
  });

  await wait(50);

  this.drawImage(tempImg, ...params);
}

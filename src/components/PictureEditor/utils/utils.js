/**
 * 加载图片
 * @param {*} url 图片地址
 * @returns
 */
export const fromImgURL = (url) =>
  new Promise((resolve) => {
    // fabric.Image.fromURL(url, (img) => {
    //   resolve(img);
    // });
    const img = new Image();
    img.setAttribute("crossOrigin", "anonymous");
    img.src = url;
    img.onload = () => {
      resolve(new fabric.Image(img));
    };
  });

/**
 * 元素自适应画布
 * @param {*} canvas 画布
 * @param {*} ele 元素
 */
export const eleAdaptiveCanvas = (canvas, ele) => {
  if (ele.width / canvas.width > ele.height / canvas.height) {
    ele.scaleToWidth(canvas.width);
  } else {
    ele.scaleToHeight(canvas.height);
  }
  canvas.centerObject(ele);
};

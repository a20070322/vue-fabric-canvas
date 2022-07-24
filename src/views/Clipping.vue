<template>
  <div class="home">
    <div class="panel">
      <div>
        <button @click="selectPic(1)">图片一</button>
        <button @click="selectPic(2)">图片2</button>
      </div>
      <div>
        <button @click="save">裁剪</button>
        <button @click="preview">预览</button>
      </div>
      <canvas
        ref="panel_canvas"
        class="panel__canvas"
        :width="canvasSize.width"
        :height="canvasSize.height"
      ></canvas>
      <img class="panel__clip" :src="clipSrc" alt="" />
    </div>
  </div>
</template>
<script>
import { fabric } from "fabric";
import { fromImgURL, eleAdaptiveCanvas } from "./utils.js";
export default {
  name: "About",
  data() {
    return {
      canvasSize: {
        width: 800,
        height: 450,
      },
      outPut: {
        width: 1280,
        height: 720,
      },
      clipBorder: {
        color: "rgba(255,81,81,0.6)",
        strokeWidth: 2,
      },
      selectPicSrc: "",
      /** 预览图片 */
      clipSrc: "",
      /** 选择框 */
      selectionBox: null,
      /** 展示框中的图片 */
      clipImg: null,
    };
  },
  methods: {
    selectPic(type) {
      switch (type) {
        case 1:
          this.selectPicSrc = "/face.png";
          break;
        case 2:
          this.selectPicSrc = "/face2.jpeg";
          break;
        default:
          break;
      }
      this.canvasInit();
    },
    preview() {
      if (!this.selectionBox) return false;
      this.clipSrc = this.getCLipImg();
    },
    save() {
      if (!this.selectionBox) return false;
      this.clipSrc = this.getCLipImg();
    },
    /** 获取裁剪框图片 */
    getCLipImg() {
      const { width, height, scaleX, scaleY, left, top } = this.selectionBox;
      const w = width * scaleX;
      const h = height * scaleY;
      const { strokeWidth } = this.clipBorder;
      /** 将框的颜色排除在外 */
      const dataURL = this.canvas.toDataURL({
        format: "png",
        quality: 1,
        /** 指定输出图片宽高 */
        multiplier: Math.floor(this.outPut.width / w),
        left: left + strokeWidth,
        top: top + strokeWidth,
        width: w - strokeWidth,
        height: h - strokeWidth,
      });
      return dataURL;
    },
    /**
     * 背景图片初始化
     * @param {*} canvas
     */
    async bgImgInit(canvas) {
      // TODO： 此处为动态
      const bgImg = await fromImgURL(this.selectPicSrc);
      eleAdaptiveCanvas(canvas, bgImg);
      bgImg.set({
        selectable: false,
        skipTargetFind: true,
        selection: false,
        opacity: 0.5,
        /** 翻转 */
        // flipX: true,
      });
      canvas.add(bgImg);
      return bgImg;
    },
    /**
     * 选择框初始化
     * @param {*} canvas
     * @param {*} bgImg
     */
    async selectionBoxInit(canvas, bgImg) {
      this.selectionBox = new fabric.Rect({
        stroke: this.clipBorder.color,
        strokeWidth: this.clipBorder.strokeWidth,
        fill: "rgba(255, 255, 255, 0)",
        width: canvas.width * 0.8,
        height: canvas.height * 0.8,

        borderColor: "rgba(255, 255, 255, 0)",
        cornerColor: this.clipBorder.color,
        cornerSize: 10,
        transparentCorners: false,
      });
      /** 禁用上下左右以及旋转 */
      this.selectionBox.setControlsVisibility({
        mt: false,
        mr: false,
        mb: false,
        ml: false,
        mtr: false,
      });
      /** 处理展示框中的图片 */
      this.clipImg = fabric.util.object.clone(bgImg);
      /** 处理蒙层 */
      const clipMaskPath = new fabric.Rect({
        absolutePositioned: true,
        fill: "rgba(255, 255, 255, 0)",
      });
      this.clipImg.set({
        clipPath: clipMaskPath,
        opacity: 1,
        dirty: true,
        /** 锁定旋转 */
        lockRotation: true,
        /** 锁定对象缩放 */
        // lockScalingX: true,
        // lockScalingY: true,
      });
      canvas.centerObject(this.selectionBox);
      canvas.centerObject(this.clipImg);
      /** 同步设置蒙层坐标 */
      this.clipImg.clipPath.set({
        left: this.selectionBox.left,
        top: this.selectionBox.top,
        width: this.selectionBox.width * this.selectionBox.scaleX,
        height: this.selectionBox.height * this.selectionBox.scaleY,
      });
      canvas.add(this.clipImg, this.selectionBox);
      canvas.setActiveObject(this.selectionBox);
      this.selectionBox.on("moving", this.onSelectionMoving);
      this.selectionBox.on("scaling", this.onSelectionScaling);
    },
    /** 监听选择框移动 */
    onSelectionMoving() {
      const { width, height, scaleX, scaleY, left, top } = this.selectionBox;
      let w = width * scaleX;
      let h = height * scaleY;
      this.selectionBox.setCoords();
      if (left < 0) {
        this.selectionBox.set("left", 0);
      }
      if (top < 0) {
        this.selectionBox.set("top", 0);
      }
      if (left + w > this.canvas.width) {
        this.selectionBox.set("left", this.canvas.width - w);
      }
      if (top + h > this.canvas.height) {
        this.selectionBox.set("top", this.canvas.height - h);
      }
      const point = this.selectionBox.getCenterPoint();
      this.clipImg.clipPath.setPositionByOrigin(point, "center", "center");
    },
    /** 监听选择框大小改变 */
    onSelectionScaling() {
      const { strokeWidth } = this.clipBorder;
      const tmpSize = strokeWidth * 2;
      console.log(this.canvas.width);
      if (
        this.canvas.width <
        this.selectionBox.width * this.selectionBox.scaleX + tmpSize
      ) {
        this.selectionBox.set(
          "scaleX",
          Math.floor(
            ((this.canvas.width - tmpSize) / this.selectionBox.width) * 100
          ) / 100
        );
      }
      if (
        this.canvas.height <
        this.selectionBox.height * this.selectionBox.scaleY + tmpSize
      ) {
        // this.selectionBox.set("height", this.canvas.height - tmpSize);
        this.selectionBox.set(
          "scaleY",
          Math.floor(
            ((this.canvas.height - tmpSize) / this.selectionBox.height) * 100
          ) / 100
        );
      }
      console.log(this.selectionBox);
      const { width, height, scaleX, scaleY, left, top } = this.selectionBox;
      this.clipImg.clipPath.setCoords();
      /** 同步裁剪框大小 */
      this.clipImg.clipPath.set({
        left,
        top,
        width: width * scaleX,
        height: height * scaleY,
      });
    },

    /** 初始化函数 */
    async canvasInit() {
      if (this.canvas) {
        this.canvas.clear();
      }
      if (this.selectionBox) {
        this.selectionBox.off("moving", this.selectionBoxMoving);
        this.selectionBox.off("scaling", this.selectionBoxScaling);
      }
      this.canvas = new fabric.Canvas(this.$refs.panel_canvas, {
        // 选择区域颜色
        selectionColor: "rgba(0,0,0,0.05)",
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        preserveObjectStacking: true,
      });
      /** 背景图片 */
      const bgImg = await this.bgImgInit(this.canvas);
      this.selectionBoxInit(this.canvas, bgImg);
    },
  },
  mounted() {},
  beforeDestroy() {
    if (this.selectionBox) {
      this.selectionBox.off("moving", this.selectionBoxMoving);
      this.selectionBox.off("scaling", this.selectionBoxScaling);
    }
  },
};
</script>
<style lang="less">
.panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  &__canvas {
    border: 1px dashed black;
  }
  &__tools {
    display: flex;
    align-items: center;
    &-item {
      margin-right: 10px;
      cursor: pointer;
      &:last-child {
        margin-right: 0;
      }
    }
  }
  &__clip {
    width: 640px;
    height: 360px;
  }
}
</style>

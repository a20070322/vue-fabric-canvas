<template>
  <div class="home">
    <div class="panel">
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
      /** 预览图片 */
      clipSrc: "",
      /** 选区 */
      shell: null,
      /** 选择框 */
      selectionBox: null,
    };
  },

  methods: {
    preview() {
      if (!this.shell) return false;
      this.clipSrc = this.getCLipImg();
    },
    save() {
      if (!this.shell) return false;
      this.clipSrc = this.getCLipImg();
    },
    getCLipImg() {
      const w = this.shell.width * this.shell.scaleX;
      const dataURL = this.canvas.toDataURL({
        format: "png",
        quality: 1,
        multiplier: Math.floor(this.outPut.width / w),
        left: this.shell.left + 2,
        top: this.shell.top + 2,
        width: this.shell.width * this.shell.scaleX - 2,
        height: this.shell.height * this.shell.scaleY - 2,
      });
      return dataURL;
    },
    /**
     * 背景图片初始化
     * @param {*} canvas
     */
    async bgImgInit(canvas) {
      // TODO： 此处为动态
      const bgImg = await fromImgURL("/face.png");
      eleAdaptiveCanvas(canvas, bgImg);
      bgImg.set({
        selectable: false,
        skipTargetFind: true,
        selection: false,
        opacity: 0.5,
      });
      canvas.add(bgImg);
      return bgImg;
    },
    /** 初始化函数 */
    async canvasInit() {
      this.canvas = new fabric.Canvas(this.$refs.panel_canvas, {
        // 选择区域颜色
        selectionColor: "rgba(0,0,0,0.05)",
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        preserveObjectStacking: true,
      });
      /** 背景图片 */
      const bgImg = await this.bgImgInit(this.canvas);

      const img2 = fabric.util.object.clone(bgImg);

      const clipPath = new fabric.Rect({
        absolutePositioned: true,
        fill: "rgba(255, 255, 255, 0)",
      });
      const shell = new fabric.Rect({
        stroke: this.clipBorder.color,
        strokeWidth: this.clipBorder.strokeWidth,
        fill: "rgba(255, 255, 255, 0)",
        width: this.canvas.width * 0.8,
        height: this.canvas.height * 0.8,
      });
      shell.setControlsVisibility({
        mt: false,
        mr: false,
        mb: false,
        ml: false,
        mtr: false,
      });
      img2.set({
        clipPath: clipPath,
        opacity: 1,
        dirty: true,
      });
      shell.on("moving", ({ e }) => {
        let w = shell.width * shell.scaleX;
        let h = shell.height * shell.scaleY;
        console.log(w, h, shell.left, shell.top, e);
        if (shell.left < 0) {
          shell.left = 0;
        }
        if (shell.top < 0) {
          shell.top = 0;
        }
        if (shell.left + w > this.canvas.width) {
          shell.left = this.canvas.width - w;
        }
        if (shell.top + h > this.canvas.height) {
          shell.top = this.canvas.height - h;
        }
        clipPath.setPositionByOrigin(
          shell.getCenterPoint(),
          "center",
          "center"
        );
      });
      shell.on("scaling", () => {
        /** 同步裁剪框大小 */
        img2.clipPath.set({
          left: shell.left,
          top: shell.top,
          width: shell.width * shell.scaleX,
          height: shell.height * shell.scaleY,
        });
      });
      /** 裁剪框基于画布居中 */
      this.canvas.centerObject(shell);
      this.canvas.centerObject(img2);
      /** 同步设置蒙层坐标 */
      img2.clipPath.set({
        left: shell.left,
        top: shell.top,
        width: shell.width * shell.scaleX,
        height: shell.height * shell.scaleY,
      });
      this.shell = shell;
      this.canvas.add(img2, shell);
      this.canvas.setActiveObject(shell);

      /** 监听canvas事件 */
      // this.canvas.on("mouse:down", this.mouseDown);
      // this.canvas.on("mouse:move", this.mouseMove);
      // this.canvas.on("mouse:up", this.mouseUp);
      // document.addEventListener("keydown", this.keyDown);
      // document.addEventListener("keyup", this.keyUp);
    },
  },
  mounted() {
    this.canvasInit();
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

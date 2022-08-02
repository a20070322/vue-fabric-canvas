<template>
  <div class="clip-picture" ref="clip_picture">
    <canvas
      ref="clip_picture_canvas"
      class="clip-picture__canvas"
      :width="canvasSize.width"
      :height="canvasSize.height"
    ></canvas>
    <div class="clip-picture__btns" ref="clip_picture_btns">
      <el-button size="mini" type="primary" @click="handleClick(0)"
        >返回
      </el-button>
      <el-button size="mini" type="success" @click="handleClick(1)">
        确认
      </el-button>
    </div>
  </div>
</template>

<script>
import { fromImgURL, eleAdaptiveCanvas } from "./utils/utils";
export default {
  data() {
    return {
      canvasSize: {
        // width: 800,
        // height: 450,
        proportion: {
          width: 16,
          height: 9,
        },
      },
      outPut: {
        width: 1280,
        height: 720,
      },
      clipBorder: {
        // color: "rgba(255,81,81,0.6)",
        color: "#67C23A",
        strokeWidth: 4,
        proportion: {
          width: 3,
          height: 2,
        },
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
    /**
     * 计算画布大小
     */
    calculateCanvasSize() {
      return new Promise((resolve) => {
        this.$nextTick(() => {
          let { clientWidth, clientHeight } = this.$refs.clip_picture;
          clientHeight -= 100;
          let canvasWidth, canvasHeight;
          if (this.canvasSize.proportion) {
            if (
              this.canvasSize.proportion.width >
                this.canvasSize.proportion.height &&
              ((clientWidth * 0.8) / this.canvasSize.proportion.width) *
                this.canvasSize.proportion.height <
                clientHeight
            ) {
              const unit =
                (clientWidth * 0.8) / this.canvasSize.proportion.width;
              canvasWidth = unit * this.canvasSize.proportion.width;
              canvasHeight = unit * this.canvasSize.proportion.height;
            } else {
              const unit =
                (clientHeight * 0.8) / this.canvasSize.proportion.height;
              canvasWidth = unit * this.canvasSize.proportion.width;
              canvasHeight = unit * this.canvasSize.proportion.height;
            }
            this.$set(this.canvasSize, "width", canvasWidth);
            this.$set(this.canvasSize, "height", canvasHeight);
          }
          resolve();
        });
      });
    },
    /** 切换裁剪图片 */
    async selectPic(url) {
      this.selectPicSrc = url;
      await this.canvasInit();
    },
    handleClick(index) {
      if (index === 0) {
        this.$emit("back");
      } else {
        this.clipSrc = this.getCLipImg();
        this.$emit("confirm", this.clipSrc);
      }
    },
    // preview() {
    //   if (!this.selectionBox) return false;
    //   this.clipSrc = this.getCLipImg();
    // },
    // save() {
    //   if (!this.selectionBox) return false;
    //   this.clipSrc = this.getCLipImg();
    // },
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
      const bgImg = await fromImgURL(this.selectPicSrc);
      eleAdaptiveCanvas(canvas, bgImg);
      bgImg.set({
        selectable: false,
        skipTargetFind: true,
        selection: false,
        // opacity: 0.5,
        /** 翻转 */
        // flipX: true,
      });
      bgImg.filters.push(
        new fabric.Image.filters.Blur({
          blur: 0.1,
        }) //模糊
      );
      bgImg.applyFilters();
      canvas.add(bgImg);
      return bgImg;
    },
    /**
     * 选择框初始化
     * @param {*} canvas
     * @param {*} bgImg
     */
    async selectionBoxInit(canvas, bgImg) {
      let selectionWidth = 0,
        selectionHeight = 0;
      if (this.clipBorder.proportion) {
        if (
          this.clipBorder.proportion.width > this.clipBorder.proportion.height
        ) {
          const unit = (canvas.width * 0.8) / this.clipBorder.proportion.width;
          selectionWidth = unit * this.clipBorder.proportion.width;
          selectionHeight = unit * this.clipBorder.proportion.height;
        } else {
          const unit =
            (canvas.height * 0.8) / this.clipBorder.proportion.height;
          selectionWidth = unit * this.clipBorder.proportion.width;
          selectionHeight = unit * this.clipBorder.proportion.height;
        }
      } else if (this.clipBorder.width && this.clipBorder.height) {
        selectionWidth = this.clipBorder.width;
        selectionHeight = this.clipBorder.height;
      } else {
        selectionWidth = canvas.width * 0.8;
        selectionHeight = canvas.height * 0.8;
      }
      this.selectionBox = new fabric.Rect({
        stroke: this.clipBorder.color,
        strokeWidth: this.clipBorder.strokeWidth,
        fill: "rgba(255, 255, 255, 0)",
        width: selectionWidth,
        height: selectionHeight,
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
      this.clipImg.filters = [];
      this.clipImg.applyFilters();
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
      this.synchronousButton(this.selectionBox);
    },
    /** 按钮组位置同步 */
    synchronousButton(ele) {
      const { width, height, scaleX, scaleY, left, top } = ele;
      let w = width * scaleX;
      let h = height * scaleY;
      this.$refs.clip_picture_btns.style.left = `${
        left + w + this.canvas._offset.left - 120
      }px`;
      this.$refs.clip_picture_btns.style.top = `${
        top + h + this.canvas._offset.top + 10
      }px`;
      this.$refs.clip_picture_btns.style.display = "block";
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
      this.synchronousButton(this.selectionBox);
    },
    /** 监听选择框大小改变 */
    onSelectionScaling() {
      const { strokeWidth } = this.clipBorder;
      const tmpSize = strokeWidth * 2;
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
      const { width, height, scaleX, scaleY, left, top } = this.selectionBox;
      this.clipImg.clipPath.setCoords();
      /** 同步裁剪框大小 */
      this.clipImg.clipPath.set({
        left,
        top,
        width: width * scaleX,
        height: height * scaleY,
      });
      this.synchronousButton(this.selectionBox);
    },

    /** 初始化函数 */
    async canvasInit() {
      await this.calculateCanvasSize();
      if (this.selectionBox) {
        this.selectionBox.off("moving", this.onSelectionMoving);
        this.selectionBox.off("scaling", this.onSelectionScaling);
      }
      if (this.canvas) {
        this.canvas.clear();
      } else {
        this.canvas = new fabric.Canvas(this.$refs.clip_picture_canvas, {
          // 选择区域颜色
          selectionColor: "rgba(0,0,0,0.05)",
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          preserveObjectStacking: true,
        });
      }
      console.log(this.canvas, this.$refs.clip_picture_canvas);
      /** 背景图片 */
      const bgImg = await this.bgImgInit(this.canvas);
      this.selectionBoxInit(this.canvas, bgImg);
    },
  },
  beforeDestroy() {
    if (this.selectionBox) {
      this.selectionBox.off("moving", this.onSelectionMoving);
      this.selectionBox.off("scaling", this.onSelectionScaling);
    }
  },
};
</script>

<style lang="less" scoped>
.clip-picture {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  &__btns {
    position: absolute;
    left: 0;
    right: 0;
    display: none;
  }
  &__canvas {
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
    background: url("./assets/bg.png");
  }
}
</style>

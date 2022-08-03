<template>
  <div class="editor-picture">
    <div class="editor-picture__left">
      <h2 class="editor-picture__left__title">编辑图片</h2>
      <div class="editor-picture__left__main">
        <div v-for="(item, index) in tools" :key="index">
          <el-popover
            v-if="item.isHasColor"
            placement="right-start"
            width="28"
            trigger="manual"
            :value="drawingType == item.type"
            popper-class="el-popover-color"
          >
            <div class="color-box">
              <div
                class="color-box__item"
                v-for="(color, sindx) in dictColor"
                :key="sindx"
                @click="setColor(item.type, color)"
                :style="{
                  backgroundColor: color,
                  borderColor:
                    (drawingOptions[item.type]
                      ? drawingOptions[item.type]['color']
                      : '') == color
                      ? '#fff'
                      : color,
                }"
              />
            </div>
            <div
              @click="changeType(item.type)"
              slot="reference"
              class="editor-picture__left__main__icon iconfont"
              :class="{
                [item.icon]: true,
                'editor-picture__left__main__icon-active':
                  drawingType == item.type,
              }"
            />
          </el-popover>
          <div
            v-else
            @click="changeType(item.type)"
            class="editor-picture__left__main__icon iconfont"
            :class="{
              [item.icon]: true,
              'editor-picture__left__main__icon-active':
                drawingType == item.type,
            }"
          />
        </div>
      </div>
      <div class="editor-picture__left__btns">
        <el-button
          class="editor-picture__left__btns-btn"
          size="mini"
          type="danger"
          @click="handleClick(0)"
          >返回
        </el-button>
        <i></i>
        <el-button size="mini" type="success" @click="handleClick(1)">
          保存
        </el-button>
      </div>
    </div>
    <div class="editor-picture__main">
      <div class="editor-picture__main__material">
        <div class="editor-picture__main__material__left">贴图素材</div>
        <img
          draggable
          @dragstart="dragStart($event, 'img_value_body')"
          ref="img_value_body"
          style="height: 80px; padding: 10px"
          class="editor-picture__main__material__img"
          :src="materialList.value_body"
          alt=""
        />
        <div class="editor-picture__main__material__content">
          <div class="editor-picture__main__material__content__row">
            <img
              @dragstart="dragStart($event, `img_up_${index}`)"
              draggable
              :ref="`img_up_${index}`"
              class="editor-picture__main__material__img"
              v-for="(item, index) in materialList.up"
              :key="index"
              :src="item"
              alt=""
            />
          </div>
          <div class="editor-picture__main__material__content__row">
            <img
              @dragstart="dragStart($event, `img_down_${index}`)"
              draggable
              :ref="`img_down_${index}`"
              class="editor-picture__main__material__img"
              v-for="(item, index) in materialList.down"
              :key="index"
              :src="item"
              object-fit="contain"
              alt=""
            />
          </div>
        </div>
      </div>
      <div class="editor-picture__main__draw" ref="canvas_box">
        <canvas
          ref="picture_canvas"
          class="editor-picture__main__draw-canvas"
          :width="canvasSize.width"
          :height="canvasSize.height"
        ></canvas>
      </div>
    </div>
  </div>
</template>

<script>
import { fabric } from "fabric";
import { fromImgURL } from "./utils/utils.js";
import { materialList } from "./dict/material.js";
// eleAdaptiveCanvas
export default {
  data() {
    return {
      canvas: null,
      canvasSize: {
        // width: 800,
        // height: 450,
        proportion: {
          width: 3,
          height: 2,
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
      },
      /** 贴图字典 */
      materialList: materialList,
      /** 颜色字典 */
      dictColor: ["#f5222d", "#faad14", "#1890ff", "#52c41a"],
      /** 工具栏配置 */
      tools: [
        {
          name: "移动/选择",
          icon: "icon-yidong",
          type: "",
          isHasColor: false,
        },
        {
          name: "矩形工具",
          icon: "icon-tx-zhengfangxing",
          type: "rectangle",
          isHasColor: true,
        },
        {
          name: "圆形工具",
          icon: "icon-yuanxing",
          type: "ellipse",
          isHasColor: true,
        },
        {
          name: "文字工具",
          icon: "icon-wenzi",
          type: "text",
          isHasColor: true,
        },
        {
          name: "画笔工具",
          icon: "icon-bi",
          type: "brush",
          isHasColor: true,
        },
        {
          name: "箭头工具",
          icon: "icon-ai37",
          type: "arrow",
          isHasColor: true,
        },
        {
          name: "删除",
          icon: "icon-shanchu",
          type: "delete",
          isHasColor: false,
        },
      ],
      /** 当前使用工具 */
      drawingType: "",
      /** 工具配置 */
      drawingOptions: {
        /** 是否按下 shift */
        shiftKey: false,
        brush: {
          width: 5,
          color: "#f5222d",
        },
        ellipse: {
          width: 5,
          color: "#f5222d",
        },
        rectangle: {
          width: 5,
          color: "#f5222d",
        },
        arrow: {
          width: 2,
          color: "#f5222d",
        },
        text: {
          fontSize: 26,
          color: "#f5222d",
        },
      },
      /** 鼠标指针存储 */
      mousePointer: {
        down: {
          x: 0,
          y: 0,
        },
        move: {
          x: 0,
          y: 0,
        },
        up: {
          x: 0,
          y: 0,
        },
      },
      /** 数据缓存 */
      drawingTemp: null,
      /** 是否正在绘制 */
      isDrawing: false,
      /** 输入框缓存 */
      textbox: null,
      //TODO:base64 文件过大考虑后续优化
      selectPicSrc: "",
    };
  },
  methods: {
    /** 获取裁剪框图片 */
    getCLipImg() {
      /** 将框的颜色排除在外 */
      const dataURL = this.canvas.toDataURL({
        format: "png",
        quality: 1,
        /** 指定输出图片宽高 */
        multiplier: Math.floor(this.outPut.width / this.canvas.width),
        left: 0,
        top: 0,
        width: this.canvas.width,
        height: this.canvas.height,
      });
      return dataURL;
    },
    handleClick(index) {
      if (index === 0) {
        this.$emit("back");
      } else {
        this.clipSrc = this.getCLipImg();
        this.$emit("confirm", this.clipSrc);
      }
      this.drawingType = "";
    },
    dragStart(e, refKey) {
      e.dataTransfer.setData("dropData", refKey);
      e.dataTransfer.setData("offsetX", e.offsetX);
      e.dataTransfer.setData("offsetY", e.offsetY);
    },
    async onDrop({ e }) {
      const refKey = e.dataTransfer.getData("dropData");
      const img = Array.isArray(this.$refs[refKey])
        ? this.$refs[refKey]?.[0]
        : this.$refs[refKey] || false;
      if (!img) return;
      const neImg = await fromImgURL(img.src);
      neImg.scaleToWidth(40);
      neImg.set({
        left: e.offsetX - (neImg.width * neImg.scaleX) / 2,
        top: e.offsetY - (neImg.height * neImg.scaleY) / 2,
        borderColor: this.clipBorder.color,
        cornerColor: this.clipBorder.color,
        cornerSize: 10,
        transparentCorners: false,
      });
      /** 禁用上下左右以及旋转 */
      neImg.setControlsVisibility({
        mt: false,
        mr: false,
        mb: false,
        ml: false,
      });
      this.canvas.add(neImg);
    },
    /**
     * 计算画布大小
     */
    calculateCanvasSize() {
      return new Promise((resolve) => {
        this.$nextTick(() => {
          let { clientWidth, clientHeight } = this.$refs.canvas_box;
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
    /**
     * 背景图片初始化
     * @param {*} canvas
     */
    async bgImgInit(canvas) {
      const bgImg = await fromImgURL(this.selectPicSrc);
      bgImg.set({
        selectable: false,
        skipTargetFind: true,
        selection: false,
      });
      bgImg.scaleToWidth(this.canvasSize.width);
      canvas.add(bgImg);
      return bgImg;
    },
    /** 初始化函数 */
    async canvasInit() {
      await this.calculateCanvasSize();
      if (this.canvas) {
        this.canvas.clear();
      } else {
        this.canvas = new fabric.Canvas(this.$refs.picture_canvas, {
          // 选择区域颜色
          selectionColor: "rgba(0,0,0,0.05)",
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          preserveObjectStacking: true,
        });
        /** 监听canvas事件 */
        this.canvas.on("mouse:down", this.mouseDown);
        this.canvas.on("mouse:move", this.mouseMove);
        this.canvas.on("mouse:up", this.mouseUp);
        this.canvas.on("drop", this.onDrop);
        /** 监听键盘事件 */
        document.addEventListener("keydown", this.keyDown);
        document.addEventListener("keyup", this.keyUp);
      }
      await this.bgImgInit(this.canvas);
    },
    /** 切图片 */
    async selectPic(url) {
      this.selectPicSrc = url;
      await this.canvasInit();
    },
    /**
     * 设置颜色
     */
    setColor(type, color) {
      this.$set(this.drawingOptions[type], "color", color);
      // 设置画笔颜色
      if (type === "brush") {
        this.canvas.freeDrawingBrush.color = color;
      }
    },
    changeType(type) {
      if (type == "delete") {
        this.delActiveElement(true);
        return;
      }
      this.drawingType = type;
      this.canvas.isDrawingMode = type === "brush";
      if (type === "brush") {
        this.brush();
      }
    },
    /** 画笔赋值 */
    brush() {
      // 是否为自由会话模式
      const { brush } = this.drawingOptions;
      // 设置画笔颜色
      this.canvas.freeDrawingBrush.color = brush.color;
      // 设置画笔粗细
      this.canvas.freeDrawingBrush.width = brush.width;
    },
    drawing() {
      /** 清除上一次正在绘制的图像，否在一次绘制会有多个图像 */
      if (this.drawingTemp) {
        this.canvas.remove(this.drawingTemp);
      }
      /** 定义本次插入元素 */
      let element = null;
      /** 鼠标指针位置结构 */
      const { down, up } = this.mousePointer;
      /** 正圆、正矩形 */
      if (
        ["ellipse", "rectangle"].includes(this.drawingType) &&
        this.drawingOptions.shiftKey
      ) {
        up.x - down.x > up.y - down.y
          ? (up.y = down.y + up.x - down.x)
          : (up.x = down.x + up.y - down.y);
      }
      /** 圆处理 */
      if (this.drawingType === "ellipse") {
        const { ellipse } = this.drawingOptions;
        element = new fabric.Ellipse({
          left: (up.x - down.x) / 2 + down.x,
          top: (up.y - down.y) / 2 + down.y,
          stroke: ellipse.color,
          fill: "rgba(255, 255, 255, 0)",
          originX: "center",
          originY: "center",
          rx: Math.abs(down.x - up.x) / 2,
          ry: Math.abs(down.y - up.y) / 2,
          strokeWidth: ellipse.width,
          //
          borderColor: this.clipBorder.color,
          cornerColor: this.clipBorder.color,
          cornerSize: 10,
          transparentCorners: false,
        });
      }
      /** 矩形处理 */
      if (this.drawingType === "rectangle") {
        const { rectangle } = this.drawingOptions;
        element = new fabric.Rect({
          left: (up.x - down.x) / 2 + down.x,
          top: (up.y - down.y) / 2 + down.y,
          stroke: rectangle.color,
          fill: "rgba(255, 255, 255, 0)",
          originX: "center",
          originY: "center",
          width: Math.abs(down.x - up.x),
          height: Math.abs(down.y - up.y),
          strokeWidth: rectangle.width,
          //
          borderColor: this.clipBorder.color,
          cornerColor: this.clipBorder.color,
          cornerSize: 10,
          transparentCorners: false,
        });
      }
      /** 箭头处理 */
      if (this.drawingType === "arrow") {
        const { arrow } = this.drawingOptions;
        const w = up.x - down.x,
          h = up.y - down.y,
          sh = Math.cos(Math.PI / 4) * 16;
        const sin = h / Math.sqrt(Math.pow(w, 2) + Math.pow(h, 2));
        const cos = w / Math.sqrt(Math.pow(w, 2) + Math.pow(h, 2));
        const w1 = (16 * sin) / 4,
          h1 = (16 * cos) / 4,
          centerx = sh * cos,
          centery = sh * sin;
        /** 生成svg代码路径
         *  借鉴: https://github.com/Couy69/vue-fabric-drawingboard
         */
        const path = ` M ${down.x} ${down.y} L ${up.x - centerx + w1} ${
          up.y - centery - h1
        } L ${up.x - centerx + w1 * 2} ${up.y - centery - h1 * 2} L ${up.x} ${
          up.y
        } L ${up.x - centerx - w1 * 2} ${up.y - centery + h1 * 2} L ${
          up.x - centerx - w1
        } ${up.y - centery + h1} Z`;

        element = new fabric.Path(path, {
          stroke: arrow.color,
          fill: arrow.color,
          strokeWidth: arrow.width,

          //
          borderColor: this.clipBorder.color,
          cornerColor: this.clipBorder.color,
          cornerSize: 10,
          transparentCorners: false,
        });
      }
      /** 文字处理 */
      if (this.drawingType === "text") {
        const { text } = this.drawingOptions;
        this.textbox = new fabric.Textbox("", {
          left: down.x,
          top: down.y - 10,
          fontSize: text.fontSize,
          borderColor: text.color,
          fill: text.color,
          hasControls: false,
        });
        this.canvas.add(this.textbox);
        this.textbox.enterEditing();
        this.textbox.hiddenTextarea.focus();
      }

      if (element) {
        this.canvas.add(element);
        this.drawingTemp = element;
      }
    },
    /** 鼠标按下 */
    mouseDown(e) {
      // console.log("鼠标按下", e);
      this.$set(this.mousePointer, "down", e.pointer);
      if (this.drawingType) {
        this.isDrawing = true;
      }
      if (this.drawingType == "text") {
        this.drawing();
      }
    },
    /** 鼠标移动 */
    mouseMove(e) {
      // console.log("鼠标移动", e);
      if (!this.isDrawing) return;
      this.$set(this.mousePointer, "up", e.pointer);
      if (!["text", "move", "delete"].includes(this.drawingType)) {
        this.drawing();
      }
    },
    /** 鼠标抬起 */
    mouseUp(e) {
      this.$set(this.mousePointer, "up", e.pointer);
      this.drawingTemp = null;
      this.isDrawing = false;
    },
    /** 删除元素 */
    delActiveElement(bool) {
      if (bool) {
        const fn = (arr) => {
          if (arr.length > 0) {
            this.canvas.remove(arr[arr.length - 1]);
            fn(arr.slice(0, arr.length - 1));
          }
          return false;
        };
        fn(this.canvas.getActiveObjects());
      } else {
        if (this.canvas.getObjects().length - 1 == 0) return;
        this.canvas.remove(
          this.canvas.getObjects()[this.canvas.getObjects().length - 1]
        );
      }
    },
    /** 监听键盘事件 */
    keyDown(e) {
      /** del  BackSpace 删除当前选中元素 */
      if (
        e.key === "Backspace" ||
        e.key === "Delete" ||
        e.keyCode === 8 ||
        e.keyCode === 46
      ) {
        this.canvas.getActiveObjects().map((item) => {
          this.canvas.remove(item);
        });
      }
      /** 处理撤销 control+z  或者 command + z */
      if (e.key === "z" && (e.ctrlKey || e.metaKey)) {
        this.delActiveElement();
      }
      /** 是否按下 shift */
      if (e.key === "Shift") {
        this.$set(this.drawingOptions, "shiftKey", e.key === "Shift");
      }
    },
    keyUp() {
      this.$set(this.drawingOptions, "shiftKey", false);
    },
    setZoom(type) {
      let zoom = this.canvas.getZoom();
      switch (type) {
        case "add":
          zoom += 0.1;
          break;
        case "reduce":
          zoom -= 0.1;
          break;
        default:
          break;
      }
      this.canvas.setZoom(zoom);
    },
  },
  watch: {
    drawingType(val) {
      console.log(val);
      this.canvas.skipTargetFind = !!val;
      this.canvas.selectable = !val;
      this.canvas.selection = !val;
      // 如果文字在编辑状态，那么在选择其他文字的时候关闭文字编辑状态
      if (this.drawingType !== "text" && this?.textbox?.isEditing) {
        console.log("退出文字编辑状态");
        this.textbox.exitEditing();
      }
    },
  },
  beforeDestroy() {
    /** 处理卸载事件 */
    this.canvas.off("mouse:down", this.mouseDown);
    this.canvas.off("mouse:move", this.mouseMove);
    this.canvas.off("mouse:up", this.mouseUp);
    document.removeEventListener("keydown", this.keyDown);
    document.removeEventListener("keyup", this.keyUp);
  },
};
</script>

<style lang="less">
.el-popover-color {
  min-width: 24px !important;
  background: #2c2c2c;
  border-color: #737171;
  .popper__arrow {
    border-right-color: #737171 !important;
    &::after {
      border-right-color: #2c2c2c !important;
    }
  }
}
</style>
<style lang="less" scoped>
@import url("./assets/iconfont.css");
.editor-picture {
  width: 100vw;
  height: 100vh;
  display: flex;
  box-sizing: border-box;
  &__left {
    background: #535353;
    flex-shrink: 0;
    width: 80px;
    height: 100%;
    display: flex;
    flex-direction: column;
    &__title {
      color: #fff;
      font-size: 16px;
      font-weight: bold;
      padding: 10px 5px;
      // width: 100%;
      text-align: center;
      line-height: 1;
      box-sizing: border-box;
      border-bottom: 1px solid #424242;
      margin: 0;
    }
    &__main {
      // width: 100%;
      flex: 1;
      display: flex;
      // justify-content: center;
      align-items: center;
      flex-direction: column;
      padding-top: 15px;
      &__icon {
        font-size: 25px;
        color: #fff;
        margin-bottom: 20px;
        &-active {
          color: #67c23a;
        }
      }
    }
    &__btns {
      display: flex;
      justify-content: space-around;
      padding: 10px;
      width: 100%;
      box-sizing: border-box;
      flex-direction: column;
      &-btn {
        margin-bottom: 10px;
      }
    }
  }
  &__main {
    flex: 1;
    background: #2d2d2d;
    // height: 100%;
    display: flex;
    flex-direction: column;
    &__material {
      background: #535353;
      box-sizing: border-box;
      border-left: 1px solid #424242;
      display: flex;
      align-items: center;
      &__left {
        flex-shrink: 0;
        width: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-left: 10px;
      }
      &__img {
        width: 40px;
        height: 40px;
        border: 1px solid #3e3e3e;
        padding: 5px;
        object-fit: contain;
      }
      &__content {
        flex: 1;
        overflow-x: auto;
        &__row {
          display: flex;
          align-items: center;
          // margin-bottom: 10px;
        }
      }
    }
    &__draw {
      flex: 1;
      display: flex;
      justify-content: center;
      align-items: center;
      &-canvas {
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
        background: url("./assets/bg.png");
      }
    }
  }
}
.color-box {
  width: 28px;
  display: flex;
  flex-direction: column;
  &__item {
    width: 20px;
    height: 20px;
    border: 4px solid #fff;
    border-radius: 4px;
    margin-bottom: 10px;
    &:last-of-type {
      margin-bottom: 0;
    }
  }
}
</style>

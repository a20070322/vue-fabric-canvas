<template>
  <div class="home">
    <div class="panel">
      <div class="panel__tools">
        <div class="panel__tools-item" @click="changeType('')">选择</div>
        <div class="panel__tools-item" @click="changeType('brush')">笔</div>
        <div class="panel__tools-item" @click="changeType('text')">文字</div>
        <div class="panel__tools-item" @click="changeType('ellipse')">圆圈</div>
        <div class="panel__tools-item" @click="changeType('rectangle')">
          矩形
        </div>
        <div class="panel__tools-item" @click="changeType('arrow')">箭头</div>
        <div class="panel__tools-item" @click="addImg('dental_crown')">
          牙冠
        </div>
        <div class="panel__tools-item" @click="addImg('dental_implant')">
          种植
        </div>
        <div class="panel__tools-item" @click="delActiveElement(true)">
          删除
        </div>
        <div class="panel__tools-item" @click="setZoom('add')">放大</div>
        <div class="panel__tools-item" @click="setZoom('reduce')">缩小</div>
      </div>
      <canvas
        ref="panel_canvas"
        class="panel__canvas"
        :width="canvasSize.width"
        :height="canvasSize.height"
      ></canvas>
    </div>
  </div>
</template>

<script>
import { fabric } from "fabric";
export default {
  name: "HomePage",
  components: {},
  data() {
    return {
      canvas: null,
      canvasSize: {
        width: 1280,
        height: 720,
      },
      /**
       *  绘制类型
       *  brush 画笔
       *  ellipse 圆圈
       *  rectangle 矩形
       *  arrow  箭头
       */
      drawingType: "",
      drawingOpitons: {
        /** 是否按下 shift */
        shiftKey: false,
        brush: {
          width: 5,
          color: "#ff5151",
        },
        ellipse: {
          width: 5,
          color: "#ff5151",
        },
        rectangle: {
          width: 5,
          color: "#ff5151",
        },
        arrow: {
          width: 2,
          color: "#ff5151",
        },
        text: {
          fontSize: 20,
          color: "#ff5151",
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
    };
  },
  mounted() {
    this.canvasInit();
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
  methods: {
    /** 初始化函数 */
    canvasInit() {
      this.canvas = new fabric.Canvas(this.$refs.panel_canvas, {
        // 选择区域颜色
        selectionColor: "rgba(0,0,0,0.05)",
      });
      fabric.Image.fromURL("/face.png", (oImg) => {
        // 缩放
        oImg.scaleToWidth(this.canvasSize.width);
        console.log(this.canvas);
        // 缩小图像并翻转它，然后将其添加到画布上
        oImg.selectable = false;
        this.canvas.add(oImg);
      });

      /** 监听canvas事件 */
      this.canvas.on("mouse:down", this.mouseDown);
      this.canvas.on("mouse:move", this.mouseMove);
      this.canvas.on("mouse:up", this.mouseUp);
      document.addEventListener("keydown", this.keyDown);
      document.addEventListener("keyup", this.keyUp);
    },
    addImg(type) {
      this.drawingType = "";
      fabric.Image.fromURL(`/icons/${type}.svg`, (oImg) => {
        oImg.left = this.canvas.width / 2;
        oImg.top = this.canvas.height / 2;
        this.canvas.add(oImg);
      });
    },
    changeType(type) {
      this.drawingType = type;

      this.canvas.isDrawingMode = type === "brush";
      if (type === "brush") {
        this.brush();
      }
    },
    /** 画笔赋值 */
    brush() {
      // 是否为自由会话模式
      const { brush } = this.drawingOpitons;
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
        this.drawingOpitons.shiftKey
      ) {
        up.x - down.x > up.y - down.y
          ? (up.y = down.y + up.x - down.x)
          : (up.x = down.x + up.y - down.y);
      }
      /** 圆处理 */
      if (this.drawingType === "ellipse") {
        const { ellipse } = this.drawingOpitons;
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
        });
      }
      /** 矩形处理 */
      if (this.drawingType === "rectangle") {
        const { rectangle } = this.drawingOpitons;
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
        });
      }
      /** 箭头处理 */
      if (this.drawingType === "arrow") {
        const { arrow } = this.drawingOpitons;
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
        });
        console.log(element);
      }
      /** 文字处理 */
      if (this.drawingType === "text") {
        const { text } = this.drawingOpitons;
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
        console.log(element, "添加进入");
        this.canvas.add(element);
        this.drawingTemp = element;
      }
    },
    /** 鼠标按下 */
    mouseDown(e) {
      console.log("鼠标按下", e);
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
      console.log("鼠标移动", e);
      if (!this.isDrawing) return;
      this.$set(this.mousePointer, "up", e.pointer);
      if (!["text"].includes(this.drawingType)) {
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
        this.$set(this.drawingOpitons, "shiftKey", e.key === "Shift");
      }
    },
    keyUp() {
      this.$set(this.drawingOpitons, "shiftKey", false);
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
}
</style>

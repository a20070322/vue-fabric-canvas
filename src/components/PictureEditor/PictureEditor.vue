<template>
  <div class="picture-editor">
    <div class="picture-editor__header">
      <el-steps
        class="picture-editor__header__steps"
        :active="step"
        simple
        finish-status="success"
      >
        <el-step title="1.选择要编辑的图片" icon="el-icon-picture"></el-step>
        <el-step title="2.裁取图片区域" icon="el-icon-scissors"></el-step>
        <el-step title="3.编辑图片" icon="el-icon-edit-outline"></el-step>
      </el-steps>
    </div>
    <SelectPicture
      v-show="step === 0"
      :imgList="imgList"
      @change="handleSelectImg"
      height="calc(100% - 50px)"
    ></SelectPicture>
    <ClipPicture
      v-show="step === 1"
      ref="ClipPicture"
      @back="handleBack"
      @confirm="clipConfirm"
    ></ClipPicture>
  </div>
</template>

<script>
import SelectPicture from "./SelectPicture.vue";
import ClipPicture from "./ClipPicture.vue";
export default {
  components: {
    ClipPicture,
    SelectPicture,
  },
  data() {
    return {
      step: 0,
      imgList: [
        {
          title: "",
          children: [
            {
              title: "曲断",
              url: "/mock/patient__2483281_545510905141628_67341462.jpg",
            },
          ],
        },
        {
          title: "",
          children: [
            {
              title: "正面咬合",
              url: "/mock/patient__2483281_545510905140318_40277856.jpg",
            },
            {
              title: "正面开合",
              url: "/mock/patient__2483281_545510905140239_52983447.jpg",
            },
            {
              title: "右侧咬合",
              url: "/mock/patient__2483281_545510905140321_39335288.jpg",
            },
            {
              title: "左侧咬合",
              url: "/mock/patient__2483281_545510905140322_38598168.jpg",
            },
            {
              title: "上颌照",
              url: "/mock/patient__2483281_545510905141311_82739951.jpg",
            },
            {
              title: "下颌照",
              url: "/mock/patient__2483281_545510905141627_59810105.jpg",
            },
          ],
        },
      ],
      activeUrl: "",
    };
  },
  methods: {
    handleSelectImg(e) {
      if (!e.img.url) {
        return;
      }
      this.activeUrl = e.img.url;
      this.step++;
      this.$refs.ClipPicture.selectPic(this.activeUrl);
    },
    handleBack() {
      this.step--;
    },
    clipConfirm(url) {
      console.log(url);
    },
  },
  mounted() {
    // this.step = 1;
    // this.$refs.ClipPicture.selectPic(
    //   "/mock/patient__2483281_545510905141628_67341462.jpg"
    // );
  },
};
</script>

<style lang="less" scoped>
.picture-editor {
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  background-color: #1b1b1b;
  z-index: 2;
  color: #fff;
  &__header {
    width: 100%;
    height: 50px;
    background-color: #323232;
    display: flex;
    align-items: center;
    // justify-content: center;
    &__steps {
      width: 100%;
      border-radius: 0px;
      background-color: #323232;
      ::v-deep .el-step__head.is-process,
      ::v-deep .el-step__title.is-process {
        color: #fff;
      }
    }
  }
  &__img-box {
    width: 100%;
    height: calc(100% - 50px);
    background-color: #1b1b1b;
    position: relative;
    overflow-y: auto;
    padding: 30px;
    &__row {
      display: flex;
      flex-wrap: wrap;
    }

    &__item {
      width: 250px;
      position: relative;
      border-radius: 4px;
      overflow: hidden;
      margin-right: 20px;
      margin-bottom: 20px;
      color: #e3e3e3;
      &-img {
        width: 240px;
        background: #2c2c2c;
        height: 175px;
        padding: 20px 10px;
        box-sizing: border-box;
      }
      ::v-deep .image-slot {
        width: 240px;
        height: 135px;
        display: flex;
        align-items: center;
        justify-content: center;
        > i {
          font-size: 50px;
        }
      }

      &-title {
        // position: absolute;
        // bottom: 0px;
        text-align: center;
        // left: 0px;
        // background: rgba(255, 255, 255, 0.3);
        // right: 0;
        height: 30px;
        padding: 2px 0;
        line-height: 30px;
        width: 100%;
      }
    }
  }
}
</style>

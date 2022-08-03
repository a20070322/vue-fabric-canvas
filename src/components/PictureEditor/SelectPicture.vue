<template>
  <div
    class="select-picture__img-box"
    :style="{
      height: height,
    }"
  >
    <div
      class="select-picture__img-box__row"
      v-for="(item, idx) in imgList"
      :key="idx"
    >
      <div
        class="select-picture__img-box__item"
        v-for="(sitem, sidx) in item.children"
        :key="sidx"
        @click="handleClick(sitem, sidx, idx)"
      >
        <el-image
          class="select-picture__img-box__item-img"
          :src="sitem.url"
          fit="contain"
        >
          <div slot="error" class="image-slot">
            <i class="el-icon-picture-outline"></i>
          </div>
        </el-image>
        <div class="select-picture__img-box__item-title">
          {{ sitem.title }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    imgList: {
      type: Array,
      default: () => [],
    },
    height: {
      type: [Number, String],
      default: "auto",
    },
  },
  methods: {
    handleClick(img, sidx, idx) {
      this.$emit("change", {
        img,
        sidx,
        idx,
      });
    },
  },
};
</script>

<style lang="less" scoped>
.select-picture {
  &__img-box {
    width: 100%;
    background-color: #1b1b1b;
    position: relative;
    overflow-y: auto;
    padding: 30px;
    box-sizing: border-box;
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
      :deep .image-slot {
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

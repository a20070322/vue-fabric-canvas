<template>
  <div>
    <PictureEditor v-if="true"></PictureEditor>
    <div v-else class="ppt-box" ref="ppt_box">
      <div class="ppt-content" :class="activePptBoxClass">
        <div class="test-logo">测试logo</div>
      </div>
    </div>
  </div>
</template>

<script>
import PictureEditor from "@/components/PictureEditor/PictureEditor.vue";
export default {
  components: {
    PictureEditor,
  },
  data() {
    return {
      activePptBoxClass: "",
    };
  },
  created() {
    window.addEventListener("resize", this.pptBoxInit);
  },
  methods: {
    pptBoxInit() {
      const proportion = {
        width: 16,
        height: 9,
      };
      const { clientWidth, clientHeight } = this.$refs.ppt_box;
      this.activePptBoxClass =
        clientWidth / clientHeight > proportion.width / proportion.height
          ? "ppt-content__height"
          : "ppt-content__width";
    },
  },
  mounted() {
    this.pptBoxInit();
  },
  destroyed() {
    window.removeEventListener("resize", this.pptBoxInit);
  },
};
</script>

<style lang="less" scoped>
.ppt-box {
  background-color: #000;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  .ppt-content {
    background: #666;
    position: relative;
    &__height {
      width: 177.6vmin;
      height: 100vmin;
    }
    &__width {
      height: 177.6vmin;
      width: 100vw;
      height: 56.25vw;
    }
    .test-logo {
      width: 100%;
      height: 50%;
      background: red;
    }
  }
}
</style>

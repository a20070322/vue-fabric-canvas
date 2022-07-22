import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import fabric from "fabric";
Vue.use(fabric);

Vue.config.productionTip = false;

new Vue({
  router,
  render: (h) => h(App),
}).$mount("#app");

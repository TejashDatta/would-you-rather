import Vue from "vue";
import "./plugins/vuetify";
import App from "./App.vue";
import router from "./router";
import { store } from "./store";
import { auth } from "@/fbConfig";

Vue.config.productionTip = false;

let app;
// eslint-disable-next-line
auth.onAuthStateChanged(user => {
  if (!app) {
    new Vue({
      router,
      store,
      render: h => h(App),
    }).$mount("#app");
  }
});

import Vue from "vue";
import Router from "vue-router";
import Home from "./views/Home.vue";
import { store } from "@/store";

Vue.use(Router);

var router = new Router({
  mode: "history",
  base: process.env.BASE_URL,
  routes: [
    {
      path: "/",
      name: "home",
      component: Home,
    },
    {
      path: "/auth",
      name: "auth",
      component: () => import("@/views/Auth"),
      meta: {
        requiresGuest: true,
      },
    },
    {
      path: "/user/:id",
      name: "user-profile",
      component: () => import("@/views/UserProfile"),
    },
    {
      path: "/privacy-policy",
      component: () => import("@/views/PrivacyPolicy"),
    },
  ],
});

router.beforeEach((to, from, next) => {
  const requiresGuest = to.matched.some(x => x.meta.requiresGuest);
  if (requiresGuest && !store.getters.isAnonUser) {
    router.push("/");
  }
  next();
});

export default router;

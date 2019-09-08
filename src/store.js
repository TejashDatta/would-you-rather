import Vue from "vue";
import Vuex from "vuex";
import { auth, db } from "@/fbConfig";

Vue.use(Vuex);

auth.onAuthStateChanged(user => {
  if (user) {
    store.commit("setCurrentUser", user);
    store.dispatch("fetchUserProfile");
  } else {
    auth.signInAnonymously();
  }
});

export const store = new Vuex.Store({
  state: {
    isAnonUser: true,
    currentUser: null,
    userProfile: {
      votedPolls: [],
      flaggedPolls: [],
    },
  },
  mutations: {
    setCurrentUser: (state, data) => {
      state.currentUser = data;
      state.isAnonUser = state.currentUser.isAnonymous;
    },
    setUserProfile: (state, data) => (state.userProfile = data),
    addVotedPoll: (state, pollid) => state.userProfile.votedPolls.push(pollid),
    addFlaggedPoll: (state, pollid) =>
      state.userProfile.flaggedPolls.push(pollid),
    removeFlaggedPoll: (state, pollid) =>
      (state.userProfile.flaggedPolls = state.userProfile.flaggedPolls.filter(
        el => el !== pollid
      )),
  },
  actions: {
    fetchUserProfile({ commit, state }) {
      db.collection("users")
        .doc(state.currentUser.uid)
        .get()
        .then(res => {
          if (res.data()) commit("setUserProfile", res.data());
          else {
            commit("setUserProfile", {
              votedPolls: [],
              flaggedPolls: [],
            });
            db.collection("users")
              .doc(state.currentUser.uid)
              .set(state.userProfile);
          }
        });
    },
  },
});

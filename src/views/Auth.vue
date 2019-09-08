<template>
  <div class="mt-4">
    <Loading v-if="loading" />

    <div v-else>
      <div v-if="!choosingName" id="firebaseui-auth-container"></div>
      <v-layout v-else justify-center>
        <v-flex xs12 sm6 md4>
          <NameChangeForm @nameAdded="completeSignup" />
        </v-flex>
      </v-layout>
    </div>
  </div>
</template>
<script>
import Loading from "@/components/Loading";
import firebase from "firebase/app";
import * as firebaseui from "firebaseui";
import "../../node_modules/firebaseui/dist/firebaseui.css";
import { auth, db } from "@/fbConfig";
import NameChangeForm from "@/components/NameChangeForm";

export default {
  components: {
    NameChangeForm,
    Loading
  },
  data() {
    return {
      loading: false,
      choosingName: false,
      authResult: null
    };
  },
  methods: {
    completeSignup: function(name) {
      let { votedPolls, flaggedPolls } = this.$store.state.userProfile;

      db.collection("users")
        .doc(this.authResult.user.uid)
        .set({ name, votedPolls, flaggedPolls })
        .then(() => {
          this.authResult.user.updateProfile({ displayName: name }).then(() => {
            this.$store.commit("setCurrentUser", this.authResult.user);
            this.$store.dispatch("fetchUserProfile");
            this.choosingName = false;
            this.$router.push(this.$route.query.redirectUrl || "/");
          });
        });
    }
  },
  beforeDestroy() {
    if (this.choosingName) {
      let name = this.authResult.user.email.split("@")[0];
      this.completeSignup(name);
    }
  },
  mounted() {
    let uiConfig = {
      signInOptions: [
        {
          provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
          requireDisplayName: false
        },
        firebase.auth.GoogleAuthProvider.PROVIDER_ID
      ],
      privacyPolicyUrl: "/privacy-policy",
      credentialHelper: firebaseui.auth.CredentialHelper.NONE,
      autoUpgradeAnonymousUsers: true,
      signInFlow: "popup",
      callbacks: {
        signInSuccessWithAuthResult: authResult => {
          this.authResult = authResult;
          this.choosingName = true;
          return false;
        },

        signInFailure: async error => {
          if (error.code != "firebaseui/anonymous-upgrade-merge-conflict") {
            return Promise.resolve();
          }

          this.loading = true;

          var cred = error.credential;
          let votedPolls = this.$store.state.userProfile.votedPolls;

          let anonUser = auth.currentUser;

          let willDel = db
            .collection("users")
            .doc(anonUser.uid)
            .delete();

          let user = await auth.signInWithCredential(cred);
          user = user.user;

          anonUser.delete();

          let userProfile = await db
            .collection("users")
            .doc(user.uid)
            .get();

          votedPolls.push(...userProfile.data().votedPolls);

          let willAdd = db
            .collection("users")
            .doc(user.uid)
            .update({ votedPolls });

          await Promise.all([willDel, willAdd]);

          this.$router.push(this.$route.query.redirectUrl || "/");
        }
      }
    };
    var ui =
      firebaseui.auth.AuthUI.getInstance() || new firebaseui.auth.AuthUI(auth);
    ui.start("#firebaseui-auth-container", uiConfig);
  }
};
</script>
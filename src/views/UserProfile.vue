<template>
  <v-container>
    <div v-if="profile">
      <h1>{{profile.name}}'s Polls</h1>
      <PollList :userID="$route.params.id" :showForm="isCurrentUser" />
    </div>
    <div v-if="!valid">
      <h2 class="red--text">Error 404: User not found</h2>
    </div>
  </v-container>
</template>

<script>
import PollList from "@/components/PollList";

import { db } from "@/fbConfig";

export default {
  components: {
    PollList
  },
  data() {
    return {
      profile: null,
      valid: true
    };
  },
  computed: {
    isCurrentUser() {
      return (
        this.$route.params.id == this.$store.state.currentUser.uid &&
        !this.$store.getters.isAnonUser
      );
    }
  },
  mounted() {
    db.collection("users")
      .doc(this.$route.params.id)
      .get()
      .then(doc => {
        this.profile = doc.data();
        if (!this.profile) this.valid = false;
      });
  }
};
</script>


<template>
  <div>
    <PollList>
      <span v-if="isAnonUser">
        <router-link :to="{name: 'auth'}">Login/Signup</router-link>
        <span class="ml-1">to add a poll</span>
      </span>
      <span v-else>
        <router-link
          :to="{name: 'user-profile', params: {id: currentUser.uid }}"
        >Click to create poll</router-link>
      </span>
    </PollList>
  </div>
</template>

<script>
import PollList from "@/components/PollList";
import { mapState } from "vuex";

export default {
  components: {
    PollList
  },
  data() {
    return {};
  },
  computed: mapState(["isAnonUser", "currentUser"])
};
</script>


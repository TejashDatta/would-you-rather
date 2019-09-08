<template>
  <v-card class="pa-3">
    <div class="subheading grey--text">Create Poll</div>
    <v-form ref="form" v-model="valid">
      <v-textarea
        v-for="(n,i) in 2"
        :key="i"
        :label="`Option ${n}`"
        v-model="poll.options[i]"
        clearable
        auto-grow
        counter="120"
        rows="2"
        prepend-icon="create"
        :rules="rules"
      />
      <v-layout align-center justify-end>
        <v-flex shrink>
          <v-btn
            depressed
            :disabled="!valid"
            color="primary"
            :loading="loading"
            @click="submitPoll"
          >Post</v-btn>
          <v-btn flat color="error" outline @click="reset">Reset</v-btn>
        </v-flex>
      </v-layout>
    </v-form>
  </v-card>
</template>

<script>
import firebase from "firebase/app";
import "firebase/firestore";
import { mapState } from "vuex";
import { db } from "@/fbConfig";
export default {
  data() {
    return {
      poll: {
        options: ["", ""],
        option0votes: 0,
        totalVotes: 0,
        flags: 0
      },
      loading: false,
      valid: true,
      rules: [
        v => !!v || "This field is required",
        v =>
          (v && v.length <= 120) || "Option must be shorter than 120 characters"
      ]
    };
  },
  computed: mapState(["currentUser"]),
  methods: {
    submitPoll() {
      this.loading = true;
      this.poll.author = {
        id: this.currentUser.uid,
        name: this.currentUser.displayName
      };
      this.poll.creationDate = firebase.firestore.Timestamp.now();
      db.collection("polls")
        .add(this.poll)
        .then(doc => {
          this.$emit("addPoll", { ...this.poll, id: doc.id });
          this.poll = {
            options: ["", ""],
            option0votes: 0,
            totalVotes: 0,
            flags: 0
          };
          this.loading = false;
          this.reset();
        });
    },
    reset() {
      this.$refs.form.reset();
    }
  }
};
</script>

<style>
</style>

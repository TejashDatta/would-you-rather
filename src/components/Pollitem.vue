<template>
  <v-card class="pt-1 px-3">
    <v-radio-group v-if="!voted" label="Would you rather...">
      <v-radio
        v-for="(option, index) in poll.options"
        :key="index"
        :label="option"
        @click="vote(index)"
      />
    </v-radio-group>

    <div class="mt-2 poll-results" v-else>
      <div class="subheading grey--text">Results</div>
      <div v-for="(option, index) in poll.options" :key="index">
        <span>{{option}}</span>
        <v-layout>
          <v-flex grow>
            <div :style="{width: optionWidth(index)}">
              <div class="bar primary"></div>
            </div>
          </v-flex>
          <v-flex class="indigo--text" xs1>{{optionVotes(index)}}</v-flex>
        </v-layout>
      </div>
    </div>

    <v-divider></v-divider>
    <v-card-actions>
      <span class="caption">
        Posted by
        <router-link :to="{name: 'user-profile', params: {id: poll.author.id}}">{{poll.author.name}}</router-link>
        {{poll.creationDate | formatDate}}
      </span>
      <v-spacer></v-spacer>
      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-btn :class="flagged ? 'orange--text': 'grey--text'" icon v-on="on" @click="flagPoll">
            <v-icon>flag</v-icon>
          </v-btn>
        </template>
        <span>Report as offensive or spam</span>
      </v-tooltip>

      <v-dialog v-model="dialog" width="500" v-if="currentUser.uid == poll.author.id">
        <template v-slot:activator="{ on: dialog }">
          <v-tooltip bottom>
            <template v-slot:activator="{ on: tooltip }">
              <v-btn icon v-on="{...tooltip, ...dialog}" class="grey--text">
                <v-icon>delete</v-icon>
              </v-btn>
            </template>
            <span>Delete poll</span>
          </v-tooltip>
        </template>

        <v-card class="pa-3">
          <h2>Are you sure you want to delete this poll?</h2>
          <p>This action cannot be undone.</p>
          <v-layout align-center justify-end>
            <v-flex shrink>
              <v-btn color="warning" outline @click="dialog=false">Cancel</v-btn>
              <v-btn depressed color="error" @click="deletePoll">Delete</v-btn>
            </v-flex>
          </v-layout>
        </v-card>
      </v-dialog>
    </v-card-actions>
  </v-card>
</template>

<script>
import firebase from "firebase/app";
import "firebase/firestore";
import { db } from "@/fbConfig";
import moment from "moment";
import { mapState } from "vuex";

export default {
  props: ["poll"],
  data() {
    return {
      dialog: false
    };
  },
  methods: {
    deletePoll() {
      db.collection("polls")
        .doc(this.poll.id)
        .delete()
        .then(() => {
          this.$emit("deletePoll", this.poll.id);
        });
    },
    flagPoll() {
      var pollRef = db.collection("polls").doc(this.poll.id);
      var userProfileRef = db
        .collection("users")
        .doc(this.$store.state.currentUser.uid);

      var increment = firebase.firestore.FieldValue.increment(1);
      var decrement = firebase.firestore.FieldValue.increment(-1);
      const batch = db.batch();

      if (!this.flagged) {
        batch.update(pollRef, { flags: increment });
        this.$store.commit("addFlaggedPoll", this.poll.id);
      } else {
        batch.update(pollRef, { flags: decrement });
        this.$store.commit("removeFlaggedPoll", this.poll.id);
      }

      batch.update(userProfileRef, {
        flaggedPolls: this.$store.state.userProfile.flaggedPolls
      });
      batch.commit();
    },
    optionWidth(n) {
      const poll = this.poll;
      if (n === 0) var votes = poll.option0votes;
      else var votes = poll.totalVotes - poll.option0votes;
      return (votes / poll.totalVotes) * 100 + "%";
    },
    optionVotes(n) {
      const poll = this.poll;
      if (n === 0) return poll.option0votes;
      else return poll.totalVotes - poll.option0votes;
    },
    vote(optionIndex) {
      if (optionIndex == 0) this.poll.option0votes += 1;
      this.poll.totalVotes += 1;
      this.$store.commit("addVotedPoll", this.poll.id);

      var pollRef = db.collection("polls").doc(this.poll.id);
      var userProfileRef = db
        .collection("users")
        .doc(this.$store.state.currentUser.uid);

      var increment = firebase.firestore.FieldValue.increment(1);

      const batch = db.batch();

      var updatedPoll = { ...this.poll };

      if (optionIndex == 0) batch.update(pollRef, { option0votes: increment });
      batch.update(pollRef, { totalVotes: increment });
      batch.update(userProfileRef, {
        votedPolls: this.$store.state.userProfile.votedPolls
      });

      batch.commit();
    }
  },
  computed: {
    voted() {
      return this.$store.state.userProfile.votedPolls.includes(this.poll.id);
    },
    flagged() {
      return this.$store.state.userProfile.flaggedPolls.includes(this.poll.id);
    },
    ...mapState(["currentUser"])
  },
  filters: {
    formatDate(value) {
      return moment(value.toDate()).fromNow();
    }
  }
};
</script>

<style>
@keyframes animate-width {
  0% {
    width: 0;
  }
  100% {
    width: 100%;
  }
}

.bar {
  animation: animate-width 1s;
  height: 20px;
}

.poll-results > * {
  margin-bottom: 1rem;
}
</style>

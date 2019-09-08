<template>
  <v-container grid-list-xl>
    <AddPollForm v-if="showForm" @addPoll="addPoll" />
    <v-layout wrap justify-space-between>
      <v-flex shrink align-center class="dpflex">
        <slot></slot>
      </v-flex>
      <v-flex shrink>
        <div>
          Sort by:
          <v-menu>
            <template v-slot:activator="{on}">
              <v-btn color="primary" class="text-capitalize" flat v-on="on">{{sortLabel}}</v-btn>
            </template>

            <v-list>
              <v-list-tile
                v-for="sortOption in sortOptions"
                :key="sortOption.label"
                @click="reloadPolls(sortOption)"
              >
                <v-list-tile-title>{{sortOption.label}}</v-list-tile-title>
              </v-list-tile>
            </v-list>
          </v-menu>
        </div>
      </v-flex>
    </v-layout>
    <v-layout row wrap>
      <v-flex xs12 sm6 v-for="poll in pollList" :key="poll.id">
        <Pollitem :poll="poll" @deletePoll="deletePoll" />
      </v-flex>
    </v-layout>
    <Loading v-if="!firstLoaded&&loading" />
    <v-layout v-else justify-center>
      <v-flex shrink>
        <v-btn v-if="canShowMore" @click="getPolls" :loading="loading" color="primary">Load More</v-btn>
        <div v-else-if="pollList.length >= 10">No {{firstLoaded ? 'more':''}} polls to show</div>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import Pollitem from "@/components/Pollitem";
import AddPollForm from "@/components/AddPollForm";
import Loading from "@/components/Loading";
import { db } from "@/fbConfig";

export default {
  components: {
    Pollitem,
    AddPollForm,
    Loading
  },
  props: ["userID", "showForm"],
  data() {
    return {
      limit: 10,
      query: null,
      pollList: [],
      sortLabel: "",
      sortOptions: [
        { value: "creationDate", label: "Date", order: "desc" },
        { value: "totalVotes", label: "Popularity", order: "asc" }
      ],
      canShowMore: true,
      loading: true,
      firstLoaded: false
    };
  },
  methods: {
    setQuery(sortBy) {
      this.pollList = [];

      this.query = db
        .collection("polls")
        .orderBy(sortBy.value, sortBy.order)
        .limit(this.limit);

      if (this.userID)
        this.query = this.query.where("author.id", "==", this.userID);
    },
    getPolls() {
      this.loading = true;
      this.query.get().then(snapshot => {
        this.pollList.push(
          ...snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }))
        );
        if (!snapshot.empty) {
          this.query = this.query.startAfter(
            snapshot.docs[snapshot.docs.length - 1]
          );
          this.firstLoaded = true;
          if (snapshot.docs.length < this.limit) this.canShowMore = false;
        } else this.canShowMore = false;
        this.loading = false;
      });
    },
    reloadPolls(sortBy) {
      this.sortLabel = sortBy.label;
      this.canShowMore = true;
      this.firstLoaded = false;
      this.setQuery(sortBy);
      this.getPolls();
    },
    deletePoll(id) {
      this.pollList = this.pollList.filter(poll => poll.id !== id);
    },
    addPoll(poll) {
      this.pollList.unshift(poll);
    }
  },
  created() {
    this.reloadPolls({ value: "creationDate", label: "Date", order: "desc" });
  }
};
</script>

<style>
.dpflex {
  display: flex;
}
</style>

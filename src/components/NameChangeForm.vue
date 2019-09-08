<template>
  <v-card class="pa-3">
    <h3>Set Username</h3>
    <v-form v-model="valid">
      <v-text-field
        v-model="name"
        :rules="rules"
        :counter="20"
        label="Username"
        required
        :error-messages="nameError"
      />
      <v-layout align-center justify-end>
        <v-flex shrink>
          <v-btn
            depressed
            :disabled="!valid"
            color="primary"
            :loading="loading"
            @click="changeName"
          >Submit</v-btn>
        </v-flex>
      </v-layout>
    </v-form>
  </v-card>
</template>

<script>
import { db } from "@/fbConfig";
import _ from "lodash";

export default {
  data() {
    return {
      valid: false,
      loading: false,
      name: "",
      nameError: "",
      rules: [
        v => !!v || "This field is required",
        v => (v && v.length <= 20) || "Name must be shorter than 20 characters"
      ]
    };
  },
  watch: {
    name() {
      this.nameError = "";
      if (!this.loading) this.debouncedVerifyName();
    }
  },
  methods: {
    verifyName() {
      db.collection("users")
        .where("name", "==", this.name)
        .get()
        .then(snapshot => {
          if (!snapshot.empty)
            this.nameError = "This username is already in use!";
        });
    },
    changeName() {
      this.$emit("nameAdded", this.name);
      this.loading = true;
    }
  },
  created() {
    this.debouncedVerifyName = _.debounce(this.verifyName, 500);
  }
};
</script>

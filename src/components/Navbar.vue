<template>
  <nav>
    <v-toolbar app color="primary" dark>
      <v-toolbar-side-icon @click="drawer = !drawer" class="hidden-md-and-up white--text"></v-toolbar-side-icon>
      <router-link to="/">
        <v-toolbar-title class="headline white--text">WYRather</v-toolbar-title>
      </router-link>
      <v-spacer />

      <v-toolbar-items>
        <v-btn class="hidden-xs-only" flat :to="{name: 'home'}" exact>
          <v-icon>home</v-icon>
        </v-btn>
        <v-btn
          flat
          v-if="isAnonUser"
          :to="{name:'auth', query: {redirectUrl: $route.path}}"
        >Log In/Sign Up</v-btn>

        <v-menu offset-y v-else>
          <template v-slot:activator="{on}">
            <v-btn
              flat
              v-on="on"
              class="hidden-sm-and-down text-capitalize"
            >{{currentUser.displayName }}</v-btn>
          </template>

          <v-list>
            <v-list-tile :to="{name: 'user-profile', params: {id: currentUser.uid }}">
              <v-list-tile-action>
                <v-icon>account_circle</v-icon>
              </v-list-tile-action>
              <v-list-tile-title>Profile</v-list-tile-title>
            </v-list-tile>

            <v-list-tile :to="{name: 'user-profile', params: {id: currentUser.uid }}">
              <v-list-tile-action>
                <v-icon>add_comment</v-icon>
              </v-list-tile-action>
              <v-list-tile-title>Create poll</v-list-tile-title>
            </v-list-tile>

            <v-list-tile @click="signOut">
              <v-list-tile-action>
                <v-icon>exit_to_app</v-icon>
              </v-list-tile-action>
              <v-list-tile-title>Sign out</v-list-tile-title>
            </v-list-tile>
          </v-list>
        </v-menu>
      </v-toolbar-items>
    </v-toolbar>

    <v-navigation-drawer disable-resize-watcher app v-model="drawer" class="grey lighten-4">
      <div class="pa-3 blue-grey lighten-5">
        <div v-if="isAnonUser" class="login-container">
          <v-btn
            dark
            class="primary"
            :to="{name:'auth', query: {redirectUrl: $route.path}}"
          >Login/Sign up</v-btn>
        </div>
        <v-layout v-else justify-center>
          <v-flex shrink>
            <h2>
              Signed in as
              <router-link
                :to="{name: 'user-profile', params: {id: currentUser.uid }}"
              >{{currentUser.displayName}}</router-link>
            </h2>
            <v-btn small flat color="blue" class="ma-0 pa-1" @click="signOut">
              Sign out
              <v-icon small right>exit_to_app</v-icon>
            </v-btn>
          </v-flex>
        </v-layout>
      </div>
      <v-list>
        <v-list-tile exact :to="{name: 'home'}">
          <v-list-tile-action>
            <v-icon>home</v-icon>
          </v-list-tile-action>
          <v-list-tile-title>Home</v-list-tile-title>
        </v-list-tile>
      </v-list>
      <v-list v-if="!isAnonUser">
        <v-list-tile :to="{name: 'user-profile', params: {id: currentUser.uid }}">
          <v-list-tile-action>
            <v-icon>account_circle</v-icon>
          </v-list-tile-action>
          <v-list-tile-title>Profile</v-list-tile-title>
        </v-list-tile>

        <v-list-tile :to="{name: 'user-profile', params: {id: currentUser.uid }}">
          <v-list-tile-action>
            <v-icon>add_comment</v-icon>
          </v-list-tile-action>
          <v-list-tile-title>Create poll</v-list-tile-title>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>
  </nav>
</template>

<script>
import { auth } from "@/fbConfig";
import { mapState } from "vuex";

export default {
  data() {
    return {
      drawer: false
    };
  },
  computed: mapState(["isAnonUser", "currentUser"]),
  methods: {
    signOut() {
      auth.signOut();
    }
  }
};
</script>

<style>
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100px;
}
</style>

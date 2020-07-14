<template>
  <v-app>
    <v-navigation-drawer app v-model="drawer" clipped _fixed _temporary _dark_>
      <!-- <v-list-item>
        <v-list-item-content>
          <v-list-item-title class="title">
            Application
          </v-list-item-title>
          <v-list-item-subtitle>
            subtext
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>

      <v-divider></v-divider> -->

      <v-list dense nav>
        <v-list-item
          v-for="item in items"
          :key="item.title"
          link>
          <v-list-item-icon>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar app _dark_ clipped-left clipped-right>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>Dashboard</v-toolbar-title>
    </v-app-bar>

    <v-navigation-drawer v-model="drawerRight" app clipped right>
      <v-subheader>Events</v-subheader>
    </v-navigation-drawer>

    <!-- Sizes your content based upon application components -->
    <v-main>

      <!-- Provides the application the proper gutter -->
      <v-container fluid>
        <!-- If using vue-router -->
        <!-- <router-view></router-view> -->

        <v-row v-if="skeletonLoading">
          <v-col v-for="n in 9" :key="n" cols="12" lg="3">

            <v-skeleton-loader
              _loading="skeletonLoading"
              transition="scale-transition"
              class="mx-auto"
              max-width="300"
              type="card"/>

          </v-col>
        </v-row>

        <v-row v-else-if="hostsReport.length == 0">
          <v-col>
            <v-alert text color="info" border="left">
              <h3 class="headline">No host found</h3>
              <div>Please follow setup guideline from installation folder to see how to add Monit host agent to CentMonit.</div>
            </v-alert>
          </v-col>
        </v-row>

        <v-row v-else>
          <v-col v-for="(item, index) in hostsReport" :key="index" cols="12" lg="3">

              <HostCard :report="item" />

          </v-col>
        </v-row>
      </v-container>
    </v-main>

    <v-footer app _dark_ _class="grey _dark_en-3 white--text">
      <div _class="ml-3 text-caption text-sm-body-2">
          Made with <v-icon class="red--text" style="vertical-align: middle;" _large>mdi-heart-outline</v-icon>
          by <a _class="white--text" href="https://vuetifyjs.com" target="_blank">Vuetify</a>
          and <a _class="white--text" href="#" target="_blank">Author</a>
      </div>
      <v-spacer/>
      <div _class="mr-3 hidden-xs-only">
          Copyright &copy; 2020
      </div>
    </v-footer>
  </v-app>
</template>

<script>
import HostCard from './components/HostCard';
import axios from 'axios'

export default {
  name: 'App',

  components: {
    HostCard
  },

  data: () => ({
    num: 1,
    skeletonLoading: true,
    drawer: false,
    drawerRight: false,
    items: [
      { title: 'Dashboard', icon: 'mdi-view-dashboard' },
      { title: 'Photos', icon: 'mdi-image' },
      { title: 'About', icon: 'mdi-help-box' },
    ],

    /** hostsReport: array of host report
    [
      {
        "id": "9c8b9e3478dd15018389b2e2c8bf560e",
        "hostname": "xxx",
        "uptime": 9963646,
        "ram": 22.2,
        "cpu": 2.6000001,
        "services": 9,
        "goodServices": 9,
        "skipServices": 0
      }
    ]
    */
    hostsReport: []
  }),

  created () {
    console.log('App::created()...')
    // this.$vuetify.theme.dark = true

    axios.get(`${this.$GCONFIG.api_base_url}/api/hosts/report`).then(
      response => {
        console.log('App::created() - get report response:', response)
        this.hostsReport = response.data
      }
    ).catch(
      error => {
        console.log('App::created() - get report error:', error)
      }
    )

    setInterval(() => {
      this.skeletonLoading = false
    }, 1500)
  },

  methods: {
    test () {
      let msg = `${this.num} Lorem ipsum dolor sit amet consectetur, adipisicing elit<br/>
        Amet nulla obcaecati laudantium assumenda autem ex qui, non quisquam alias officia?<br/>
        Neque nulla libero corporis eos atque facilis illum aliquid inventore?`
      if (this.num%3 == 0) {
        this.$toast.open({
          message: msg,
          type: 'error'
        })
      } else {
        this.$toast.open({
          message: msg
        })
      }
      this.num++
    }
  }
};
</script>

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
        <v-row>
          <v-col v-for="n in 12" :key="n" cols="12" lg="3">

            <v-skeleton-loader
              :loading="skeletonLoading"
              transition="scale-transition"
              class="mx-auto"
              max-width="300"
              type="card">

              <v-card class="mx-auto" max-width="350" @click="test">

                <v-list-item two-line>
                  <v-list-item-content>
                    <v-list-item-title class="text-h6">Hostname {{n}}</v-list-item-title>
                    <v-list-item-subtitle>
                      123 days uptime
                      <v-icon small>mdi-circle-small</v-icon>
                      <span class="red--text">86% CPU</span>
                      <v-icon small>mdi-circle-small</v-icon>
                      <span class="orange--text">72% RAM</span>
                    </v-list-item-subtitle>
                  </v-list-item-content>
                  <v-list-item-icon>
                    <v-icon v-if="n%3==0" color="green">mdi-check-bold</v-icon>
                    <v-icon v-if="n%3==1" color="red">mdi-alert</v-icon>
                    <v-icon v-if="n%3==2" color="amber">mdi-alert</v-icon>
                  </v-list-item-icon>
                </v-list-item>

                <v-card-text>
                  <v-row class="text-center">
                    <v-col cols="4">
                      <div class="text-h4">3</div>
                      <div>Total</div>
                    </v-col>
                    <v-col cols="4">
                      <div class="text-h4">2</div>
                      <div>OK</div>
                    </v-col>
                    <v-col cols="4">
                      <div class="text-h4">1</div>
                      <div>Skip</div>
                    </v-col>
                  </v-row>
                </v-card-text>

              </v-card>

            </v-skeleton-loader>

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
// import HelloWorld from './components/HelloWorld';

export default {
  name: 'App',

  components: {
    // HelloWorld,
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
    ]
  }),

  created () {
    console.log('App::created...')
    // this.$vuetify.theme.dark = true

    setTimeout(() => {
      this.skeletonLoading = false
    }, 1500);
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

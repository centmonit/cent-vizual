<template>
  <v-app>
    <!-- <v-navigation-drawer app v-model="drawer" clipped>
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
    </v-navigation-drawer> -->

    <v-app-bar app clipped-left clipped-right>
      <v-app-bar-nav-icon _click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>Dashboard</v-toolbar-title>

      <v-spacer/>

      <v-badge :content="alertCount" :dot="hideAlertBadge"
                color="error" left _overlap
                v-bind="alertBadgeIconProp"
                offset-x="23" offset-y="23">
        <v-btn icon @click="openAlertSheet">
          <v-icon>mdi-bell</v-icon>
        </v-btn>
      </v-badge>

      <v-tooltip bottom :open-delay="1000">
        <template v-slot:activator="{ on, attrs }">
          <v-btn icon @click="changeDarkMode" v-bind="attrs" v-on="on">
            <v-icon>mdi-theme-light-dark</v-icon>
          </v-btn>
        </template>
        <span>Switch to day/night mode</span>
      </v-tooltip>
    </v-app-bar>

    <!-- <v-navigation-drawer v-model="drawerRight" app clipped right>
      <v-subheader>Events</v-subheader>
    </v-navigation-drawer> -->

    <!-- Sizes your content based upon application components -->
    <v-main>

      <!-- ---------------------------------------- -->
      <!-- -------------  Banner  ----------------- -->
      <!-- ---------------------------------------- -->
      <v-banner v-if="!socketConnected"
        app single-line _color="white"
        icon="mdi-wifi-strength-alert-outline" icon-color="red">

        Lost socket connection to API Server

        <template v-slot:actions>
          <v-btn text color="primary" @click="reconnectSocket">Reconnect</v-btn>
        </template>
      </v-banner>

      <!-- Provides the application the proper gutter -->
      <v-container fluid>
        <!-- If using vue-router -->
        <!-- <router-view></router-view> -->

        <v-row v-if="skeletonLoading">
          <!-- ---------------------------------------- -->
          <!-- -------------  Loader  ----------------- -->
          <!-- ---------------------------------------- -->
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
          <!-- ---------------------------------------- -->
          <!-- -------------  No report  -------------- -->
          <!-- ---------------------------------------- -->
          <v-col>
            <v-alert v-if="!apiError" text color="info" border="left">
              <h3 class="headline">No data found</h3>
              <div>
                You may need to wait for CentMonit to receive first report data from Monit agents.<br/>
                If you've waited so long, then check your Monit log (/var/log/monit.log) to see whether it successfully send report data to CentMonit?<br/>
                Please follow the setup manual from installation folder to verify Monit and CentMonit's configuration.
              </div>
            </v-alert>
            <v-alert v-else-if="!socketConnected" text color="error" border="left">
              <h3 class="headline">{{ apiErrorMessage }}</h3>
              <div>
                Is CentMonit daemon process running normally on the server side (at address {{`${this.$GCONFIG.api_base_url}`}})?<br/>
                Try restart it then reload your browser (Ctrl + F5).
              </div>
            </v-alert>
            <v-alert v-else text color="info" border="left">
              <div>Please waiting for the first report being aggregated at CentMonit...</div>
            </v-alert>
          </v-col>
        </v-row>

        <div v-else>
          <!-- ---------------------------------------- -->
          <!-- -----------  Host report  -------------- -->
          <!-- ---------------------------------------- -->

          <v-row class="justify-center">
            <small :class="[lastReportTimeStyleClass]" style="color: #2196F3">
              Good hosts: {{ totalGoodHosts() }}/{{ Object.keys(hostsState).length }}
              -
              Last report: {{ lastHostsReportTime.toLocaleString() }}
            </small>
          </v-row>
          <v-row>
              <v-col v-for="(item, index) in hostsReport" _key="index" :key="`${index}-${item.alertMessage}`" cols="12" sm="6" md="4" lg="3">
              <!-- <v-col v-for="index in 15" :key="index" cols="12" sm="6" md="4" lg="3"> -->
                <HostCard :report="item" @hostStateChanged="onHostStateChanged" />
              </v-col>
          </v-row>
        </div>

        <!-- ---------------------------------------- -->
        <!-- -----------  Event list  --------------- -->
        <!-- ---------------------------------------- -->
        <v-bottom-sheet v-model="alertSheet" style="height=80vh; overflow-y: scroll">
          <v-card>
            <v-card-title _class="justify-center">
              <span class="text-subtitle-1">Realtime Channel</span>
              <v-icon>mdi-circle-small</v-icon>
              <span :class="[socketStatusStyleClass]">{{ socketConnectionStatusDesc }}</span>
              <v-spacer />
              <!-- <v-btn icon @click="alertReset"><v-icon>mdi-notification-clear-all</v-icon></v-btn> -->

              <v-tooltip bottom :open-delay="1000">
                <template v-slot:activator="{ on, attrs }">
                  <v-btn icon @click="alertReset" v-bind="attrs" v-on="on">
                    <v-icon>mdi-notification-clear-all</v-icon>
                  </v-btn>
                </template>
                <span>Clear all messages (old messages will be removed automatically)</span>
              </v-tooltip>

              <v-btn icon @click="alertSheet =! alertSheet"><v-icon>mdi-chevron-down</v-icon></v-btn>
            </v-card-title>

            <v-divider/>
            <v-card-text style="height: 80vh; overflow-y: scroll;" class="pt-4">
              <div class="text-center" v-if="!socketConnected">
                <v-btn
                  _loading="btnSocketReconnectLoading"
                  _disabled="btnSocketReconnectLoading"
                  outlined
                  color="primary"
                  class="mb-2"
                  @click="reconnectSocket"
                >
                  Reconnect
                  <v-icon right>mdi-sync</v-icon>
                </v-btn>
              </div>

              <v-alert v-for="(item, index) in alert_messages" :key="index"
                  border="left" colored-border :color="getAlertColor(item.type)" elevation="1">
                <span v-if="Boolean(item.host)" class="text-subtile-1 font-weight-bold">
                  {{ item.host }}
                  <template v-if="Boolean(item.service)">
                    <v-icon small>mdi-circle-small</v-icon>
                    {{ item.service }}
                  </template>
                  <br/>
                </span>
                <span class="text-caption">
                  <v-icon small>mdi-calendar-clock</v-icon>
                  {{ item.time.toLocaleString() }}<br/>
                </span>
                <span v-if="Boolean(item.serviceTypeDesc)" class="text-caption">
                  <v-icon small>mdi-tag-text-outline</v-icon>
                  {{ item.serviceTypeDesc }}<br/>
                </span>
                <div class="mt-1">
                  {{ item.message }}
                </div>
              </v-alert>
            </v-card-text>
          </v-card>
        </v-bottom-sheet>

      </v-container>
    </v-main>

    <v-footer app _class="grey _dark_en-3 white--text">
      <div _class="ml-3 text-caption text-sm-body-2" class="text-caption">
          Made with <v-icon class="red--text" style="vertical-align: middle;" small>mdi-heart-outline</v-icon>
          by <a _class="white--text" href="https://vuetifyjs.com" target="_blank">Vuetify</a>
      </div>
      <v-spacer/>
      <div _class="mr-3 hidden-xs-only" class="font-italic caption">
          Version {{ APP_VERSION }}
      </div>
    </v-footer>
  </v-app>
</template>

<script>
import HostCard from './components/HostCard';
import axios from 'axios'
import {mapState} from 'vuex'

export default {
  name: 'App',

  components: {
    HostCard
  },

  data: () => ({
    APP_VERSION: process.env.VUE_APP_VERSION,
    num: 1,
    apiError: false,
    apiErrorMessage: null,
    skeletonLoading: true,
    drawer: false,
    drawerRight: false,
    alertSheet: false,
    alertCount: 0,
    alertEvents: [],

    items: [
      { title: 'Dashboard', icon: 'mdi-view-dashboard' },
      { title: 'Photos', icon: 'mdi-image' },
      { title: 'About', icon: 'mdi-help-box' },
    ],
    socketConnection: null,
    socketConnected: false,
    btnSocketReconnectLoading: false,

    hostsReport: [] /* array of host report
      [
        {
          "id": "9c8b9e3478dd15018389b2e2c8bf560e",
          "hostname": "xxx",
          "uptime": 9963646,
          "ram": 22.2,
          "cpu": 2.6000001,
          "services": 10,
          "goodServices": 9,
          "failServices": 1,
          "skipServices": 0,

          // if have alert message, we will ignore service stats
          alertMessage
        }
      ]
    */,
    lastHostsReportTime: null,
    lastReportTimeStyleClass: '',

    hostsState: {
      /* id : state */
    },
    hostsNextReportTime: {
      /* id : timestamp */
    }
  }),

  computed: {
    ...mapState(['app_dark_mode', 'alert_messages']),
    hideAlertBadge () {
      return this.alertCount == 0 && this.socketConnected
    },
    alertBadgeIconProp () {
      return this.socketConnected ? '' : {icon: 'mdi-close'}
    },
    socketConnectionStatusDesc () {
      return this.socketConnected ? 'connected' : 'not connect'
    },
    socketStatusStyleClass () {
      return this.socketConnected ? 'text-caption green--text' : 'text-caption red--text'
    }
  },

  watch: {
    alertCount: (value) => {
      if (value == 0) {
        document.title = 'CentMonit'
      } else if (value < 99) {
        document.title = `(${value}) CentMonit`
      } else {
        document.title = '(99+) CentMonit'
      }
    }
  },

  created () {
    console.log('App::created()...')
    this.$vuetify.theme.dark = this.app_dark_mode

    axios.get(`${this.$GCONFIG.api_base_url}/api/hosts/report`).then(
      response => {
        console.log('App::created() - get report response:', response)
        this.hostsReport = response.data
        this.lastHostsReportTime = new Date()
        this.hostsReport.forEach(element => {
          if (!element.alertMessage) {
            this.$set(this.hostsNextReportTime, element.id, (new Date()).getTime()+element.poll*1000)
          }
        })
      }
    ).catch(
      error => {
        console.log('App::created() - get report error:', error)
        this.apiError = true
        this.apiErrorMessage = error.message
      }
    )

    setTimeout(() => {
      this.skeletonLoading = false
    }, 1500)

    this.__init_socket_connection__()
  },

  mounted () {
    console.log('App:mounted()...')

    const sKey = 'bgJobID'
    let jobID = localStorage.getItem(sKey)

    // clear old job
    if (jobID) {
      clearInterval(parseInt(jobID, 10))
      console.log('Cleared background job with id', jobID)
    }

    // set new job
    jobID = setInterval(() => {
      let tmp = this.hostsNextReportTime
      console.warn((new Date()).toLocaleTimeString() + ' - hostsNextReportTime:', JSON.stringify(tmp))
      Object.keys(tmp).forEach(hostID => {
        let ts = tmp[hostID]
        let current = (new Date()).getTime()
        if (current > ts) {
          this.hostsReport.forEach(element => {
            if (element.id === hostID) {
              console.warn('No report from ', hostID, '-', element.hostname)
              element.alertMessage = 'No report within poll cycle'
            }
          })
        }
      })
    }, 10*1000); // 5 mins
    localStorage.setItem(sKey, jobID)
    console.log('Saved background job with id', jobID)
  },

  methods: {
    __highlight_report_time_text__ () {
      this.lastReportTimeStyleClass = 'blinking'
      setTimeout(() => {
        this.lastReportTimeStyleClass = ''
      }, 5500)
    },
    __init_socket_connection__ () {
      this.socketConnection = new WebSocket(this.$GCONFIG.socket_url)
      this.socketConnection.onopen = () => {
        console.log("App::socket::onopen...")
        this.socketConnected = true
      }
      this.socketConnection.onerror = () => {
        console.error("App::socket::error...")
        if (this.btnSocketReconnectLoading) {
          this.btnSocketReconnectLoading = false
          this.$toast.open({
            message: 'Could not establish socket connection',
            type: 'error'
          })
        }
      }
      this.socketConnection.onclose = () => {
        console.error("App::socket::close...")
        this.socketConnected = false
      }
      this.socketConnection.onmessage = (event) => {
        console.log("App::socket::onmessage - data:", event.data)
        let eventObj = JSON.parse(event.data)

        if (eventObj.channel === 'EVENT') {
          if (!this.alertSheet) {
            this.alertCount++
          }
          eventObj['time'] = new Date()
          this.$store.commit('ADD_ALERT_MESSAGE', eventObj)
          // this.alertEvents.splice(0, 0, eventObj)
          // if (this.alertEvents.length >= 150) {
          //   this.alertEvents.pop()
          // }

          // Additionally check for Monit stop
          if (eventObj.service === 'Monit') {
            this.hostsReport.forEach(element => {
              if (element.hostname === eventObj.host) {
                if (eventObj.type === 'error') {
                  element.alertMessage = eventObj.message
                  // remove this host from nextNeportTime object
                  console.warn('Var before delete:', JSON.stringify(this.hostsNextReportTime))
                  delete this.hostsNextReportTime[element.id]
                  console.warn('Var after delete:', JSON.stringify(this.hostsNextReportTime))
                } else if (eventObj.type === 'success') {
                  element.alertMessage = ''
                }
              }
            })
          }
        } else if (eventObj.channel === 'HOST') {

          this.lastHostsReportTime = new Date()
          this.__highlight_report_time_text__()

          let oldHost = false
          for (let i = 0; i < this.hostsReport.length; i++) {
            let element = this.hostsReport[i];
            if (element.id === eventObj.id) {
              console.log('App::socket::onmessage - found host to update')

              element.poll = eventObj.poll
              element.uptime = eventObj.uptime
              element.ram = eventObj.ram
              element.cpu = eventObj.cpu
              element.services = eventObj.services
              element.goodServices = eventObj.goodServices
              element.failServices = eventObj.failServices
              element.skipServices = eventObj.skipServices
              element.alertMessage = ''

              // update last host's report time
              this.$set(this.hostsNextReportTime, eventObj.id, (new Date()).getTime()+element.poll*1000)

              oldHost = true
              break
            }
          }

          if (!oldHost) {
            console.log('App::socket::onmessage - new host report')
            this.hostsReport.push({
              id: eventObj.id,
              poll: eventObj.poll,
              hostname: eventObj.hostname,
              uptime: eventObj.uptime,
              ram: eventObj.ram,
              cpu: eventObj.cpu,
              services: eventObj.services,
              goodServices: eventObj.goodServices,
              failServices: eventObj.failServices,
              skipServices: eventObj.skipServices
            })
            this.$set(this.hostsNextReportTime, eventObj.id, (new Date()).getTime()+eventObj.poll*1000)
          }
        }
      }
    },
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
    },
    changeDarkMode () {
      const darkMode = !this.app_dark_mode
      this.$vuetify.theme.dark = darkMode
      this.$store.commit('SET_DARK_MODE', darkMode)
    },
    openAlertSheet () {
      this.alertCount = 0
      this.alertSheet = !this.alertSheet
    },
    getAlertColor (itemColor) {
      switch (itemColor) {
        case 'info':
          return 'info'
        case 'success':
          return 'success'
        case 'error':
          return 'error'
        case 'warning':
          return 'warning'
        default:
          return ''
      }
    },
    alertReset () {
      this.alertCount = 0
      // this.alertEvents = []
      this.$store.commit('CLEAR_ALERT_MESSAGES')
    },
    reconnectSocket () {
      console.log('App::reconnectSocket()...')
      this.btnSocketReconnectLoading = true
      this.__init_socket_connection__()
    },
    totalGoodHosts () {
      return Object.keys(this.hostsState).filter(x => this.hostsState[x]==='good').length
    },
    onHostStateChanged (payload) {
      console.log('App::onHostStateChanged() - payload:', payload)
      this.$set(this.hostsState, payload.id, payload.status)
      // this.$set(this.hostsNextReportTime, payload.id, (new Date()).getTime())
    }
  }
};
</script>

<style scoped>

.blinking{
    animation:blinkingText 1s infinite;
}
@keyframes blinkingText{
    0%{     color: #2196F3;    }
    49%{    color: #2196F3; }
    60%{    color: transparent; }
    99%{    color:transparent;  }
    100%{   color: #2196F3;    }
}

</style>
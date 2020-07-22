<template>
  <v-card class="mx-auto" max-width="300" min-height="206" _click="test">

    <v-list-item three-line>
      <v-list-item-content>
        <v-list-item-title class="text-subtile-1 font-weight-bold">{{ report.hostname }}</v-list-item-title>
        <v-list-item-subtitle>
          <span class="text-caption">{{ uptimeDesc }} monit up</span>
          <v-icon small>mdi-circle-small</v-icon>
          <span class="text-caption">{{ pollTimeDesc }} poll-cycle</span>
          <br/>
          <span :class="[cpuTextColor]">{{ cpuDesc }} cpu</span>
          <v-icon small>mdi-circle-small</v-icon>
          <span :class="[ramTextColor]">{{ ramDesc }} ram</span>
        </v-list-item-subtitle>
      </v-list-item-content>
      <v-list-item-icon>
        <v-icon :color="hostLedDesc[0]" :class="hostLedDesc[1] === 'mdi-loading' ? 'mdi-spin' : ''">{{ hostLedDesc[1] }}</v-icon>
      </v-list-item-icon>
    </v-list-item>

    <v-card-text>
      <v-row v-if="report.alertMessage" class="text-center">
        <v-col cols="12">
          <div>{{ report.alertMessage }}</div>
        </v-col>
      </v-row>
      <v-row v-else class="text-center">
        <v-col cols="4">
          <div>
            <span class="text-h4">{{ report.goodServices }}</span>
            <span class="text-caption"> /{{ report.services }}</span>
          </div>
          <div>OK</div>
        </v-col>
        <v-col cols="4">
          <div class="text-h4">{{ report.failServices }}</div>
          <div>Fail</div>
        </v-col>
        <v-col cols="4">
          <div class="text-h4">{{ report.skipServices }}</div>
          <div>Skip</div>
        </v-col>
      </v-row>
    </v-card-text>

  </v-card>
</template>

<script>
export default {

  props: ['report'],

  data () {
    return {
      n: 0
    }
  },

  computed: {
    uptimeDesc () {
      let uptime = this.report.uptime // in seconds
      switch (true) {
        case uptime < 60:
          return `${uptime} secs`

        case uptime < 60*60:
          return `${(uptime/60).toFixed(1)} mins`

        case uptime < 60*60*24:
          return `${(uptime/(60*60)).toFixed(1)} hrs`

        default:
          return `${(uptime/(60*60*24)).toFixed(1)} days`
      }
    },

    pollTimeDesc () {
      let time = this.report.poll // in seconds
      switch (true) {
        case time < 60:
          return `${time} secs`

        case time < 60*60:
          return `${(time/60).toFixed(1)} mins`

        case time < 60*60*24:
          return `${(time/(60*60)).toFixed(1)} hrs`

        default:
          return `${(time/(60*60*24)).toFixed(1)} days`
      }
    },

    cpuDesc () {
      return this.report.cpu.toFixed(1) + '%'
    },

    ramDesc () {
      return this.report.ram.toFixed(1) + '%'
    },

    cpuTextColor () {
      let result = ''
      switch (true) {
        case this.report.cpu < 80:
          break;

        case this.report.cpu < 95:
          result = 'orange--text'
          break;

        case this.report.cpu >= 95:
          result = 'red--text'
          break;
      }
      return result
    },

    ramTextColor () {
      let result = ''
      switch (true) {
        case this.report.ram < 80:
          break;

        case this.report.ram < 95:
          result = 'orange--text'
          break;

        case this.report.ram >= 95:
          result = 'red--text'
          break;
      }
      return result
    },

    hostLedDesc () {
      let color = 'grey', icon = 'mdi-loading', _status = 'loading'

      if (this.report.alertMessage) {
        color = 'red'
        icon = 'mdi-message-alert'
      } else if (this.report.services === this.report.failServices) {
        // all services are down
        color = 'red'
        icon = 'mdi-alert'
      } else if (this.report.skipServices >= 1 || this.report.failServices >= 1) {
        // at least 1 service are down or unmonitored
        color = 'amber'
        icon = 'mdi-alert'
      } else if (this.report.services === this.report.goodServices) {
        color = 'green'
        icon = 'mdi-check-bold'
        _status = 'good'
      }

      this.$emit('hostStateChanged', {id: this.report.id, status: _status})
      return [color, icon]
    }
  },

  methods: {
    test () {

    }
  }
}
</script>
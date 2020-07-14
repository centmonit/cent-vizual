<template>
  <v-card class="mx-auto" max-width="350" @click="test">

    <v-list-item two-line>
      <v-list-item-content>
        <v-list-item-title class="text-subtile-1 font-weight-medium">{{ report.hostname }}</v-list-item-title>
        <v-list-item-subtitle>
          {{ uptimeDesc }} up
          <v-icon small>mdi-circle-small</v-icon>
          <span :class="[cpuTextColor]">{{ cpuDesc }} cpu</span>
          <v-icon small>mdi-circle-small</v-icon>
          <span :class="[ramTextColor]">{{ ramDesc }} ram</span>
        </v-list-item-subtitle>
      </v-list-item-content>
      <v-list-item-icon>
        <v-icon :color="hostLedDesc[0]">{{ hostLedDesc[1] }}</v-icon>
      </v-list-item-icon>
    </v-list-item>

    <v-card-text>
      <v-row class="text-center">
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
      let color = 'green', icon = 'mdi-check-bold'
      if (this.report.services === this.report.failServices) {
        color = 'red'
        icon = 'mdi-alert'
      } else if (this.report.skipServices >= 1 || this.report.failServices >= 1) {
        color = 'amber'
        icon = 'mdi-alert'
      }

      return [color, icon]
    }
  },

  methods: {
    test () {

    }
  }
}
</script>
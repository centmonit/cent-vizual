<template>
  <v-card class="mx-auto" max-width="350" min-height="206" _click="test">

    <v-list-item _three-line>
      <v-list-item-avatar>
        <v-icon :color="hostLedDesc[0]" :class="hostLedDesc[1] === 'mdi-loading' ? 'mdi-spin' : ''">{{ hostLedDesc[1] }}</v-icon>
      </v-list-item-avatar>

      <v-list-item-content>
        <v-list-item-title class="text-subtile-1 font-weight-bold">
          {{ report.hostname }}
        </v-list-item-title>
        <v-list-item-subtitle class="text-caption">
          <span>{{ uptimeDesc }} monit up</span>
          <v-icon small>mdi-circle-small</v-icon>
          <span>{{ pollTimeDesc }} poll-cycle</span>
          <!-- <br/>
          <span :class="[cpuTextColor]">{{ cpuDesc }} cpu</span>
          <v-icon small>mdi-circle-small</v-icon>
          <span :class="[ramTextColor]">{{ ramDesc }} ram</span> -->
        </v-list-item-subtitle>
      </v-list-item-content>

      <!-- <v-list-item-icon>
        <v-icon :color="hostLedDesc[0]" :class="hostLedDesc[1] === 'mdi-loading' ? 'mdi-spin' : ''">{{ hostLedDesc[1] }}</v-icon>
      </v-list-item-icon> -->

      <!-- <v-list-item-action>
        <v-btn icon>
          <v-icon small>mdi-information</v-icon>
        </v-btn>
      </v-list-item-action> -->
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

    <v-card-actions>
      <div>
        <span :class="[cpuTextColor]">{{ cpuDesc }} cpu</span>
        <v-icon small>mdi-circle-small</v-icon>
        <span :class="[ramTextColor]">{{ ramDesc }} ram</span>
      </div>
      <v-spacer></v-spacer>

      <v-tooltip v-model="tooltipModel" :color="hostLedDesc[0]" top>
        <template v-slot:activator="{ on, attrs }">
          <v-btn icon v-bind="attrs" v-on="on">
            <v-icon>mdi-table</v-icon>
          </v-btn>
        </template>
        <v-simple-table>
          <template v-slot:default>
            <thead>
              <tr>
                <th class="text-left">Service</th>
                <th class="text-left">Type</th>
                <th class="text-left">Monitor</th>
                <th class="text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in hostServices" :key="`${report.id}-${item.name}`">
                <td>{{ item.name }}</td>
                <td>{{ item.type }}</td>
                <td>{{ getServiceMonitorDesc(item.monitor) }}</td>
                <td>
                  <v-icon small :color="getServiceStatusColor(item.status)">
                    mdi-circle-medium
                  </v-icon>
                </td>
              </tr>
            </tbody>
          </template>
        </v-simple-table>
      </v-tooltip>

    </v-card-actions>

  </v-card>
</template>

<script>
import axios from 'axios'

export default {

  props: ['report'],

  data () {
    return {
      tooltipModel: false,
      hostServices: [
        /* {
          name: 'Frozen Yogurt',
          type: 'Abc',
          monitor: 1,
          status: 1
        } */
      ]
    }
  },

  watch: {
    tooltipModel: function (value) {
      if (value) {
        // fetch data from API
        this.__pre_fetch_services__()
      }
    },

    report: {
      handler (val) {
        // console.warn('report change:', val)
        if (val.alertMessage) {
          // clear list of service
          this.hostServices = []
        }
      },
      deep: true
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
          result = 'amber--text'
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
          result = 'amber--text'
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

  created () {
    this.__pre_fetch_services__()
  },

  methods: {
    __pre_fetch_services__ () {
      if (!this.report.alertMessage) {
        let hostID = this.report.id
        axios.get(`${this.$GCONFIG.api_base_url}/api/hosts/${hostID}/report`).then(
          response => {
            console.log('HostCard::__pre_fetch_services__() - get report response:', response)
            if (response.data.length > 0) {
              this.hostServices = []
              response.data.forEach(element => {
                this.hostServices.push(element)
              })
            }
          }
        ).catch(
          error => {
            console.log('HostCard::__pre_fetch_services__() - get report error:', error)
          }
        )
      }
    },
    getServiceStatusColor (serviceStatus) {
      switch (serviceStatus) {
        case 0:
          return 'success'

        default:
          return 'error'
      }
    },
    getServiceMonitorDesc (monitorStatus) {
      switch (monitorStatus) {
        case 1:
          return 'Yes'
        case 0:
          return 'No'
        case 2:
          return 'Initializing...'

        default:
          return 'UNKNOWN'
      }
    }
  }
}
</script>
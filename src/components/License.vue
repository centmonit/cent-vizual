<template>
  <v-dialog :value="true" @input="$emit('closeDialog')" fullscreen hide-overlay transition="dialog-bottom-transition">
    <v-card>
      <v-toolbar outlined flat>
        <v-btn icon @click="$emit('closeDialog')">
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-toolbar-title>License</v-toolbar-title>
      </v-toolbar>

      <v-card-text>
        <v-banner two-line
                  _style="margin-left: -24px; margin-right: -24px"
                  icon="mdi-certificate-outline"
                  icon-color="primary">
          <span v-html="licenseInfo"></span>
          <template v-slot:actions>
            <v-btn text @click="showRegisterDialog=true">Register</v-btn>
            <v-btn text @click="showPurchaseDialog=true" color="primary">Purchase</v-btn>
          </template>
        </v-banner>

        <div class="text-center text-h6 font-weight-bold mt-5">Pricing offers</div>
        <div class="text-center text--disabled">One time cost - 7 days email support - Free bug fixes & minor version upgrades</div>

        <v-simple-table _fixed-header _height="75vh">
          <template v-slot:default>
            <thead>
              <tr>
                <th class="text-left">Monit Agent Server</th>
                <th class="text-left">Price</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in priceTable" :key="item.name">
                <td class="text--disabled">{{ item.name }}</td>
                <td class="text--disabled">{{ item.price }}</td>
              </tr>
            </tbody>
          </template>
        </v-simple-table>
        <small>
          * If you need something not listed here, pls contact us at
           <span class="font-weight-bold">{{ VUE_APP_SUPPORT_EMAIL }}</span>
        </small>
        <input type="hidden" id="mailTo" :value="VUE_APP_SUPPORT_EMAIL" >
        <v-btn icon x-small  @click="MixClipboardCopy('mailTo')">
          <v-icon x-small>mdi-content-copy</v-icon>
        </v-btn>
      </v-card-text>

    </v-card>

    <LicenseRegister v-if="showRegisterDialog" @closeDialog="showRegisterDialog=false" />
    <LicensePurchase v-if="showPurchaseDialog" @closeDialog="showPurchaseDialog=false" />

  </v-dialog>
</template>

<script>
import LicenseRegister from '@/components/LicenseRegister'
import LicensePurchase from '@/components/LicensePurchase'
import {EventBus} from '@/main'
import axios from 'axios'
import {appMixins} from '@/app-mixins'

export default {
  components: {
    LicenseRegister,
    LicensePurchase
  },
  mixins: [appMixins],

  data: () => ({
    priceTable: [
      {
        name: 'First 2 agents',
        price: 'Free... forever!',
      }, {
        name: 'Next 3 agents',
        price: '$8.00 / agent',
      }, {
        name: 'Next 5 agents',
        price: '$6.00 / agent',
      }, {
        name: 'Next 10 agents',
        price: '$5.00 / agent',
      }, {
        name: 'Next 30 agents',
        price: '$3.00 / agent',
      }, {
        name: 'Over 50 agents',
        price: '$1.00 / agent',
      }
    ],
    showRegisterDialog: false,
    licensePayload: null, // instMacAddr; agents

    showPurchaseDialog: false
  }),

  computed: {
    licenseInfo () {
      console.log('... calculated')
      if (this.licensePayload) {
        return `PREMIUM - <span class="text--disabled">Inst. Mac</span>
        ${this.licensePayload.instMacAddr} - <span class="text--disabled">Num. Agents</span>
        ${this.licensePayload.agents}`
      } else {
        return 'FREE'
      }
    }
  },

  mounted () {
    EventBus.$on('LICENSE_UPDATED', this.__license_update_handler__)
  },

  beforeDestroy () {
    EventBus.$off('LICENSE_UPDATED', this.__license_update_handler__)
  },

  created () {
    axios.get(`${this.$GCONFIG.api_base_url}/api/license`).then(
      response => {
        console.log('License::created() - get license response:', response)
        if (response.data) {
          let data = response.data
          if (data.type === 'premium') {
            this.licensePayload = {}
            this.licensePayload.instMacAddr = data.payload.instMacAddr
            this.licensePayload.agents = data.payload.agents
          }
        }
      }
    ).catch(
      error => {
        console.log('License::created() - get license error:', error)
      }
    )
  },

  methods: {
    __license_update_handler__ (payload) {
      console.log('License::__license_update_handler__() - payload:', payload)
      this.licensePayload = payload
    }
  }
}
</script>

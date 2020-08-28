<template>
  <v-dialog :value="true" @input="$emit('closeDialog')" max-width="600px">
    <v-card v-if="!showPurchaseGuideline">

      <v-card-title>
        <span class="text-subtitle-2">
          Purchase License
        </span>
      </v-card-title>

      <v-card-text>
        <v-container>
          <v-row justify="center">

            <v-col cols="12">
              <v-btn-toggle v-model="modelLicenseType" rounded borderless dense mandatory style="width: 100%">
                <v-btn small style="width: 50%" value="NEW">
                  <span>New</span>
                </v-btn>
                <v-btn small style="width: 50%" value="UPGRADE">
                  <span>Upgrade</span>
                </v-btn>
              </v-btn-toggle>
            </v-col>

            <template v-if="modelLicenseType==='NEW'">
              <!-- Purchase new license -->
              <v-col cols="8">
                <v-select label="Instance MAC*" :items="instMacs" v-model="modelInstMac" item-value="mac"
                          persistent-hint hint="The MAC address of the CentMonit server that will be embeded to license key" >
                  <template v-slot:selection="slotProps">
                    {{ slotProps.item.nic }} - {{ slotProps.item.mac }}
                  </template>
                  <template v-slot:item="slotProps">
                    {{ slotProps.item.nic }} - {{ slotProps.item.mac }}
                  </template>
                </v-select>
              </v-col>

              <v-col cols="4">
                <v-text-field label="Monit agents*"  type="number" v-model="modelMonitAgents" clearable />
              </v-col>
            </template>
            <template v-else>
              <!-- Purchase upgraded license -->
              <v-col cols="12">
                <v-textarea label="Current license content*"
                      :placeholder="licenseContentExample"
                      _filled
                      v-model="modelLicense"
                      counter="1024"
                      clearable />
              </v-col>

              <v-col cols="6">
                <v-text-field label="Current agents*"  type="number" v-model="modelCurrentMonitAgents" clearable />
              </v-col>

              <v-col cols="6">
                <v-text-field label="Additional agents*"  type="number" v-model="modelMonitAgents" clearable />
              </v-col>
            </template>

            <v-col cols="12">
              <template>
                <span class="font-weight-bold" style="vertical-align: middle">Price:</span>
                <span style="vertical-align: middle" class="text-subtitle-1">
                  ${{ formatPrice(totalPrice) }}
                </span>
                <v-tooltip v-model="modelPriceDetail" top style="vertical-align: middle">
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn icon v-bind="attrs" v-on="on" x-small>
                      <v-icon small>mdi-table</v-icon>
                    </v-btn>
                  </template>
                  <v-simple-table>
                    <template v-slot:default>
                      <thead>
                        <tr>
                          <th class="text-left">Agent Server</th>
                          <th class="text-left">Price</th>
                          <th class="text-left">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(item, index) in pricesTableDesc" :key="index">
                          <td v-if="index===0">
                            First {{ item.agents }} agents
                          </td>
                          <td v-else>
                            Next {{ item.agents }} agents
                          </td>
                          <td>
                            ${{ item.price }}
                          </td>
                          <td>
                            ${{ `${item.amount}.00` }}
                          </td>
                        </tr>
                      </tbody>
                    </template>
                  </v-simple-table>
                </v-tooltip>
              </template>

              <template v-if="modelCurrentMonitAgents>0">
                <span style="vertical-align: middle" class="text-subtitle-1">
                  &minus; ${{ formatPrice(currentLicensePrice) }}
                </span>
                <v-tooltip v-model="modelCurrentLicensePriceDetail" top style="vertical-align: middle">
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn icon v-bind="attrs" v-on="on" x-small>
                      <v-icon small>mdi-information-outline</v-icon>
                    </v-btn>
                  </template>
                  <span>
                    The cost of current license for {{ modelCurrentMonitAgents }} agents<br/>
                    that you have already paid for
                  </span>
                </v-tooltip>

                <span style="vertical-align: middle" class="text-subtitle-1">
                  &equals; ${{ formatPrice(totalPrice - currentLicensePrice) }}
                </span>
                <v-tooltip v-model="modelExtraLicensePriceDetail" top style="vertical-align: middle">
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn icon v-bind="attrs" v-on="on" x-small>
                      <v-icon small>mdi-information-outline</v-icon>
                    </v-btn>
                  </template>
                  <span>
                    Extra cost for {{ modelMonitAgents }} additional agents
                  </span>
                </v-tooltip>
              </template>

            </v-col>

          </v-row>
        </v-container>
      </v-card-text>

      <v-card-actions>
        <v-spacer  />
        <v-btn text @click="$emit('closeDialog')">Close</v-btn>
        <v-btn text color="primary" @click="showPurchaseGuideline=true" :disabled="disableFinishButton">Finish</v-btn>
      </v-card-actions>

    </v-card>

    <v-card v-else>
      <v-card-title>
        <span class="text-subtitle-2">
          Purchase License
        </span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-row justify="center">
            <v-col cols="12" class="pb-0">
              <p class="mb-0">Pls send a purchase email as the following, then we will contact you right back with payment methods & license key:</p>
            </v-col>
            <v-col cols="12" class="pt-0">

              <input type="hidden" id="mailTo" :value="VUE_APP_SUPPORT_EMAIL" >
              <textarea type="text" style="width: 0px; height: 0px;"
                        id="mailBody" :value="generateEmailBody('\n')" />

              <p>
                <span class="text--disabled">Mail to</span> {{ VUE_APP_SUPPORT_EMAIL }}
                <v-btn icon small @click="MixClipboardCopy('mailTo')">
                  <v-icon small>mdi-content-copy</v-icon>
                </v-btn>
              </p>
              <p>
                <span class="text--disabled">Content</span>
                <v-btn icon small  @click="MixClipboardCopy('mailBody')">
                  <v-icon small>mdi-content-copy</v-icon>
                </v-btn>
              </p>
              <p v-html="generateEmailBody('<br/>')">
              </p>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>

      <v-card-actions>
        <v-spacer  />
        <v-btn text @click="$emit('closeDialog')">Close</v-btn>
      </v-card-actions>
    </v-card>

  </v-dialog>
</template>

<script>
import axios from 'axios'
import {appMixins} from '@/app-mixins'

export default {
  mixins: [appMixins],
  data: () => ({
    modelLicenseType: 'NEW',
    modelInstMac: null,
    modelCurrentMonitAgents: 0,
    modelMonitAgents: 0,
    instMacs: [
      // {
      //   nic: 'eth0',
      //   mac: 'abc'
      // }
    ],
    modelPriceDetail: false,
    modelCurrentLicensePriceDetail: false,
    modelExtraLicensePriceDetail: false,
    pricesTableConst: [
      {
        agentNum: 2,
        priceUnit: 0
      }, {
        agentNum: 3,
        priceUnit: 8
      }, {
        agentNum: 5,
        priceUnit: 6
      }, {
        agentNum: 10,
        priceUnit: 5
      }, {
        agentNum: 30,
        priceUnit: 3
      }, {
        agentNum: 50,
        priceUnit: 1
      }
    ],
    currentLicensePrice: 0,
    totalPrice: 0,
    pricesTableDesc: [
      // {
      //   agents: 2,
      //   price: 5,
      //   amount: 10
      // }
    ],
    modelLicense: null,
    licenseContentExample: `-----CENTMONIT BEGIN LICENSE-----
line 1
line 2
line 3
-----CENTMONIT END LICENSE-----
`,
    showPurchaseGuideline: false
  }),

  computed: {
    disableFinishButton () {
      if (this.modelLicenseType === 'NEW') {
        return !this.modelInstMac || this.modelMonitAgents <= 0
      } else {
        return !this.modelLicense || this.modelMonitAgents <= 0
      }
    },
    totalAgents () {
      return parseInt(this.modelMonitAgents, 10) + ((this.modelLicenseType === 'NEW') ? 0 : parseInt(this.modelCurrentMonitAgents, 10))
    }
  },

  watch: {
    modelLicenseType () {
      this.modelCurrentMonitAgents = 0
      this.modelMonitAgents = 0
    },
    _modelMonitAgents () {
      let totalAgents = parseInt(this.modelMonitAgents, 10) + ((this.modelLicenseType === 'NEW') ? 0 : parseInt(this.modelCurrentMonitAgents, 10))
      console.log('LicensePurchase::modelMonitAgents() - calculate pricing for', totalAgents, 'agents')


      let totalAmount = 0
      this.pricesTableDesc = []

      for (let index = 0; index < this.pricesTableConst.length; index++) {
        const item = this.pricesTableConst[index]
        if (totalAgents >= item.agentNum) {
          let amount = item.agentNum * item.priceUnit
          totalAmount += amount
          totalAgents -= item.agentNum

          this.pricesTableDesc.push({agents: item.agentNum, price: item.priceUnit, amount: amount})
        } else {
          if (totalAgents > 0) {
            let amount = totalAgents * item.priceUnit
            totalAmount += amount
            this.pricesTableDesc.push({agents: totalAgents, price: item.priceUnit, amount: amount})
            totalAgents = 0
          }
        }
      }

      if (totalAgents > 0) {
        let oldItem = this.pricesTableDesc[this.pricesTableDesc.length-1]
        this.pricesTableDesc[this.pricesTableDesc.length-1] = {
          agents: oldItem.agents + totalAgents,
          price: oldItem.price,
          amount: (oldItem.agents + totalAgents) * oldItem.price
        }
        totalAmount = totalAmount - oldItem.amount + (oldItem.agents + totalAgents) * oldItem.price
      }

      this.totalPrice = totalAmount
    },
    totalAgents (val) {
      let totalAmount = 0
      this.pricesTableDesc = []

      for (let index = 0; index < this.pricesTableConst.length; index++) {
        const item = this.pricesTableConst[index]
        if (val >= item.agentNum) {
          let amount = item.agentNum * item.priceUnit
          totalAmount += amount
          val -= item.agentNum

          this.pricesTableDesc.push({agents: item.agentNum, price: item.priceUnit, amount: amount})
        } else {
          if (val > 0) {
            let amount = val * item.priceUnit
            totalAmount += amount
            this.pricesTableDesc.push({agents: val, price: item.priceUnit, amount: amount})
            val = 0
          }
        }
      }

      if (val > 0) {
        let oldItem = this.pricesTableDesc[this.pricesTableDesc.length-1]
        this.pricesTableDesc[this.pricesTableDesc.length-1] = {
          agents: oldItem.agents + val,
          price: oldItem.price,
          amount: (oldItem.agents + val) * oldItem.price
        }
        totalAmount = totalAmount - oldItem.amount + (oldItem.agents + val) * oldItem.price
      }

      this.totalPrice = totalAmount
    },
    modelCurrentMonitAgents (val) {
      let totalAmount = 0
      let pricesTableDesc = []

      for (let index = 0; index < this.pricesTableConst.length; index++) {
        const item = this.pricesTableConst[index]
        if (val >= item.agentNum) {
          let amount = item.agentNum * item.priceUnit
          totalAmount += amount
          val -= item.agentNum

          pricesTableDesc.push({agents: item.agentNum, price: item.priceUnit, amount: amount})
        } else {
          if (val > 0) {
            let amount = val * item.priceUnit
            totalAmount += amount
            pricesTableDesc.push({agents: val, price: item.priceUnit, amount: amount})
            val = 0
          }
        }
      }

      if (val > 0) {
        let oldItem = pricesTableDesc[pricesTableDesc.length-1]
        pricesTableDesc[pricesTableDesc.length-1] = {
          agents: oldItem.agents + val,
          price: oldItem.price,
          amount: (oldItem.agents + val) * oldItem.price
        }
        totalAmount = totalAmount - oldItem.amount + (oldItem.agents + val) * oldItem.price
      }

      this.currentLicensePrice = totalAmount
    }
  },

  created () {
    // Pre-fetch NIC data
    axios.get(`${this.$GCONFIG.api_base_url}/api/instmacs`).then(
      response => {
        console.log('LicensePurchase::created() - Get instmacs response:', response)
        if (response.data.length > 0) {
          this.instMacs = response.data
        }
      }
    ).catch(
      error => {
        console.log('LicensePurchase::created() - Get instmacs error:', error)
      }
    )
  },

  methods: {
    priceDetailClickHandler () {
      this.showPriceDetail = !this.showPriceDetail
    },
    formatPrice(value) {
      let val = (value/1).toFixed(2)
      return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    },
    generateEmailBody (newLine /* br or \n */) {
      console.warn('this.modelLicense:', this.modelLicense)
      let body = null
      if (this.modelLicenseType === 'NEW') {
        body = `//===== PURCHASE INFO =====//${newLine}Type: NEW${newLine}Inst. MAC: ${this.modelInstMac}${newLine}Agents: ${this.modelMonitAgents}${newLine}//===== END =====//`
      } else {
        body = `//===== PURCHASE INFO =====//${newLine}Type: UPGRADE${newLine}Additional agents: ${this.modelMonitAgents}${newLine}//===== OLD LICENSE =====//${newLine}${this.modelLicense.trim().replace(/\n/g, newLine)}${newLine}//===== END =====//`
      }

      return body
    }
  }
}
</script>

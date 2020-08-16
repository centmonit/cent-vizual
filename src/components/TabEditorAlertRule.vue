<template>
  <v-dialog :value="true" @input="$emit('closeDialog')"  min-width="90vw">
    <v-stepper v-model="currentStep">
      <v-stepper-header>
        <v-stepper-step :complete="currentStep > 1" step="1">Rule name</v-stepper-step>
        <v-divider />

        <v-stepper-step :complete="currentStep > 2" step="2">Filters</v-stepper-step>
        <v-divider />

        <v-stepper-step step="3">Alert Configuration</v-stepper-step>
      </v-stepper-header>

      <v-stepper-items>
        <!-- step 1 -->
        <v-stepper-content step="1">
          <v-form>
            <v-container>
              <v-row justify="center">
                <v-col md="4" sm="12">
                  <v-text-field label="Rule name*" v-model="ruleName" clearable />
                </v-col>
              </v-row>
            </v-container>
          </v-form>

          <v-btn text color="primary" @click="currentStep = 2">Next</v-btn>
          <v-btn text @click="$emit('closeDialog')">Close</v-btn>
        </v-stepper-content>

        <!-- step 2 -->
        <v-stepper-content step="2">
          <v-form>
            <v-container>
              <v-row justify="center">
                <v-col class="text-center">
                  <small v-if="filters.length > 1">
                    These {{ filters.length }} filters will be combinated by <strong>OR</strong> operator.
                  </small>
                  <small v-else>
                    If the server's hostname or the service's name was changed, you need to reconfig this filter.
                  </small>
                </v-col>
              </v-row>

              <v-row v-for="(filter, index) in filters" :key="index" justify="center" align="center">
                <v-col md="4" sm="5" cols="12">
                  <!-- <v-select label="Host" v-model="filter.modelHost" dense :items="filter.hosts" /> -->
                  <v-combobox label="Host" v-model="filter.modelHost" dense
                              :items="selectionHostItems" clearable />
                </v-col>
                <v-col md="4" sm="5" cols="10">
                  <v-combobox label="Service(s)"
                              v-model="filter.modelService" dense
                              :items="filter.services" small-chips multiple hide-selected
                              :search-input.sync="filter.serviceSearchText"
                              :disabled="filter.disableService"
                              hint="Type or select from list" persistent-hint clearable>
                    <template v-slot:no-data>
                      <v-list-item>
                        <v-list-item-content>
                          <v-list-item-title>
                            No results matching "<strong>{{ filter.serviceSearchText }}</strong>",
                            press <code>enter</code> to create a new one.
                          </v-list-item-title>
                        </v-list-item-content>
                      </v-list-item>
                    </template>
                  </v-combobox>
                </v-col>

                <v-col md="2">
                  <v-btn v-if="index === filters.length-1" icon small
                          @click="addEventFilter" :disabled="firstHostModel==='All'">
                    <v-icon small color="primary">mdi-plus-circle</v-icon>
                  </v-btn>
                  <v-btn v-else icon small @click="removeEventFilter(index)"><v-icon small color="primary">mdi-minus-circle</v-icon></v-btn>
                </v-col>
              </v-row>
            </v-container>
          </v-form>

          <v-btn text color="primary" @click="currentStep = 3">Next</v-btn>
          <v-btn text @click="$emit('closeDialog')">Close</v-btn>
        </v-stepper-content>

        <!-- step 3 -->
        <v-stepper-content step="3">
          <v-form>
            <v-container>
              <v-row justify="center">
                <v-col md="4" sm="6" cols="12">
                  <v-select label="Alert channel*" v-model="modelAlertChannel.type" :items="alertChannels"  clearable />
                </v-col>
                <v-col md="4" sm="6" cols="12">
                  <v-select v-if="modelAlertChannel.type==='Slack Webhook'" label="Choose a channel"
                            v-model="modelAlertChannel.value"
                            :items="$store.getters.slack_iwh_alert_channel"
                            item-text="name" item-value="id" />
                  <v-select v-else-if="modelAlertChannel.type==='SMTP'" label="Choose a channel"
                            v-model="modelAlertChannel.value"
                            :items="$store.getters.smtp_alert_channel"
                            item-text="name" item-value="id" />
                </v-col>

                <v-col md="8" cols="12" v-if="modelAlertChannel.type==='SMTP'">
                  <v-textarea label="Receiver(s)"
                              v-model="modelAlertChannel.smtpReceivers"
                              placeholder="user@email.com"
                              hint="Email addresses are separated by enter (newline) character"
                              persistent-hint
                              clearable />
                </v-col>
              </v-row>
            </v-container>
          </v-form>

          <v-btn text color="primary" @click="saveRule">Save</v-btn>
          <v-btn text @click="$emit('closeDialog')">Close</v-btn>
        </v-stepper-content>

      </v-stepper-items>
    </v-stepper>
  </v-dialog>
</template>

<script>
import axios from 'axios'
import {EventBus} from '@/main'

export default {
  props: {
    mode: {
      type: String,
      default: 'NEW' // form mode NEW | EDIT
    },
    alertRuleObject: Object
  },
  data: () => ({
    currentStep: 1,

    ruleName: 'Default rule',

    filters: [
      {
        modelHost: null,
        modelService: [],

        disableService: false,
        serviceSearchText: null,
        services: null
      }
    ],

    modelAlertChannel: {
      type: null,
      name: null, // channel name
      value: null, // channel id
      smtpReceivers: null
    },
    alertChannels: ["Slack Webhook", "SMTP"], // DO NOT change these literals
    // webhookList: ["hook1", "hook2"],
    // smtpList: ["smtp1", "smtp2"]
  }),

  computed: {
    filtersModelHostArray() {
      return this.filters.map(item => item.modelHost)
    },
    filtersModelServiceArray() {
      return this.filters.map(item => item.modelService)
    },
    selectionHostItems () {
      return ['All'].concat(this.$store.getters.host_array)
    },
    firstHostModel () {
      return this.filters[0].modelHost
    }
  },

  watch: {
    filtersModelHostArray: {
      handler (newValue, oldValue) {
        //
        // Find the changed item
        //
        let changedObject = {
          item: null,
          index: -1
        }
        if (newValue.length > oldValue.length) {
          // new item was added at end of array
          changedObject.item = newValue[newValue.length-1]
          changedObject.index = newValue.length-1
        } else if (newValue.length < oldValue.length) {
          // an item was removed, nothing changed
        } else {
          for (let index = 0; index < newValue.length; index++) {
            const newItem = newValue[index]
            const oldItem = oldValue[index]
            if (newItem !== oldItem) {
              changedObject.item = newItem
              changedObject.index = index
              break
            }
          }
        }

        //
        // Processing change
        //
        console.warn('TabEditorAlertRule::watch::filtersModelHostArray - changed item:', JSON.stringify(changedObject.item), '- at index:', changedObject.index)
        if (changedObject.item === 'All') {
          this.filters[changedObject.index].modelService = ['All']
          this.filters[changedObject.index].disableService = true
          // Remove other filters
          for (let index = 0; index < this.filters.length; index++) {
            if (index !== changedObject.index) {
              this.filters.splice(index, 1)
            }
          }
        } else if (changedObject.item) {
          this.filters[changedObject.index].disableService = false

          // get service in the host
          axios.get(`${this.$GCONFIG.api_base_url}/api/hostnames/${changedObject.item}/report`).then(
            response => {
              console.log('TabEditorAlertRule::watch::filtersModelHostArray - API response:', response)
              if (response.data) {
                this.filters[changedObject.index].services = ['All'].concat(response.data)
              }
            }
          ).catch(
            error => {
              console.log('TabEditorAlertRule::watch::filtersModelHostArray - API error:', error)
            }
          )
        }
      },
      deep: true
    },
    filtersModelServiceArray: {
      handler (val) {
        console.warn('TabEditorAlertRule::watch::filtersModelServiceArray - val:', JSON.stringify(val))
        for (let index = 0; index < val.length; index++) {
          const element = val[index]
          if (element) {
            let idx = element.indexOf('All')
            if (element.length > 1 && idx > -1) {
              if (idx === element.length - 1) {
                this.filters[index].modelService = ['All']
              } else {
                this.filters[index].modelService.splice(idx, 1)
              }
            }
          } // end if
        } // end for
      },
      deep: true
    }
  },

  async created () {
    if (this.mode === 'EDIT') {
      this.ruleName = this.alertRuleObject.name
      this.modelAlertChannel = JSON.parse(this.alertRuleObject.alertConf)

      console.warn(this.alertRuleObject.filters)
      const ruleArray = JSON.parse(this.alertRuleObject.filters)

      for (let i = 0; i < ruleArray.length; i++) {
        const filter = ruleArray[i];
        console.warn('....filter:', filter)
        if (i === this.filters.length) {
          this.addEventFilter()
        }
        this.filters[i].modelHost = filter.host
        this.filters[i].modelService = filter.services

        // get service in the host
        try {
          let response = await axios.get(`${this.$GCONFIG.api_base_url}/api/hostnames/${filter.host}/report`)
          if (response) {
            console.log('TabEditorAlertRule::created() - edit mode - API response:', JSON.stringify(response.data))
            if (response.data) {
              // console.warn('DEBUG - this.filters:', JSON.stringify(this.filters), '-i:', i)
              this.filters[i].services = ['All'].concat(response.data)
            }
          }
        } catch (error) {
          console.log('TabEditorAlertRule::created() - edit mode - API error:', error)
        }
      } // end for
    } // end if
  },

  methods: {
    addEventFilter () {
      this.filters.push(
        {
          modelHost: null,
          modelService: [],

          disableService: false,
          serviceSearchText: null,
          services: null
        }
      )
    },
    removeEventFilter (index) {
      console.log('TabEditorAlertRule::removeEventFilter() - with index:', index)
      this.filters.splice(index, 1)
    },
    saveRule () {
      // console.log('TabEditorAlertRule::saveRule() - name:', this.ruleName)
      let filterList = []
      this.filters.forEach(element => {
        // console.log('TabEditorAlertRule::saveRule() - filters:', element.modelHost, '-', JSON.stringify(element.modelService))
        filterList.push({host: element.modelHost, services: element.modelService})
      })
      // console.log('TabEditorAlertRule::saveRule() - modelAlertChannel:', JSON.stringify(this.modelAlertChannel))

      // set name for channel
      let _id = this.modelAlertChannel.value // id of channel
      if (this.modelAlertChannel.type === 'SMTP') {
        this.$store.getters.smtp_alert_channel.forEach(item => {
          if (item.id === _id) {
            this.modelAlertChannel.name = item.name
          }
        })
      } else {
        this.modelAlertChannel.smtpReceivers = null
        this.$store.getters.slack_iwh_alert_channel.forEach(item => {
          if (item.id === _id) {
            this.modelAlertChannel.name = item.name
          }
        })
      } // end if

      let requestObj = {
        "name": this.ruleName,
        "filters": JSON.stringify(filterList),
        "alertConf": JSON.stringify(this.modelAlertChannel)
      }
      console.log('TabEditorAlertRule::saveRule() - requestObj:', requestObj)

      if (this.mode === 'NEW') {
        axios.post(
          `${this.$GCONFIG.api_base_url}/api/alert-rules`,
          requestObj
        ).then(
          response => {
            console.log('TabEditorAlertRule::saveRule() - create response:', response)
            if (response.data) {
              if (response.data.status === 'success') {
                EventBus.$emit('NEW_ALERT_RULE_INSERTED', {id: response.data.id, ...requestObj})
                this.$emit('closeDialog')
              } else {
                console.warn('TabEditorAlertRule::saveRule() - something is wrongs at backend')
              }
            }
          }
        ).catch(
          error => {
            console.log('TabEditorAlertRule::saveRule() - create error:', error)
          }
        )
      } else {
        axios.put(
          `${this.$GCONFIG.api_base_url}/api/alert-rules/${this.alertRuleObject.id}`,
          requestObj
        ).then(
          response => {
            console.log('TabEditorAlertRule::saveRule() - update response:', response)
            if (response.data) {
              if (response.data.status === 'success') {
                EventBus.$emit('NEW_ALERT_RULE_UPDATED', {id: this.alertRuleObject.id, ...requestObj})
                this.$emit('closeDialog')
              } else {
                console.warn('TabEditorAlertRule::saveRule() - something is wrongs at backend')
              }
            }
          }
        ).catch(
          error => {
            console.log('TabEditorAlertRule::saveRule() - update error:', error)
          }
        )
      } // end if

    }
  }
}
</script>
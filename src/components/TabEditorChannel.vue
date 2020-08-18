<template>
  <v-dialog :value="true" @input="$emit('closeDialog')" max-width="600px">
    <v-card>

      <v-card-title>
        <span class="text-subtitle-2">
          {{ mode === 'NEW' ? 'New Channel' : 'Edit Channel' }}
        </span>
        <!-- <v-spacer />
        <v-btn icon color="secondary"
                @click="editFinance()">
          <v-icon>mdi-check</v-icon>
        </v-btn> -->
      </v-card-title>

      <v-card-text>
        <v-form v-model="formValid">
          <v-container>
            <v-row justify="center">

              <v-col cols="12">
                <v-text-field label="Name*" v-model="channelObj.name" :disabled="mode==='EDIT'" clearable />
              </v-col>

              <v-col cols="12">
                <!-- <span>Type</span> -->
                <v-btn-toggle v-if="enableEditChannelType" v-model="channelObj.type" rounded borderless dense mandatory style="width: 100%">
                  <v-btn small style="width: 50%" value="SLACK_WEBHOOKS">
                    <span class="hidden-xs-only">Slack incoming webhooks</span>
                    <span class="hidden-sm-and-up">Slack</span>
                    <!-- <v-icon>mdi-slack</v-icon> -->
                  </v-btn>
                  <v-btn small style="width: 50%" value="SMTP">
                    <span class="hidden-xs-only">SMTP mail server</span>
                    <span class="hidden-sm-and-up">SMTP</span>
                    <!-- <v-icon>mdi-email</v-icon> -->
                  </v-btn>
                </v-btn-toggle>
              </v-col>

              <!-- SMTP -->
              <template v-if="channelObj.type==='SMTP'">
                <v-col cols="12" sm="6">
                  <v-text-field label="Server hostname or IP*" v-model="channelObj.host" />
                </v-col>

                <v-col cols="12" sm="6">
                  <v-text-field label="Server port*"  type="number" v-model="channelObj.port" />
                </v-col>

                <v-col cols="8" sm="8">
                  <v-text-field label="Sender Name" v-model="channelObj.customText"
                                :persistent-hint="true"
                                hint="Use this field to differentiate alert messages from different Systems/Datacenters" />
                </v-col>

                <v-col cols="4" sm="4">
                  <v-switch label="Authentication" dense v-model="channelObj.authEnable" />
                </v-col>

                <v-col cols="12" sm="6" v-if="channelObj.authEnable">
                  <v-text-field label="Username*" v-model="channelObj.user" />
                </v-col>

                <v-col cols="12" sm="6" v-if="channelObj.authEnable">
                  <v-text-field label="Password*" v-model="channelObj.passwd" />
                </v-col>
              </template>

              <!-- SLACK -->
              <template v-else>
                <v-col cols="12">
                  <v-text-field label="Sender Name" v-model="channelObj.customText"
                                :persistent-hint="true"
                                hint="Use this field to differentiate alert messages from different Systems/Datacenters" />
                </v-col>
                <v-col cols="12">
                  <v-text-field label="Webhook URL*" v-model="channelObj.webhook_url" />
                </v-col>
              </template>

            </v-row>
          </v-container>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer  />
        <v-btn text @click="$emit('closeDialog')">Close</v-btn>
        <v-btn text color="primary" @click="saveChannel">Save</v-btn>
      </v-card-actions>

    </v-card>
  </v-dialog>
</template>

<script>
import axios from 'axios'
// import {EventBus} from '@/main'

export default {
  props: {
    mode: {
      type: String,
      default: 'NEW' // form mode NEW | EDIT
    },
    channelPropObject: Object
  },
  data: () => ({
    formValid: false,
    channelObj: {
      name: 'Default channel',
      type: 'SLACK_WEBHOOKS',
      // for slack channel
      webhook_url: null,
      // for smtp channel
      host: 'smtp.gmail.com',
      port: 587,
      ssl: true,
      user: null,
      passwd: null,
      authEnable: false,
      customText: 'CentMonit'
    }
  }),

  computed: {
    enableEditChannelType () {
      return this.mode === 'NEW'
    }
  },

  created() {
    if (this.mode === 'EDIT') {
      this.channelObj.name = this.channelPropObject.name
      this.channelObj.customText = this.channelPropObject.customText
      if (this.channelPropObject.type === 1) {
        this.channelObj.type = 'SLACK_WEBHOOKS'
        this.channelObj.webhook_url = this.channelPropObject.webhook_url
      } else {
        this.channelObj.type = 'SMTP'
        this.channelObj.host = this.channelPropObject.host
        this.channelObj.port = this.channelPropObject.port
        // this.channelObj.ssl = this.channelPropObject.ssl
        this.channelObj.user = this.channelPropObject.user
        this.channelObj.passwd = this.channelPropObject.passwd
        this.channelObj.authEnable = Boolean(this.channelPropObject.user) && Boolean(this.channelPropObject.passwd)
      }
    }
  },

  methods: {
    saveChannel () {
      console.log('TabEditorChannel::saveChannel() obj:', JSON.stringify(this.channelObj))
      let requestObj = {...this.channelObj}
      if (typeof(requestObj.port) === 'string') {
        // Fix bug: desktop browser convert number field to string ???
        requestObj.port = parseInt(requestObj.port, 10)
      }

      // change request to matching API (fuck GoLang)
      requestObj.type = (requestObj.type === 'SLACK_WEBHOOKS') ? 1 : 2
      // delete requestObj.authEnable
      if (!requestObj.authEnable) {
        requestObj.user = null
        requestObj.passwd = null
      } else {
        requestObj.user = requestObj.user.trim()
        requestObj.passwd = requestObj.passwd.trim()
      }

      if (requestObj.host) {
        requestObj.host = requestObj.host.trim()
      }
      if (requestObj.webhook_url) {
        requestObj.webhook_url = requestObj.webhook_url.trim()
      }

      if (this.mode === 'NEW') {
        axios.post(
          `${this.$GCONFIG.api_base_url}/api/channels`,
          requestObj
        ).then(
          response => {
            console.log('TabEditorChannel::saveChannel() - create response:', response)
            if (response.data) {
              if (response.data.status === 'success') {
                requestObj.id = response.data.id
                // EventBus.$emit('NEW_CHANNEL_INSERTED', requestObj)
                this.$store.commit('ADD_ALERT_CHANNEL', requestObj)
                this.$emit('closeDialog')
              } else {
                console.warn('TabEditorChannel::saveChannel() - something is wrongs at backend when create')
              }
            }
          }
        ).catch(
          error => {
            console.log('TabEditorChannel::saveChannel() - create error:', error)
          }
        )
      } else {
        axios.put(
          `${this.$GCONFIG.api_base_url}/api/channels/${this.channelPropObject.id}`,
          requestObj
        ).then(
          response => {
            console.log('TabEditorChannel::saveChannel() - update response:', response)
            if (response.data) {
              if (response.data.status === 'success') {
                let payload = {
                  id: this.channelPropObject.id,
                  ...requestObj
                }
                this.$store.commit('UPDATE_ALERT_CHANNEL', payload)
                this.$emit('closeDialog')
              } else {
                console.warn('TabEditorChannel::saveChannel() - something is wrongs at backend when update')
              }
            }
          }
        ).catch(
          error => {
            console.log('TabEditorChannel::saveChannel() - update error:', error)
          }
        )
      } // end if
    }
  }
}
</script>
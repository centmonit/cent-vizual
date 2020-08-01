<template>
  <v-dialog :value="true" max-width="600px">
    <v-card>

      <v-card-title>
        <span class="text-subtitle-2">
          New Channel
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
                <v-text-field label="Name*" v-model="channelObj.name" clearable />
              </v-col>

              <v-col cols="12">
                <!-- <span>Type</span> -->
                <v-btn-toggle v-model="channelObj.type" rounded borderless dense mandatory style="width: 100%">
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

                <v-col cols="8" sm="4">
                  <v-text-field label="Server port*"  type="number" v-model="channelObj.port" />
                </v-col>

                <v-col cols="4" sm="2">
                  <v-switch label="SSL" dense v-model="channelObj.ssl" />
                </v-col>

                <v-col cols="12" sm="6">
                  <v-text-field label="Username" v-model="channelObj.user" />
                </v-col>

                <v-col cols="12" sm="6">
                  <v-text-field label="Password" v-model="channelObj.passwd" />
                </v-col>
              </template>

              <!-- SLACK -->
              <template v-else>
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
import {EventBus} from '@/main'

export default {
  data: () => ({
    formValid: false,
    channelObj: {
      name: 'Default channel',
      type: 'SLACK_WEBHOOKS',
      // for slack channel
      webhook_url: null,
      // for smtp channel
      host: null,
      port: 587,
      ssl: true,
      user: null,
      passwd: null
    }
  }),

  methods: {
    saveChannel () {
      console.log('TabEditorChannel::saveChannel() obj:', JSON.stringify(this.channelObj))
      let requestObj = {...this.channelObj}

      // change request to matching API (fuck GoLang)
      requestObj.type = (requestObj.type === 'SLACK_WEBHOOKS') ? 1 : 2
      requestObj.ssl = requestObj.ssl ? 1 : 0

      axios.post(
        `${this.$GCONFIG.api_base_url}/api/channels`,
        requestObj
      ).then(
        response => {
          console.log('TabEditorChannel::saveChannel() - get report response:', response)
          if (response.data) {
            if (response.data.status === 'success') {
              requestObj.id = response.data.id
              EventBus.$emit('NEW_CHANNEL_INSERTED', requestObj)
              this.$emit('closeDialog')
            } else {
              console.warn('TabEditorChannel::saveChannel() - something is wrongs at backend')
            }
          }
        }
      ).catch(
        error => {
          console.log('TabEditorChannel::saveChannel() - get report error:', error)
        }
      )
    }
  }
}
</script>
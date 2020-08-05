<template>
  <v-container>

    <v-row v-for="rowIndex in Math.ceil(alert_channels.length/3)" :key="`row-${rowIndex}`">
      <template v-for="colIndex in 3">
        <v-col v-if="(rowIndex-1)*3+(colIndex-1) < alert_channels.length" :key="`col-${rowIndex}-${colIndex}`">
          <v-card min-height="195" min-width="195">
            <v-card-title>
              <v-icon small left>{{ getChannelTypeIcon(alert_channels[(rowIndex-1)*3+(colIndex-1)].type) }}</v-icon>
              <span class="text-subtitle-2 d-inline-block text-truncate" :style="cardTitleNameStyle">{{ alert_channels[(rowIndex-1)*3+(colIndex-1)].name }}</span>

              <v-spacer />
              <!-- <v-btn icon><v-icon small>mdi-pencil</v-icon></v-btn> -->
              <v-btn icon @click="removeChannel(alert_channels[(rowIndex-1)*3+(colIndex-1)].id)"><v-icon small>mdi-delete</v-icon></v-btn>
            </v-card-title>

            <!-- Slack webhook -->
            <v-card-text v-if="alert_channels[(rowIndex-1)*3+(colIndex-1)].type === 1">
              <span class="text-caption text--disabled">Webhook URL</span>&nbsp;&nbsp;&nbsp;
              <span class="text-body-2">{{ alert_channels[(rowIndex-1)*3+(colIndex-1)].webhook_url }}</span>
            </v-card-text>

            <!-- SMTP -->
            <v-card-text v-else>
              <div>
                <span class="text-caption text--disabled">Host</span>&nbsp;&nbsp;&nbsp;
                <span class="text-body-2">{{ alert_channels[(rowIndex-1)*3+(colIndex-1)].host }}</span>
              </div>
              <div>
                <span class="text-caption text--disabled">Port</span>&nbsp;&nbsp;&nbsp;
                <span class="text-body-2">{{ alert_channels[(rowIndex-1)*3+(colIndex-1)].port }}</span>
              </div>
              <div>
                <span class="text-caption text--disabled">SSL</span>&nbsp;&nbsp;&nbsp;
                <span class="text-body-2">
                  {{ alert_channels[(rowIndex-1)*3+(colIndex-1)].ssl ? 'Yes' : 'No' }}
                </span>
              </div>
              <div>
                <span class="text-caption text--disabled">Username</span>&nbsp;&nbsp;&nbsp;
                <span class="text-body-2">
                  {{ alert_channels[(rowIndex-1)*3+(colIndex-1)].user ? alert_channels[(rowIndex-1)*3+(colIndex-1)].user : 'N/A' }}
                </span>
              </div>
              <div>
                <span class="text-caption text--disabled">Password</span>&nbsp;&nbsp;&nbsp;
                <span class="text-body-2">
                  {{ alert_channels[(rowIndex-1)*3+(colIndex-1)].passwd ? alert_channels[(rowIndex-1)*3+(colIndex-1)].passwd : 'N/A' }}
                </span>
              </div>
            </v-card-text>

          </v-card>
        </v-col>
      </template>
    </v-row>

  </v-container>
</template>

<script>
import axios from 'axios'
// import {EventBus} from '@/main'
import {mapState} from 'vuex'

export default {
  data: () => ({
  }),

  computed: {
    ...mapState(['alert_channels']),
    cardTitleNameStyle () {
      let result = 'max-width: 120px'
      switch (this.$vuetify.breakpoint.name) {
        case 'lg':
          result = 'max-width: 16vw'
          break
        case 'xl':
          result = 'max-width: 17vw'
          break
      }
      return result
    }
  },

  created () {
    console.log('TabViewChannel::created()...')

    // EventBus.$on('NEW_CHANNEL_INSERTED', (item) => {
    //   console.warn('TabViewChannel::created() - event NEW_CHANNEL_INSERTED - item:', item)
    //   this.channels.splice(0, 0, item)
    // })
  },

  methods: {
    getChannelTypeIcon (type) {
      switch (type) {
        case 1:
          return 'mdi-slack'
        case 2:
          return 'mdi-email'
      }
    },
    removeChannel (id) {
      console.log('TabViewChannel::removeChannel() with id:', id)
      axios.delete(`${this.$GCONFIG.api_base_url}/api/channels/${id}`).then(
        response => {
          console.log('TabViewChannel::removeChannel() - get report response:', response)
          if (response.data) {
            if (response.data.status === 'success') {
              this.$store.commit('REMOVE_ALERT_CHANNEL', id)
            } else {
              console.warn('TabViewChannel::removeChannel() - something is wrongs at backend')
            }
          }
        }
      ).catch(
        error => {
          console.log('TabViewChannel::removeChannel() - get report error:', error)
        }
      )
    }
  }
}
</script>
<template>
  <v-dialog :value="true" @input="$emit('closeDialog')" fullscreen hide-overlay transition="dialog-bottom-transition">
    <v-card>
      <v-toolbar outlined>
        <v-btn icon @click="$emit('closeDialog')">
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-toolbar-title>Settings</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-toolbar-items>
          <v-btn text @click="createSomethingNew">
            Add new
            <v-icon right>mdi-plus-circle-outline</v-icon>
          </v-btn>
        </v-toolbar-items>
      </v-toolbar>

      <v-tabs v-model="currentTab" right>
        <v-tab href="#tabAlertRule">Alert Rules</v-tab>
        <v-tab href="#tabChannel">Alert Channels</v-tab>
        <!-- <v-tab href="#tabMailGroup">Mail Groups</v-tab> -->
      </v-tabs>

      <v-card-text>
        <v-tabs-items v-model="currentTab">
          <!-- tab 1 -->
          <v-tab-item value="tabAlertRule">
            <TabViewAlertRule />
          </v-tab-item>

          <!-- tab 2 -->
          <v-tab-item value="tabChannel">
            <TabViewChannel />
          </v-tab-item>

          <!-- tab 3 -->
          <v-tab-item value="tabMailGroup">
            tabMailGroup
          </v-tab-item>
        </v-tabs-items>
      </v-card-text>

    </v-card>

    <component
        v-if="showEditForm"
        :is="currentEditForm"
        @closeDialog="showEditForm = false"/>
  </v-dialog>
</template>

<script>
import TabViewChannel from '@/components/TabViewChannel'
import TabViewAlertRule from '@/components/TabViewAlertRule'
import axios from 'axios'

export default {
  components: {
    TabViewChannel,
    TabViewAlertRule
  },

  data: () => ({
    currentTab: 'tabAlertRule',
    showEditForm: false,
    currentEditForm: null
  }),

  mounted () {
    // Pre-fetch channel data to use for rule creation form
    axios.get(`${this.$GCONFIG.api_base_url}/api/channels`).then(
      response => {
        console.log('TabViewChannel::created() - api response:', response)
        if (response.data.length > 0) {
          this.$store.commit('PURGE_ALERT_CHANNEL')
          response.data.forEach(element => {
            this.$store.commit('ADD_ALERT_CHANNEL', element)
          })
        }
      }
    ).catch(
      error => {
        console.log('TabViewChannel::created() - api error:', error)
      }
    )
  },

  methods: {
    createSomethingNew () {
      if (this.currentTab === 'tabChannel') {
        this.currentEditForm = () => import(/* webpackChunkName: "TabEditorChannel" */ '@/components/TabEditorChannel')
        this.showEditForm = true
      } else if (this.currentTab === 'tabAlertRule') {
        this.currentEditForm = () => import(/* webpackChunkName: "TabEditorAlertRule" */ '@/components/TabEditorAlertRule')
        this.showEditForm = true
      }
    }
  }
}
</script>

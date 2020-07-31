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
        <v-tab href="#tabChannel">Channels</v-tab>
        <v-tab href="#tabMailGroup">Mail Groups</v-tab>
      </v-tabs>

      <v-card-text>
        <v-tabs-items v-model="currentTab">
          <!-- tab 1 -->
          <v-tab-item value="tabAlertRule">
            tabAlert
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

export default {
  components: {
    TabViewChannel
  },

  data: () => ({
    currentTab: 'tabAlertRule',
    showEditForm: false,
    currentEditForm: null
  }),

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

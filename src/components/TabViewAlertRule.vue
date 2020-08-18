<template>
<div>
  <v-simple-table fixed-header height="75vh">
    <template v-slot:default>
      <thead>
        <tr>
          <th class="text-left">Rule Name</th>
          <th class="text-left">Filters</th>
          <th class="text-left">Alert Configuration</th>
          <th class="text-left">Actions</th>
          <th class="text-left">Active</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in alertRules" :key="`item.name${index}`">
          <td class="text-caption">{{ item.name }}</td>
          <td class="text-caption" v-html="getDisplayTextOfFilters(index)"></td>
          <td class="text-caption" v-html="getDisplayTextOfAlertConf(index)"></td>
          <td>
            <v-btn icon @click="editRow(item.id, index)"><v-icon small>mdi-pencil</v-icon></v-btn>
            <v-btn icon @click="deleteRow(item.id, index)"><v-icon small>mdi-delete</v-icon></v-btn>
          </td>
          <td>
            <v-switch dense v-model="item.active" />
          </td>
        </tr>
      </tbody>
    </template>
  </v-simple-table>

  <TabEditorAlertRule v-if="showEditForm" @closeDialog="showEditForm=false"
                      mode="EDIT" :alertRuleObject="editedObject" />

  <ConfirmDialog v-if="showDeleteConfirm"
                @closeDialog="showDeleteConfirm=false"
                @agreeConfirm="processAgreeConfirm" />
</div>
</template>

<script>
import axios from 'axios'
import TabEditorAlertRule from '@/components/TabEditorAlertRule'
import ConfirmDialog from '@/components/ConfirmDialog'
import {EventBus} from '@/main'

export default {
  components: {
    TabEditorAlertRule,
    ConfirmDialog
  },

  data: () => ({
    alertRules: [],
    showEditForm: false,
    editedObject: {},
    showDeleteConfirm: false,
    deletionPayload: {}
  }),

  computed: {
    ruleActiveArray () {
      return this.alertRules.map(item => item.active)
    }
  },

  watch: {
    ruleActiveArray: {
      handler (newValue, oldValue) {
        if (newValue.length === oldValue.length) {
          let changedObject = {
            index: -1,
            value: null
          }
          for (let index = 0; index < newValue.length; index++) {
            const newItem = newValue[index]
            const oldItem = oldValue[index]
            if (newItem !== oldItem) {
              changedObject.value = newItem
              changedObject.index = index
              break
            }
          }
          console.log('TabViewAlertRule::watch::ruleActiveArray - changed object:'
          , JSON.stringify(changedObject))
          this.changeActiveState(changedObject)
        } else {
          console.log('TabViewAlertRule::watch::ruleActiveArray - skip inserted item or first load')
        } // end if
      },
      deep: true
    }
  },

  created () {
    axios.get(`${this.$GCONFIG.api_base_url}/api/alert-rules`).then(
      response => {
        console.log('TabViewAlertRule::created() - api response:', response)
        if (response.data.length > 0) {
          response.data.forEach(element => {
            if (element.active === 1) {
              element.active = true
            } else {
              element.active = false
            }
            this.alertRules.push(element)
          })
        }
      }
    ).catch(
      error => {
        console.log('TabViewAlertRule::created() - api error:', error)
      }
    )
  },

  mounted () {
    EventBus.$on('NEW_ALERT_RULE_INSERTED', this.__rule_insert_handler__)
    EventBus.$on('NEW_ALERT_RULE_UPDATED', this.__rule_update_handler__)
  },

  beforeDestroy () {
    EventBus.$off('NEW_ALERT_RULE_INSERTED', this.__rule_insert_handler__)
    EventBus.$off('NEW_ALERT_RULE_UPDATED', this.__rule_update_handler__)
  },

  methods: {
    __rule_insert_handler__ (item) {
      item.active = true
      console.warn('TabViewAlertRule::__rule_insert_handler__() - item:', item)
      this.alertRules.splice(0, 0, item)
    },
    __rule_update_handler__ (item) {
      console.warn('TabViewAlertRule::__rule_update_handler__() - item:', item)
      this.alertRules.forEach(rule => {
        if (rule.id === item.id) {
          rule.name = item.name
          rule.filters = item.filters
          rule.alertConf = item.alertConf
        }
      })
    },

    getDisplayTextOfFilters (index) {
      let jsonString = this.alertRules[index].filters
      let stringResult = ''
      JSON.parse(jsonString).forEach(element => {
        if (element.services.length === 1) {
          stringResult += `<span class="text--disabled">Host</span> ${element.host}<span class="text--disabled"> - Services</span> ${element.services}<br/>`
        } else {
          let serviceListTag = '<ul>'
          element.services.forEach(service => {
            serviceListTag += `<li>${service}</li>`
          })
          serviceListTag += '</ul>'
          stringResult += `<span class="text--disabled">Host</span> ${element.host}<span class="text--disabled"> - Services</span> ${serviceListTag}`
        }
      })
      return stringResult
    },
    getDisplayTextOfAlertConf (index) {
      let alertObj = JSON.parse(this.alertRules[index].alertConf)
      let stringResult = ''
      if (alertObj.type === 'SMTP') {
        stringResult = `<span class="text--disabled">SMTP</span> ${alertObj.name}<br/>`
        stringResult += '<span class="text--disabled">Receivers</span><br/>'
        stringResult += '<ul>'
        alertObj.smtpReceivers.split('\n').forEach(email => {
          stringResult += `<li>${email}</li>`
        })
        stringResult += '</ul>'
      } else {
        stringResult = `<span class="text--disabled">Slack webhook</span> ${alertObj.name}`
      }
      return stringResult
    },
    editRow (id, index) {
      this.showEditForm = true
      this.editedObject = this.alertRules[index]
    },
    deleteRow (id, index) {
      this.showDeleteConfirm = true
      this.deletionPayload = {
        id: id,
        index: index
      }
    },
    processAgreeConfirm () {
      if (this.deletionPayload.id && this.deletionPayload.index >= 0) {
        this.__delete_row_helper__(this.deletionPayload.id, this.deletionPayload.index)
      }
      this.showDeleteConfirm = false
    },
    __delete_row_helper__ (id, index) {
      axios.delete(`${this.$GCONFIG.api_base_url}/api/alert-rules/${id}`).then(
        response => {
          console.log('TabViewAlertRule::deleteRow() - get report response:', response)
          if (response.data) {
            if (response.data.status === 'success') {
              this.alertRules.splice(index, 1)
            } else {
              console.warn('TabViewAlertRule::deleteRow() - something is wrongs at backend')
            }
          }
        }
      ).catch(
        error => {
          console.log('TabViewAlertRule::deleteRow() - get report error:', error)
        }
      )
    },
    changeActiveState ({index, value}) {
      console.log('TabViewAlertRule::changeActiveState() - index:', index, '- item:', value)
      let newActiveState = value ? 1 : -1
      let requestConfig = {
        headers: {
          'Content-Type': 'text/plain'
        }
      }
      axios.put(
        `${this.$GCONFIG.api_base_url}/api/alert-rules/${this.alertRules[index].id}/active`,
        newActiveState,
        requestConfig
      ).then(
        response => {
          console.log('TabViewAlertRule::changeActiveState() - api response:', response)
          if (response.data) {
            if (!response.data.status === 'success') {
              console.warn('TabViewAlertRule::changeActiveState() - something is wrongs at backend')
            }
          }
        }
      ).catch(
        error => {
          console.log('TabViewAlertRule::changeActiveState() - api error:', error)
        }
      )
    }
  }
}
</script>
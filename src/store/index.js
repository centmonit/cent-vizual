import Vue from 'vue'
import Vuex from 'vuex'
import VuexPersist from 'vuex-persist'

Vue.use(Vuex)

const vuexPersist = new VuexPersist({
  key: 'app-store',
  storage: window.localStorage,
  reducer: state => ({
    app_dark_mode: state.app_dark_mode,
    alert_messages: state.alert_messages
  })
})

export default new Vuex.Store({
  plugins: [vuexPersist.plugin],
  state: {
    app_dark_mode: false, // day/night mode
    alert_messages: [],
    hostnames: [],
    alert_channels: []
  },
  mutations: {
    SET_DARK_MODE (state, payload /* bool */) {
      state.app_dark_mode = payload
    },
    ADD_ALERT_MESSAGE (state, payload) {
      let MAX_LENGTH = 99
      state.alert_messages.splice(0, 0, payload)
      if (state.alert_messages.length > MAX_LENGTH) {
        state.alert_messages.pop()
      }
    },
    CLEAR_ALERT_MESSAGES (state) {
      state.alert_messages = []
    },
    ADD_HOST (state, payload /* hostname: string */) {
      if (state.hostnames.indexOf(payload) === -1) {
        state.hostnames.splice(0, 0, payload)
      }
    },
    PURGE_ALERT_CHANNEL (state) {
      state.alert_channels = []
    },
    ADD_ALERT_CHANNEL (state, payload /* channel object */) {
      state.alert_channels.splice(0, 0, payload)
    },
    REMOVE_ALERT_CHANNEL (state, id) {
      for (let index = 0; index < state.alert_channels.length; index++) {
        if (state.alert_channels[index].id === id) {
          state.alert_channels.splice(index, 1)
          break
        }
      }
    }
  },
  getters: {
    host_array: state => state.hostnames,
    slack_iwh_alert_channel (state) {
      let result = []
      state.alert_channels.forEach(item => {
        if (item.type === 1) {
          result.push({
            id: item.id,
            name: item.name
          })
        }
      })
      return result
    },
    smtp_alert_channel (state) {
      let result = []
      state.alert_channels.forEach(item => {
        if (item.type === 2) {
          result.push({
            id: item.id,
            name: item.name
          })
        }
      })
      return result
    }
  },
  actions: {
  },
  modules: {
  }
})

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
    alert_messages: []
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
    }
  },
  actions: {
  },
  modules: {
  }
})

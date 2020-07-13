import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'

Vue.config.productionTip = false

import VueToast from 'vue-toast-notification'
// import 'vue-toast-notification/dist/theme-default.css'
import 'vue-toast-notification/dist/theme-sugar.css'

Vue.use(VueToast, {
  // One of options
  type: 'success',
  position: 'top-right',
  duration: 300000,
  pauseOnHover: true
})

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')

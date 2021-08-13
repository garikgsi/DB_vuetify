import Vue from 'vue'
import App from './App.vue'
import store from './store/store.js'
import router from './router.js'
import vuetify from './plugins/vuetify'
import VueMomentLib from 'vue-moment-lib'
import { VueMaskDirective } from 'v-mask'
import ABPApp from './components/ABPApp.vue'
import ABPPrintMenu from './components/Misc/ABPPrintMenu'
import { Plugin } from 'vue2-storage'

const debug = true

Vue.directive('mask', VueMaskDirective)
Vue.config.productionTip = debug
Vue.use(VueMomentLib)
Vue.config.devtools = debug;
Vue.use( Plugin )
Vue.use(Plugin, {
    prefix: 'abp_',
    driver: 'local',
    ttl: 30 * 60 * 60 * 24 * 1000 // 1 месяц
})

const axios = require('axios').default;


new Vue({
  el: '#app',
  store,
  router,
  vuetify,
  components: {
    'abp-app' : ABPApp,
    'abp-print-menu' : ABPPrintMenu
  },
  created() {
    this.$moment.locale('ru')

    // авторизация из сохраненного токена в локальном хранилище
    const userData = this.$storage.get('user')
    if (userData) {
        // this.$store.commit('SET_USER',userData)
        this.$store.dispatch('setUser',userData)
        axios.interceptors.response.use(
            response => response,
            error => {
                if (error.response.status === 401) {
                    this.store.dispatch('logout')
                }
                return Promise.reject(error)
            }
        )
    }
  },
  render: h => h(App)
})
// .$mount('#app')

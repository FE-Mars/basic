import Vue from 'vue'
import App from './App.vue'
import router from './router/index'
import store from './store/index'

import api from './api'
Vue.prototype.$api = api

import dayjs from 'dayjs'
Vue.prototype.$dayjs = dayjs

import auth from './util/auth'
Vue.use(auth)

import cookies from 'vue-cookies'
Vue.use(cookies)

import VueMeta from 'vue-meta'
Vue.use(VueMeta)

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import '@icon-park/vue/styles/index.css'
Vue.use(ElementUI, { size: 'small' })

import hotkeys from 'hotkeys-js'
Vue.prototype.$hotkeys = hotkeys

// 全局组件自动注册
import './components/autoRegister'

// 自动加载 svg 图标
const req = require.context('./assets/icons', false, /\.svg$/)
const requireAll = requireContext => requireContext.keys().map(requireContext)
requireAll(req)

import './assets/styles/reset.scss'
import './assets/styles/style.scss'

import './mock'

Vue.config.productionTip = false

Vue.prototype.$custom_data = {
    payload_options: ["SXI", "MAG", "UVI", "PLM"].map(item => ({ label: item, value: item })),
    level_options: ["L0", "L1", "L2", "L3", "L4"].map(item => ({ label: item, value: item })),
}

Vue.prototype.$eventBus = new Vue({
    router,
    store,
    render: h => h(App)
}).$mount('#app')

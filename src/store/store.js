import Vue from 'vue'
import Vuex from 'vuex'

import cfg from '../config.js'

// modules
import user from './modules/user.js'
import app from './modules/app.js'
import table from './modules/table.js'
import permissions from './modules/permissions.js'
import stock_balance from './modules/tables/stock_balance.js'
import serials from './modules/tables/serials.js'
import groups from './modules/groups.js'
import ui from './modules/ui.js'

Vue.use(Vuex)

export default new Vuex.Store({
    modules: {
        user,
        app,
        table,
        permissions,
        stock_balance,
        groups,
        serials,
        ui
    },

    state: {
        // конфиг axios
        axiosCfg: {
            baseURL: cfg.baseURL,
            // timeout: 20000,
            withCredentials: false,
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            'content-type': 'multipart/form-data'
        },

        // токен для сервисов API daData
        daDataToken: cfg.daDataToken,
    },
    mutations: {
        SET_AXIOS_CFG(state, payload) {
            state.axiosCfg = payload
        },
        SET_ERROR(state, payload) {
            state.error = payload
        },
    },
    actions: {
        setError({ commit }, payload) {
            commit('SET_ERROR', payload)
        },
    },
    getters: {
        // url сервера api
        baseURL(state) {
            return `${state.axiosCfg.baseURL}/api/v1/`
        },
        isError(state) {
            if (state.error) return true; else return false
        },
        error(state) {
            return state.error
        },
        axiosCfg(state) {
            return state.axiosCfg
        },
    }
});

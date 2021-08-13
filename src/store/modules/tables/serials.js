import Services from '../../../siteAdminServices.js'
import Vue from 'vue'

export default {

    state: {
        numbers: {},
        serials: {}
    },

    mutations: {
        SET_SERIALS_DATA(state, payload) {
            if (state.numbers[payload.table]) {
                if (state.numbers[payload.table][payload.id]) {
                    state.numbers[payload.table][payload.id] = payload.data
                } else {
                    Vue.set(state.numbers[payload.table], payload.id, payload.data)
                }
            } else {
                let data = {}
                data[payload.id] = payload.data
                Vue.set(state.numbers, payload.table, data)
            }
        },
        SET_SERIAL_LIST_DATA(state, payload) {
            if (state.serials[payload.table]) {
                if (state.serials[payload.table][payload.id]) {
                    state.serials[payload.table][payload.id] = payload.data
                } else {
                    Vue.set(state.serials[payload.table], payload.id, payload.data)
                }
            } else {
                let data = {}
                data[payload.id] = payload.data
                Vue.set(state.serials, payload.table, data)
            }
        },
    },

    actions: {
        // получаем список всех возможных серийников для продажи/перемещения/производства для записи
        getSerialList({commit, dispatch}, payload) {
            dispatch('setLoading', true)
            return new Promise((resolve, reject) => {
                let url = `/api/v1/serials_list/${payload.table}/${payload.id}`
                Services.request(url,'get')
                .then((response)=> {
                    if (response.data.data) {
                        let commitData = {table: payload.table, id:payload.id, data:response.data.data}
                        dispatch('setInformation', 'Серийные номера загружены')
                        dispatch('setLoading', false)
                        commit('SET_SERIAL_LIST_DATA',commitData)
                        resolve(response.data.data)
                    } else {
                        dispatch('setInformation', {color:'error', text:'Ошибка загрузки серийных номеров'})
                        dispatch('setLoading', false)
                        reject([])
                    }
                })
                .catch((e)=>{
                    dispatch('appErrorException', e)
                    dispatch('setLoading', false)
                    reject(e)
                })
            })

        },
        // получаем список серийников для строки приходного документа
        getSerials({commit, dispatch}, payload) {
            dispatch('setLoading', true)
            return new Promise((resolve, reject) => {
                let url = `/api/v1/serials/${payload.table}/${payload.id}`
                Services.request(url,'get')
                    .then((response)=> {
                        if (response.data.data) {
                            let commitData = {table: payload.table, id:payload.id, data:response.data.data}
                            dispatch('setInformation', 'Серийные номера для записи успешно получены')
                            dispatch('setLoading', false)
                            commit('SET_SERIALS_DATA',commitData)
                            resolve(response.data.data)
                        } else {
                            dispatch('setInformation', {color:'error', text:'Серийные номера не получены'})
                            dispatch('setLoading', false)
                            reject([])
                        }
                    })
                    .catch((e)=>{
                        dispatch('appErrorException', e)
                        dispatch('setLoading', false)
                        reject(e)
                    })
                })
        },
        // сопоставляем список серийников записи
        setSerials({commit, dispatch}, payload) {
            dispatch('setLoading', true)
            return new Promise((resolve, reject) => {
                let url = `/api/v1/serials/${payload.table}/${payload.id}`
                Services.request(url,'put', payload.data)
                    .then((response)=> {
                        if (response.data.data) {
                            let commitData = {table: payload.table, id:payload.id, data:response.data.data}
                            dispatch('setInformation', 'Серийные номера для записи сохранены')
                            dispatch('setLoading', false)
                            commit('SET_SERIALS_DATA',commitData)
                            resolve(response.data.data)
                        } else {
                            dispatch('setInformation', {color:'error', text:'Серийные номера не сохранены'})
                            dispatch('setLoading', false)
                            reject(response)
                        }
                    })
                    .catch((e)=>{
                        dispatch('appErrorException', e)
                        dispatch('setLoading', false)
                        reject(e)
                    })
                })
        }
    }
}

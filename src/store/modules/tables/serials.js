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
        getSerialList({commit, dispatch, getters}, {table,id}) {
            return new Promise((resolve, reject)=>{
                let url = `${getters.baseURL}serials_list/${table}/${id}`
                dispatch('request',{url, method:'get'})
                    .then(({is_error, error, data})=>{
                        if (is_error) {
                            dispatch('pushError', error)
                            reject(error)
                        } else {
                            commit('SET_SERIAL_LIST_DATA',{table, id, data})
                            resolve(data)
                        }
                    })
                    .catch(e=>{
                        dispatch('pushError', `Ошибка загрузки серийных номеров`)
                        reject(e)
                    })
            })
        },
        // получаем список серийников для строки приходного документа
        getSerials({commit, dispatch, getters}, {table,id}) {
            return new Promise((resolve, reject)=>{
                let url = `${getters.baseURL}serials/${table}/${id}`
                dispatch('request',{url, method:'get'})
                    .then(({is_error, error, data})=>{
                        if (is_error) {
                            dispatch('pushError', error)
                            reject(error)
                        } else {
                            commit('SET_SERIALS_DATA',{table, id, data})
                            resolve(data)
                        }
                    })
                    .catch(e=>{
                        dispatch('pushError', `Серийные номера не получены`)
                        reject(e)
                    })
            })
        },
        // сопоставляем список серийников записи
        setSerials({commit, dispatch, getters}, {table, id, data}) {
            return new Promise((resolve, reject)=>{
                let url = `${getters.baseURL}serials/${table}/${id}`
                dispatch('request',{url, method:'put', data})
                    .then(({is_error, error, data})=>{
                        if (is_error) {
                            dispatch('pushError', error)
                            reject(error)
                        } else {
                            commit('SET_SERIALS_DATA',{table, id, data})
                            resolve(data)
                        }
                    })
                    .catch(e=>{
                        dispatch('pushError', `Серийные номера не сохранены`)
                        reject(e)
                    })
            })
        }
    }
}

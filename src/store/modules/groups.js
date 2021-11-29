import Vue from 'vue'

export default {

    state: {
        // все группы для таблицы
        groups: {},
        // значения для записи
        groups_values: {},
    },

    mutations: {
        SET_GROUPS(state, payload) {
            if (state.groups[payload.table]) {
                state.groups[payload.table] = payload.data
            } else {
                Vue.set(state.groups, payload.table, payload.data)
            }
        },
        SET_GROUP_VALUES(state, payload) {
            if (state.groups_values[`${payload.table}_${payload.id}`]) {
                state.groups_values[`${payload.table}_${payload.id}`] = payload.data
            } else {
                Vue.set(state.groups_values, `${payload.table}_${payload.id}`, payload.data)
            }
        },
    },
    actions: {
        
        // получить список групп для таблицы
        getGroups({commit, dispatch, getters}, table) {
            return new Promise((resolve, reject)=>{
                let url = `${getters.baseURL}groups/${table}`
                dispatch('request',{url, method:'get'})
                    .then(({is_error, error, data})=>{
                        if (is_error) {
                            dispatch('pushError', error)
                            reject(error)
                        } else {
                            commit('SET_GROUPS',{table, data})
                        }
                        resolve(data)
                    })
                    .catch(e=>{
                        reject(e)
                    })
            })
        },

        // получить все возможные значения групп для записи
        getGroupValues({commit, dispatch, getters}, {table, id}) {
            return new Promise((resolve, reject)=>{
                let url = `${getters.baseURL}${table}/${id}?extensions=groups`
                dispatch('request',{url, method:'get'})
                    .then(({is_error, error, data})=>{
                        if (is_error) {
                            dispatch('pushError', error)
                            reject(error)
                        } else {
                            commit('SET_GROUP_VALUES', {table, id, data:data.groups})
                        }
                        resolve(data)
                    })
                    .catch(e=>{
                        reject(e)
                    })
            })
        },

        // установить значения групп для записи
        setGroupValues({commit}, payload) {
            commit('SET_GROUP_VALUES', {table:payload.table, id:payload.id, data:payload.vals})
        },

        // сохранить группы для записи
        saveGroups({dispatch, getters}, {table, id, data}) {
            return new Promise((resolve, reject)=>{
                let url = `${getters.baseURL}groups/${table}/${id}`
                dispatch('request',{url, method:'post', data:{data}})
                    .then(({is_error, error, data})=>{
                        if (is_error) {
                            dispatch('pushError', error)
                            reject(error)
                        } else {
                            // обновим данные
                            dispatch('getGroupValues', {table, id})
                            dispatch('getGroups', table)
                            resolve(data)
                        }
                    })
                    .catch(e=>{
                        reject(e)
                    })
            })
        }


    },

    getters: {

    }
}

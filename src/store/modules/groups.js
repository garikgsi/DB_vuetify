import Services from '../../siteAdminServices.js'
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
        getGroups({commit, dispatch}, table) {
            dispatch('setLoading', true)
            return new Promise((resolve, reject) => {
                let url = `/api/v1/groups/${table}`
                Services.request(url, 'get')
                .then((response)=>{
                    if (response.data.data) {
                        let groups = response.data.data
                        commit('SET_GROUPS',{table:table, data:groups})
                        dispatch('setInformation', 'Список групп успешно загружен')
                    } else {
                        dispatch('setInformation', {color:'error',timeout:-1, text:response.data.error[0] || 'Не удалось получить список групп'})
                    }
                    resolve(response)
                })
                .catch((e)=>{
                    if (e.response) {
                        let code = e.response.status
                        let errData = e.response.data
                        switch (code) {
                            case 403: {
                                dispatch('setInformation', {color:'error', timeout:-1, text:errData.error[0] || 'Ошибка прав доступа'})
                            } break;
                            default: {
                                dispatch('setInformation', {color:'error',timeout:-1, text:errData.error[0] || 'Неизвестная ошибка сервера'})
                            }
                        }
                    } else {
                        dispatch('setInformation', {color:'error',timeout:-1, text:'Неизвестный ответ сервера'})
                    }
                    reject(e)
                })
                .finally(()=>{
                    dispatch('setLoading', false)
                })
            })
        },
        getGroupValues({commit, dispatch}, payload) {
            dispatch('setLoading', true)
            return new Promise((resolve, reject) => {
                let url = `/api/v1/${payload.table}/${payload.id}?extensions=groups`
                Services.request(url, 'get')
                .then((response)=>{
                    if (response.data.data) {
                        let vals = []
                        if (response.data.data.groups) vals = response.data.data.groups
                        commit('SET_GROUP_VALUES', {table:payload.table, id:payload.id, data:vals})
                        dispatch('setInformation', 'Группы для записи загружены')
                    } else {
                        dispatch('setInformation', {color:'error',timeout:-1, text:response.data.error[0] || 'Не удалось получить группы для записи'})
                    }
                    resolve(response)
                })
                .catch((e)=>{
                    if (e.response) {
                        let code = e.response.status
                        let errData = e.response.data
                        switch (code) {
                            case 403: {
                                dispatch('setInformation', {color:'error', timeout:-1, text:errData.error[0] || 'Ошибка прав доступа'})
                            } break;
                            default: {
                                dispatch('setInformation', {color:'error',timeout:-1, text:errData.error[0] || 'Неизвестная ошибка сервера'})
                            }
                        }
                    } else {
                        dispatch('setInformation', {color:'error',timeout:-1, text:'Неизвестный ответ сервера'})
                    }
                    reject(e)
                })
                .finally(()=>{
                    dispatch('setLoading', false)
                })
            })
        },
        setGroupValues({commit}, payload) {
            commit('SET_GROUP_VALUES', {table:payload.table, id:payload.id, data:payload.vals})
        },
        saveGroups({dispatch},payload) {
            dispatch('setLoading', true)
            // Route::post('/groups/{table}/{id}/{tag_name}','APIController@add_group')->middleware('auth:api'); // вставить новую группу tag_name и присвоить ее id tdble-id
            return new Promise((resolve, reject) => {
                let url = `/api/v1/groups/${payload.table}/${payload.id}`
                Services.request(url, 'post', {data:payload.data})
                .then((response)=>{
                    if (response.data.data) {
                        dispatch('setInformation', 'Группы сохранены')
                    } else {
                        dispatch('setInformation', {color:'error',timeout:-1, text:response.data.error[0] || 'Не удалось сохранить группы'})
                    }
                    // обновим данные
                    dispatch('getGroupValues', payload)
                    dispatch('getGroups', payload.table)
                    resolve(response)
                })
                .catch((e)=>{
                    if (e.response) {
                        let code = e.response.status
                        let errData = e.response.data
                        switch (code) {
                            case 403: {
                                dispatch('setInformation', {color:'error', timeout:-1, text:errData.error[0] || 'Ошибка прав доступа'})
                            } break;
                            default: {
                                dispatch('setInformation', {color:'error',timeout:-1, text:errData.error[0] || 'Неизвестная ошибка сервера'})
                            }
                        }
                    } else {
                        dispatch('setInformation', {color:'error',timeout:-1, text:'Неизвестный ответ сервера'})
                    }
                    reject(e)
                })
                .finally(()=>{
                    dispatch('setLoading', false)
                })
            })
        }


    },

    getters: {

    }
}

import Vue from 'vue'
import axios from 'axios'


export default {

    state: {
        // список пользователей
        users: null,
        // пользователь (модель User)
        user: null,
        // информация о пользователе (модель UserInfo)
        user_info: null,
        // разрешения, описанные в приложении
        permissions: null,
        // информация о пользователях для администратора
        adm_user_info: {},
        // напоминания
        notifications: [],
    },

    mutations: {
        SET_USER(state, userData) {
            state.user = userData
            // если указана дата истечения ключа - вычислим ttl иначе ttl будет равно 1 день
            let ttl = 24 * 60 * 60 * 60 * 1000
            if (userData.remember && userData.expire) {
                let now = Vue.moment().utc()
                let exp = Vue.moment(userData.expire)
                let diff = Vue.moment.duration(exp.diff(now)).asMilliseconds()
                if (diff>0) {
                    ttl = diff
                }
            }
            // сохраняем токен в локальном хранилище
            Vue.$storage.set('user', userData, { ttl: ttl })
            // добавляем заголовки авторизации
            axios.defaults.headers.common['Authorization'] = `Bearer ${
                userData.token
            }`
        },
        SET_USER_INFO(state, info) {
            let defInfo = {}
            if (state.user) {
                defInfo = {name:state.user.name, user_id:state.user.id}
            }
            state.user_info = {...defInfo, ...info}
        },
        SET_ADM_USER_INFO(state, info) {
            // console.log(`set-adm-user-info data is ${JSON.stringify(info)}`)
            if (info.user.id!==undefined) {
                let userId = info.user.id
                if (state.adm_user_info[userId]) {
                    state.adm_user_info[userId] = info
                } else {
                    Vue.set(state.adm_user_info, userId, info)
                }
            }
        },
        CLEAR_USER(state) {
            state.user = null
            state.user_info = null
            Vue.$storage.set('user', null)
            axios.defaults.headers.common['Authorization'] = null
            // router.push({ name: 'login' })
        },
        SET_USERS(state, users) {
            state.users = users
        },
        SET_NOTIFICATIONS(state, payload) {
            state.notifications = payload
        },
        MARK_NOTE_READED(state,id) {
            state.notifications = state.notifications.filter(item => item.id!==id)
        },
    },

    actions: {
        login({commit, dispatch, getters}, user) {
            return new Promise((resolve, reject)=>{
                let url = `${getters.baseURL}login`
                dispatch('request',{url, method:'post', data:user})
                    .then(({is_error, error, data})=>{
                        if (is_error) {
                            dispatch('pushError', error)
                            reject(error)
                        } else {
                            let userData = {'token':data.token, 'expire':data.expires_at, 'roles':data.roles}
                            if (data.user) userData = {...userData, ...data.user}
                            commit('SET_USER', userData)
                            let rolesArray = userData.roles.map(role=>{
                                return role.name
                            })
                            dispatch('setUserUI',rolesArray)
                            dispatch('pushInfo', 'Добро пожаловать')
                            dispatch('getUserInfo')
                            resolve(true)
                        }
                    })
                    .catch(e=>{
                        reject(e)
                    })
            })
        },
        logout({commit, dispatch}) {
            commit('CLEAR_USER')
            dispatch('clearUserInfoData')
            dispatch('clearUserRoles')
        },
        getUserInfo({commit, dispatch, getters}, userId=null) {
            return new Promise((resolve, reject)=>{
                let url = `${getters.baseURL}user_info?filter=user_id eq ${userId?userId:getters.userId}`
                dispatch('request',{url, method:'get'})
                    .then(({is_error, error, data})=>{
                        if (is_error) {
                            dispatch('pushError', error)
                            reject(error)
                        } else {
                            let userInfo = data[0]
                            if (userInfo.user.id == getters.userId) {
                                commit('SET_USER_INFO',userInfo)
                            }
                            commit('SET_ADM_USER_INFO',userInfo)
                        }
                        resolve(data)
                    })
                    .catch(e=>{
                        reject(e)
                    })
            })
        },
        setUser({commit, dispatch}, info) {
            return new Promise((resolve, reject) => {
                commit('SET_USER', info)
                // подгрузим интерфейс пользователя
                let rolesArray = info.roles.map(role=>{
                    return role.name
                })
                dispatch('setUserUI',rolesArray)

                dispatch('getUserInfo')
                    .then(response=>{
                        resolve(response)
                    })
                    .catch(e=>{
                        reject(e)
                    })
            })
        },
        async setUserInfo({commit, getters, dispatch}, info) {
            return new Promise((resolve, reject)=>{
                let url = `${getters.baseURL}user_info${info.id ? `/${info.id}`:''}`
                let method = info.id ? 'put' :'post'
                dispatch('getTableModel', 'user_info')
                    .then((model)=>{
                        dispatch('request',{url, method, data:info, model})
                            .then(({is_error, error, data})=>{
                                if (is_error) {
                                    dispatch('pushError', error)
                                    reject(error)
                                } else {
                                    if (data.user.id !== undefined) {
                                        let userId = data.user.id
                                        if (userId == getters.userId) {
                                            commit('SET_USER_INFO',data)
                                        }
                                    }
                                    commit('SET_ADM_USER_INFO',data)
                                    dispatch('pushInfo', 'Информация пользователя сохранена')
                                    resolve(data)
                                }
                            })
                            .catch(e=>{
                                dispatch('pushError',`Не удается найти информацию о пользователе`)
                                reject(e)
                            })
                        })
                    .catch(e=>{
                        dispatch('pushError',`Не удается найти описание пользовательской таблицы`)
                        reject(e)
                    })
            })
        },
        getUsers({commit, dispatch, getters}) {
            return new Promise((resolve, reject)=>{
                let url = `${getters.baseURL}users`
                dispatch('request',{url, method:'get'})
                    .then(({is_error, error, data})=>{
                        if (is_error) {
                            dispatch('pushError', error)
                            reject(error)
                        } else {
                            commit('SET_USERS',data)
                        }
                        resolve(data)
                    })
                    .catch(e=>{
                        reject(e)
                    })
            })
        },
        getNotifications({commit, dispatch, getters}) {
            return new Promise((resolve, reject)=>{
                let url = `${getters.baseURL}notifications`
                dispatch('request',{url, method:'get'})
                    .then(({is_error, error, data})=>{
                        if (is_error) {
                            dispatch('pushError', error)
                            reject(error)
                        } else {
                            commit('SET_NOTIFICATIONS',data)
                        }
                        resolve(data)
                    })
                    .catch(e=>{
                        reject(e)
                    })
            })
        },
        markNote({commit, dispatch, getters},id) {
            return new Promise((resolve, reject)=>{
                let url = `${getters.baseURL}notifications/${id}`
                dispatch('request',{url, method:'patch', data:{is_readed:1}})
                .then((response)=>{
                    let {is_error, error, data} = response
                    if (is_error) {
                        dispatch('pushError', error)
                        reject(error)
                    } else {
                        commit('MARK_NOTE_READED', id)
                    }
                    resolve(data)
                })
                .catch(e=>{
                    reject(e)
                })
            })
        },
    },

    getters: {
        isAuth(state) {
            return !!state.user
        },
        user(state) {
            return state.user
        },
        footerMenu(state) {
            return state.footerMenu
        },
        userId(state) {
            if (state.user)
                 return state.user.id;
                    else return null
        },
        hasUserInfo(state) {
            return !!state.user_info
        },
        userInfo(state) {
            return state.user_info
        },
        thisUserRoles(state) {
            return state.user.roles
        },
        isSuperAdmin(state) {
            let isSuperAdmin = state.user.roles.find(role=>{
                if (role.name =='super admin') return true
            })
            return !!isSuperAdmin
        },
        usersLoaded(state) {
            return !!state.users
        },
        users(state) {
            return state.users
        },
        skladKeeper(state) {
            if (state.user_info) {
                return state.user_info.sklad_keeper
            }
            return null
        },
        isKeeper(state) {
            try {
                return state.user_info.sklad_keeper.length>0
            } catch (error) {
                // do nothing
            }
            return null
        },
        isAdmin(state) {
            if (state.user) {
                if (state.user.roles) {
                    return state.user.roles.findIndex(role=>{
                        return role.name == 'admin' || role.name == 'superadmin'
                    }) !== -1
                }
            }
            return false
        },
        notifications(state) {
            return state.notifications
        },
        activeNotifications(state) {
            return state.notifications.filter(item=>{
                return !item.is_readed
            })
        },


    }
}

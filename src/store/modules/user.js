import Services from '../../siteAdminServices.js'
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
        login({dispatch}, user) {
            return new Promise((resolve, reject) => {
                dispatch('setLoading', true)
                return Services.request('/api/v1/login','post',user)
                    .then((r)=>{
                        if (r.status==200 && r.data.data.token) {
                            // роли пользователя
                            let userRoles = r.data.data.roles
                            // формируем данные пользовательской информации
                            let userData = {'token':r.data.data.token, 'expire':r.data.data.expires_at, 'roles':userRoles}
                            if (r.data.data.user) userData = {...userData, ...r.data.data.user}
                            dispatch('setUser',userData)
                            dispatch('setInformation', 'Добро пожаловать')
                            dispatch('getUserInfo')
                        } else {
                            let err = 'Некорректная авторизация'
                            try {
                                err = r.data.error[0]
                            }
                            catch(e) {
                                console.log(`Некорректная авторизация`)
                            }
                            dispatch('setInformation', {color:'error',timeout:-1, text: err })
                        }
                        resolve(r)
                    })
                    .catch((e)=> {
                        if (e.response) {
                            let code = e.response.status
                            let errData = e.response.data
                            // console.log(`code=${code}, errData=${JSON.stringify(errData.error[0])}`)
                            let err
                            try {
                                err = errData.error[0]
                            }
                            catch(e) {
                                console.log(`Ошибка авторизации`)
                            }
                            
                            switch (code) {
                                case 401: {
                                    if (err === undefined) err = 'Ошибка авторизации'
                                } break;
                                default: {
                                    if (err === undefined) err = 'Неизвестная ошибка авторизации'
                                }
                            }
                            dispatch('setInformation', {color:'error',timeout:-1, text:err})
                        }
                        reject(e)
                    })
                    .finally(()=>{
                        dispatch('setLoading', false)
                    })
            })
        },
        logout({commit, dispatch}) {
            commit('CLEAR_USER')
            dispatch('clearUserInfoData')
            dispatch('clearUserRoles')
        },
        getUserInfo({commit, dispatch, getters}, userId=null) {
            return new Promise((resolve, reject) => {
                dispatch('setLoading', true)
                return Services.request(`/api/v1/user_info?filter=user_id eq ${userId?userId:getters.userId}`,'get')
                    .then((r)=>{
                        if (r.status==200 && r.data) {
                            let userInfo = r.data.data[0]
                            if (userInfo) {
                                if (userInfo.user.id == getters.userId) {
                                    commit('SET_USER_INFO',userInfo)
                                }
                                commit('SET_ADM_USER_INFO',userInfo)
                                dispatch('setInformation', 'Обновлена информация пользователя')
                            }
                        } else {
                            dispatch('setInformation', {color:'error',timeout:-1, text:r.data.error[0] || 'Не удалось получить информацию пользователя'})
                        }
                        resolve(r)
                    })
                    .catch((e)=>{
                        if (e.response) {
                            let code = e.response.status
                            let errData = e.response.data
                            switch (code) {
                                case 401: {
                                    dispatch('setInformation', {color:'error', timeout:-1, text:'Вы не авторизованы'})
                                } break;
                                case 403: {
                                    dispatch('setInformation', {color:'error', timeout:-1, text:errData.error[0] || 'Ошибка прав доступа'})
                                } break;
                                default: {
                                    dispatch('setInformation', {color:'error',timeout:-1, text:errData.error[0] || 'Неизвестная ошибка сервера'})
                                }
                            }
                        }
                        reject(e)
                    })
                    .finally(()=>{
                        dispatch('setLoading', false)
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
        setUserInfo({commit, getters}, info) {
            if (info.user.id !== undefined) {
                let userId = info.user.id
                if (userId == getters.userId) {
                    commit('SET_USER_INFO',info)
                }
            }
            commit('SET_ADM_USER_INFO',info)
        },
        getUsers({commit, dispatch}) {
            dispatch('setLoading', true)
            return Services.request(`/api/v1/users`,'get')
                .then((r)=>{
                    if (r.status==200 && r.data) {
                        let users = r.data.data
                        commit('SET_USERS',users)
                        dispatch('setInformation', 'Обновлен список пользователей')
                    } else {
                        dispatch('setInformation', {color:'error',timeout:-1, text:r.data.error[0] || 'Не удалось получить список пользователей'})
                    }
                })
                .catch((e)=>{
                    if (e.response) {
                        let code = e.response.status
                        let errData = e.response.data
                        switch (code) {
                            case 401: {
                                dispatch('setInformation', {color:'error', timeout:-1, text:'Вы не авторизованы'})
                            } break;
                            case 403: {
                                dispatch('setInformation', {color:'error', timeout:-1, text:errData.error[0] || 'Ошибка прав доступа'})
                            } break;
                            default: {
                                dispatch('setInformation', {color:'error',timeout:-1, text:errData.error[0] || 'Неизвестная ошибка сервера'})
                            }
                        }
                    }
                })
                .finally(()=>{
                    dispatch('setLoading', false)
                })
        },
        getNotifications({commit, dispatch, getters}) {
            return new Promise((resolve, reject) => {
                if (getters.userId) {
                    dispatch('setLoading', true)
                    return Services.request(`/api/v1/notifications`,'get')
                        .then((r)=>{
                            if (r.status==200 && r.data) {
                                let data = r.data.data
                                commit('SET_NOTIFICATIONS',data)
                            } else {
                                dispatch('setInformation', {color:'error',timeout:-1, text:r.data.error[0] || 'Не удалось загрузить последние уведомления'})
                            }
                        })
                        .catch((e)=>{
                            dispatch('appErrorException', e)
                            reject(e)
                        })
                        .finally(()=>{
                            dispatch('setLoading', false)
                            resolve
                        })
                }
                reject
            })
        },
        markNote({commit, dispatch},id) {
            // отправляем на сервер, а потом синхронизируем со стораджем
            return new Promise((resolve, reject) => {
                dispatch('setLoading', true)
                return Services.request(`/api/v1/notifications/${id}`,'patch',{is_readed:1})
                    .then(()=>{
                        commit('MARK_NOTE_READED', id)
                    })
                    .catch((e)=>{
                        dispatch('appErrorException', e)
                        reject(e)
                    })
                    .finally(()=>{
                        dispatch('setLoading', false)
                        resolve
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
            if (state.user_info) {
                return state.user_info.sklad_keeper.length>0
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

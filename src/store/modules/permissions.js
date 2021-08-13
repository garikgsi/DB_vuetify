import Services from '../../siteAdminServices.js'


export default {

    state: {
        // список ролей
        roles: null,
        permissions: null,
        interfaces: null,
        // роли пользователя
        userRoles: null,
        // разрешения пользователя
        userPermissions: null,
        // интерфейсы пользователя
        userInterfaces: null,
    },

    mutations: {
        SET_ROLES(state,roles) {
            state.roles = roles
        },
        SET_PERMISSIONS(state,permissions) {
            state.permissions = permissions
        },
        SET_INTERFACES(state,interfaces) {
            state.interfaces = interfaces
        },
        SET_USER_ROLES(state,roles) {
            state.userRoles = roles
        },
        SET_USER_PERMISSIONS(state,permissions) {
            state.userPermissions = permissions
        },
        SET_USER_INTERFACES(state,interfaces) {
            state.userInterfaces = interfaces
        },
    },

    actions: {
        getRoles({commit, dispatch}) {
            dispatch('setLoading', true)
            return Services.request(`/api/v1/roles`,'get')
                .then((r)=>{
                    if (r.status==200 && r.data) {
                        let roles = r.data.data
                        commit('SET_ROLES',roles)
                    } else {
                        dispatch('setInformation', {color:'error',timeout:-1, text:r.data.error[0] || 'Не удалось получить список ролей'})
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
        getUserRoles({commit, dispatch},userId=null) {
            dispatch('setLoading', true)
            let userRoles = null
            let url = `/api/v1/user_roles`
            if (userId) url += `/${userId}`
            return Services.request(url,'get')
                .then((r)=>{
                    if (r.status==200 && r.data) {
                        userRoles = r.data.data
                        dispatch('setInformation', 'Обновлены роли пользователя')
                    } else {
                        dispatch('setInformation', {color:'error',timeout:-1, text:r.data.error[0] || 'Не удалось обновить роли пользователя'})
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
                    commit('SET_USER_ROLES',userRoles)
                })
        },
        setUserRoles({commit},roles) {
            commit('SET_USER_ROLES',roles)
        },
        clearUserRoles({commit}) {
            commit('SET_USER_ROLES',null)
        },
        saveUserRoles({commit, dispatch, getters}, userId=null) {
            dispatch('setLoading', true)
            let url = `/api/v1/user_roles`
            if (userId) url += `/${userId}`
console.log(`send request ${url} with data ${JSON.stringify(getters.userRoles)}`)
            Services.request(url,'post',{data:getters.userRoles})
                .then((r)=>{
                    if (r.status==200 && r.data) {
                        let userRoles = r.data.data
                        commit('SET_USER_ROLES',userRoles)
                        dispatch('setInformation', 'Роли пользователя сохранены')
                    } else {
                        dispatch('setInformation', {color:'error',timeout:-1, text:r.data.error[0] || 'Не удалось сохранить пользователя'})
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
        saveUserPermissions({ dispatch}, userId=null) {
            dispatch('saveUserRoles',userId)
        }
    },

    getters: {
        roles(state) {
            return state.roles
        },
        rolesLoaded(state) {
            return !!state.roles
        },
        userRoles(state) {
            return state.userRoles
        },
        hasUserRoles(state) {
            return !!state.userRoles
        }

    }
}

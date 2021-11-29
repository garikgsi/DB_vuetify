
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
        getRoles({commit, dispatch, getters}) {
            return new Promise((resolve, reject)=>{
                let url = `${getters.baseURL}roles`
                dispatch('request',{url, method:'get'})
                    .then(({is_error, error, data})=>{
                        if (is_error) {
                            dispatch('pushError', error)
                            reject(error)
                        } else {
                            commit('SET_ROLES', data)
                        }
                        resolve(data)
                    })
                    .catch(e=>{
                        reject(e)
                    })
            })
        },
        getUserRoles({commit, dispatch, getters},userId=null) {
            return new Promise((resolve, reject)=>{
                commit('SET_USER_ROLES',null)
                let url = `${getters.baseURL}user_roles${userId?`/${userId}`:''}`
                dispatch('request',{url, method:'get'})
                    .then(({is_error, error, data})=>{
                        if (is_error) {
                            dispatch('pushError', error)
                            reject(error)
                        } else {
                            commit('SET_USER_ROLES',data)
                        }
                        resolve(data)
                    })
                    .catch(e=>{
                        reject(e)
                    })
            })
        },
        setUserRoles({commit},roles) {
            commit('SET_USER_ROLES',roles)
        },
        clearUserRoles({commit}) {
            commit('SET_USER_ROLES',null)
        },
        saveUserRoles({commit, dispatch, getters}, userId=null) {
            return new Promise((resolve, reject)=>{
                let url = `${getters.baseURL}user_roles${userId?`/${userId}`:''}`
                dispatch('request',{url, method:'post', data:{data:getters.userRoles}})
                    .then(({is_error, error, data})=>{
                        if (is_error) {
                            dispatch('pushError', error)
                            reject(error)
                        } else {
                            commit('SET_USER_ROLES',data)
                            dispatch('pushInfo',`Роли пользователя сохранены`)
                            resolve(data)
                        }
                    })
                    .catch(e=>{
                        reject(e)
                    })
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

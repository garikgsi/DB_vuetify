export default {

    state: {
        // information: {color:'error', timeout:-1, text:'Hello! This is some Error'},
        information: null,
        // отображать сайдбар
        showSidebar: false,
        // title страницы
        title: '',
        // ожидание загрузки
        loading: false,
        // предыдущий роут
        prevRoute: null,
        // breakpoint by vuetify
        breakPoint: null,
        // вывод в мобиле?
        isMobile: false,
        // массив брейкпоинтов, которые рассматриваем как мобильное отображение
        mobileBreakPoints: ['xs']
    },

    mutations: {
        // брейкпоинт vuetify и признак отображения в мобиле
        SET_BREAKPOINT(state, breakpoint) {
            state.breakPoint = breakpoint
            state.isMobile = state.mobileBreakPoints.indexOf(breakpoint)!==-1
        },
        // информационное сообщение
        SET_INFORMATION(state, information) {
            if (information) {
                let info = {color:'success', timeout: 5000, text:''}
                switch (typeof(information)) {
                    case 'object': {
                        info = {...info, ...information}
                    } break;
                    case 'string': {
                        info.text = information
                    } break;
                    default: {
                        info = null
                    }
                }
                state.information = info
            } else {
                state.information = null
            }
        },
        SET_SIDEBAR_SHOW(state, showSidebar) {
            state.showSidebar = showSidebar
        },
        SET_TITLE(state, title) {
            state.title = title
        },
        SET_LOADING(state, payload) {
            state.loading = payload
        },
        SET_PREV_ROUTE(state, route) {
            state.prevRoute = route
        }
    },

    actions: {
        setBreakPoint({commit},breakpoint) {
            commit('SET_BREAKPOINT', breakpoint)
        },
        setInformation({commit}, information) {
            commit('SET_INFORMATION', information)
        },
        setTitle({commit}, title) {
            commit('SET_TITLE', title)
        },
        setSidebarShow({commit}, showSidebar) {
            commit('SET_SIDEBAR_SHOW', showSidebar)
        },
        setLoading({commit}, payload) {
            commit('SET_LOADING',payload)
        },
        setPrevRoute({commit},route) {
            commit('SET_PREV_ROUTE', route)
        },
        // обработка ошибки обработки запроса - стандартная для всех ответов от API
        appErrorException({dispatch},e) {
            if (e.response) {
                let code = e.response.status
                let errData = e.response.data
                switch (code) {
                    case 403: {
                        dispatch('setInformation', {color:'error', timeout:-1, text:errData.error[0] || 'Ошибка прав доступа (403)'})
                    } break;
                    case 405: {
                        dispatch('setInformation', {color:'error', timeout:-1, text:errData.error[0] || 'Недопустимый метод (405)'})
                    } break;
                    case 422: {
                        let err = 'Проверьте заполненность обязательных полей (422)'
                        if (errData.error) {
                            if (Array.isArray(errData.error)) {
                                if (errData.error.length==1) {
                                    // правильный отклик от API
                                    err = errData.error[0]
                                }
                            }
                        }
                        dispatch('setInformation', {color:'error', timeout:-1, text:err})
                    //     // ошибка валидации
                    //     this.$emit('submitErrorValidation')
                    //     this.msg = 'Проверьте заполнение следующих полей:'
                    //     for (let m in err.error) {
                    //         this.errFields.push(err.error[m])
                    //     }
                    //     this.msgTimeout = 0
                    //     this.msgColor = 'error'
                    } break;
                    case 413: {
                        dispatch('setInformation', {color:'error',timeout:-1, text:errData.error[0] || 'Слишком много данных (413)'})
                    } break;
                    default: {
                        dispatch('setInformation', {color:'error',timeout:-1, text:errData.error[0] || 'Неизвестная ошибка сервера'})
                    }
                }
            } else {
                dispatch('setInformation', {color:'error',timeout:-1, text:'Неизвестный ответ сервера'})
            }
        }
    },

    getters: {
        hasInfo(state) {
            return state.information!==null
        },
        information(state){
            return state.information
        },
        showSidebar(state){
            return state.showSidebar
        },
        title(state){
            return state.title
        },
        isLoading(state) {
            return state.loading
        },
        prevRoute(state) {
            return state.prevRoute
        },
        isMobile(state) {
            return state.isMobile
        }

    }
}

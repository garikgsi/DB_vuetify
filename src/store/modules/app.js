import axios from 'axios'
import router from '../../router'
import Vue from 'vue'

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
        mobileBreakPoints: ['xs'],
        // время ожидания запроса до прерывания в секундах
        waitResponseTime: 120,
        // состояния открытых табов
        tabState: {}
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
        },
        SET_TAB_STATE(state, {name,val}) {
            if (state.tabState[name]) {
                state.tabState[name] = val
            } else {
                Vue.set(state.tabState, name, val)
            }
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
        // отображение ошибки
        pushError({dispatch},text) {
            dispatch('setInformation', {color:'error', timeout:-1, text:text})
        },
        // отображение ошибки
        pushWarning({dispatch},text) {
            dispatch('setInformation', {color:'warning', text:text})
        },
        // отображение ошибки
        pushInfo({dispatch},text) {
            dispatch('setInformation', {color:'success', text:text})
        },
        // установить значение открытого таба
        setTabState({commit},{name,val}) {
            commit('SET_TAB_STATE',{name,val})
        },
        // отправить запрос на сервер
        async request({dispatch, getters},{url, method, data, dataWithoutModel, model}) {
            // console.log(`request url=${url},method=${method}, data=${JSON.stringify(data)}, model=${JSON.stringify(model)}`)
            let startTime = Date.now()
            let formData = null
            if (data) {
                // console.log(`try mod data`)
                formData = await dispatch('prepareFormData',{data, dataWithoutModel, model})
                // console.log(`formData=${JSON.stringify(formData)}`)
            } else {
                if (method != 'get') formData = new FormData()
            }
            let requestMethod = 'post'
            switch (method) {
                case 'get': {
                    requestMethod = 'get'
                } break;
                case 'post': {
            // console.log(`post request url=${url}, formData=${JSON.stringify(formData)}`)
                    formData.append("_method", "POST")
                } break;
                case 'put': {
                    formData.append("_method", "PUT")
                } break;
                case 'patch': {
                    formData.append("_method", "PATCH")
                } break;
                case 'delete': {
                    formData.append("_method", "DELETE")
                } break;
            }
            return new Promise((resolve)=>{
            // адрес перехода после выполнения запроса
            let route = null
            // loading
            dispatch('setLoading', true)
            let res = {data: null, is_error:false, error:null, count:null, time_request:null, model:null}
            
            // если будет превышено время ожидания
            const CancelToken = axios.CancelToken;
            const source = CancelToken.source();
            // обработка неответа в случае превышения таймаута
            const timeout = setTimeout(() => {
                // прерываем ожидание данных
                source.cancel();
            }, getters.waitResponseTime*1000)
            
            // опции запроса axios
            let axiosOptions = {
                method: requestMethod,
                url
            }
            if (formData) axiosOptions.data = formData
            // console.log(`axios=${JSON.stringify({...axiosOptions, ...getters.axiosCfg, ...{cancelToken: source.token}})}`)
            // ждем выполнение запроса
            axios({...axiosOptions, ...getters.axiosCfg, ...{cancelToken: source.token}})
                .then(response=>{
                    // ответ получен в отведенное время
                    clearTimeout(timeout);
                    // данные
                    try {
                        res.data = response.data.data
                    } catch (error) {
                        res.data = null
                    }
                    // ошибка
                    try {
                        res.is_error = response.data.is_error
                    } catch (error) {
                        res.is_error = false
                    }
                    if (res.is_error)
                    try {
                        if (Array.isArray(response.data.error)) {
                            res.error = response.data.error.join(', ')
                        } else {
                            res.error = response.data.error
                        }
                        res.is_error = response.data.is_error
                    } catch (error) {
                        res.is_error = false
                    }
                    // кол-во данных
                    try {
                        res.count = response.data.count
                    } catch (error) {
                        res.count = null
                    }
                    // модель
                    try {
                        res.model = response.data.model
                    } catch (error) {
                        res.model = null
                    }
                    // время генерации ответа с сервера
                    // try {
                    //     res.time_request = parseFloat(response.data.time_request)
                    // } catch (error) {
                    //     res.time_request = null
                    // }
                    // время получения данных
                    let endTime = Date.now()
                    // затрачено секунд
                    res.time_request = (endTime-startTime)/1000
                })
                .catch(error=>{
                    // console.log(`axios catch error=${JSON.stringify(error)}`)
                    res.is_error = true
                    if (axios.isCancel(error)) {
                        res.error = `Превышено время ожидания ответа от сервера в [${getters.waitResponseTime}] сек`
                    } else {
                        // если передан код
                        try {
                            // код ответа
                            let code = error.response.status
                            // дефолтная ошибка соответствующая коду
                            let codeError = `Неизвестная ошибка сервера. Код [${code}]`
                            // анализ кода ответа сервера
                            switch (code) {
                                // сюда добавляем анализ всех кодов ответе сервера
                                case 400: {
                                    codeError = `Неверные параметры запроса. Код [${code}]`
                                } break;
                                case 401: {
                                    codeError = `Вы не авторизованы. Код [${code}]`
                                    route = '/login'
                                } break;
                                case 403: {
                                    codeError = `Ошибка прав доступа. Код [${code}]`
                                } break;
                                case 404: {
                                    codeError = `Неверный адрес. Код [${code}]`
                                } break;
                                case 405: {
                                    codeError = `Недопустимый метод. Код [${code}]` 
                                } break;
                                case 409: {
                                    codeError = `Слишком много запросов за столь короткий срок. Код [${code}]` 
                                } break;
                                case 413: {
                                    codeError = `Слишком много данных. Код [${code}]`
                                } break;
                                case 421: {
                                    codeError = `Бизнес правило`
                                } break;
                                case 422: {
                                    codeError = `Проверьте заполненность обязательных полей. Код [${code}]`
                                } break;
                            }
                            // установим ошибку если передана или будем использовать дефолтную
                            if (codeError) {
                                try {
                                    let responseError = error.response.data.error
                                    if (Array.isArray(responseError)) {
                                        if (responseError.length==1) {
                                            res.error = `${codeError}: ${responseError[0]}`
                                        } else {
                                            res.error = `${codeError}: ${responseError.join(', ')}`
                                        }
                                    } else {
                                        // console.log(`err=${JSON.stringify(responseError)}`)
                                        res.error = `${codeError}${responseError?`: ${responseError}`:``}`
                                    }
                                } catch (error) {
                                    res.error = codeError
                                }
                            }
                        } catch (e) {
                            res.error = 'Проверьте соединение с Интернетом'
                        }
                    }
                })
                .finally(()=>{
                    // конец загрузки
                    dispatch('setLoading', false)
                    // если есть адрес перехода - уходим, иначе выдаем ошибку
                    if (route) {
                        let currentRoute = router.history.current.path
                        if (currentRoute != route) {
                            router.push(route)
                        }
                    }
                    resolve(res)    
                })
            })
        },

        // подготовка данных для запроса
        async prepareFormData(context,{data, dataWithoutModel, model}) {
            let formData = data
            // console.log(`data for send formData=${JSON.stringify(formData)} , model=${JSON.stringify(model)}}`)
            return new Promise(resolve=>{
                let fd = new FormData()
                if (model) {
                    model.fields.forEach((field)=>{
                        // console.log(`analize field ${JSON.stringify(field)}`)
                        let fname = field.name
                        let ftype = field.type
                        // console.log(`обрабатываю ${JSON.stringify(field)}`)
                        let uncheckedFields = ['image', 'file', 'document']
                        // let uncheckedFields = ['text', 'string', 'image', 'file', 'document']
                        if (fname in formData || uncheckedFields.indexOf(ftype)!==-1) {
                            let fval = formData[field.name]
                            // console.log(`${fname}(${ftype})=${fval}`)
                            switch (ftype) {
                                case 'image': case 'file': case 'document': {
                                    // console.log(`ftype=${ftype}, fval=${typeof(fval)}`)
                                    if (!!fval && typeof(fval)=='object') {
                                        // Если это массив
                                        if (Array.isArray(fval)) {
                                            // добавляем несколько файлов
                                            for (let file of fval) {
                                    // console.log(`Array! fname=${fname}, file.name=${file.name}`)
                                                fd.append(fname, file, file.name)
                                            }
                                        } else {
                                    // console.log(`fname=${fname}, fval.name=${fval.name}`)
                                            fd.set(fname, fval, fval.name)
                                        }
        
                                        // for (let file in fval) {
                                        //     console.log(`ftype=${ftype}, fval=${typeof(fval)}, file=${file}, fval[file]=${fval[file]}, file.name=${file.name}`)
                                        //     // fd.set(fname, file, file.name)
                                        //     fd.set(fname, fval[file])
                                        // }
                                    } else {
                                        fd.append(fname, null)
                                    }
                                } break;
                                case 'boolean': {
                                    if (fval===false || fval==0) {
                                        fd.append(fname, 0)
                                    } else {
                                        fd.append(fname, 1)
                                    }
                                } break;
                                case 'string': case 'text': {
                                    if (fval) {
                                        fd.append(fname, fval)
                                    } else {
                                        fd.append(fname, '')
                                    }
                                } break;
                                case 'morph': {
                                    for(let morphKey in fval) {
                                        fd.append(morphKey, fval[morphKey])
                                    }
                                } break;
                                default: {
                                    fd.append(fname, fval)
                                }
                            }
                        }
                    })
                    // табличные части и подчиненные таблицы
                    if (model.extensions && model.extensions.sub_tables) {
                        // console.log(`subtables are ${JSON.stringify(model.extensions.sub_tables)}`)
                        for (let subTable in model.extensions.sub_tables) {
                            let st = model.extensions.sub_tables[subTable]
                            // console.log(`finded subTable = ${subTable}`)
                            if (st.method && st.method in formData) {
                                // console.log(`subTable method = ${st.method} is in formData ${JSON.stringify(formData[st.method])}`)
                                fd.append(st.method, JSON.stringify(formData[st.method]))
                            } else {
                                // console.log(`no subTable method = ${st.method} is in formData ${JSON.stringify(formData)}`)
                            }
                        }
                    }
                    // если переданы данные без учета модели - добавим их как есть
                    if (dataWithoutModel) {
                        for (let key in dataWithoutModel) {
                            fd.append(key, dataWithoutModel[key])
                        }
                    }
                } else {
                    // console.log(`no model`)
                    for (let key in formData) {
                        if (!!formData[key] || formData[key]===false || formData[key]===0) {
                            let retVal;
                            if (formData[key]==true) {
                                retVal = 1
                            } else if (formData[key]===false) {
                                retVal = 0
                            } else {
                                if (typeof(formData[key])=='object') {
                                    retVal = JSON.stringify(formData[key])
                                } else {
                                    retVal = formData[key]
                                }
                            }
        
                            fd.set(key, retVal)
                        }
                    }
                    // return formData
                }
                // console.log(`res fd= ${JSON.stringify(fd)}`)
                resolve(fd)
            })
        },
            
        // обработка ошибки обработки запроса - стандартная для всех ответов от API
        appErrorException({dispatch},e) {
            if (e.response) {
                let code = e.response.status
                let errData = e.response.data
                let errText
                try {
                    errText = errData.error[0]
                }
                catch(e) {
                    errText = null
                }
                switch (code) {
                    case 403: {
                        dispatch('setInformation', {color:'error', timeout:-1, text: ()=>errText || 'Ошибка прав доступа (403)'})
                    } break;
                    case 405: {
                        dispatch('setInformation', {color:'error', timeout:-1, text: ()=>errText || 'Недопустимый метод (405)'})
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
                        dispatch('setInformation', {color:'error',timeout:-1, text: ()=>errText || 'Слишком много данных (413)'})
                    } break;
                    default: {
                        dispatch('setInformation', {color:'error',timeout:-1, text: ()=>errText || 'Неизвестная ошибка сервера'})
                    }
                }
            } else {
                dispatch('setInformation', {color:'error',timeout:-1, text: 'Неизвестный ответ сервера' })
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
        },
        waitResponseTime(state) {
            return state.waitResponseTime
        }

    }
}

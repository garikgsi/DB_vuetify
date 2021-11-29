import axios from 'axios'
import store from './store/store.js'

// var debug = true

export default {

    request(url, method, data=null, model=null) {
// console.log(`request url=${url},method=${method}, data=${JSON.stringify(data)}, model=${JSON.stringify(model)}`)
        let formData = null
        if (data) {
// console.log(`try mod data`)
            formData = this.prepareFormData(data, model)
// console.log(`formData=${JSON.stringify(formData)}`)
        } else {
            formData = new FormData()
        }
        switch (method) {
            case 'get': {
                return axios.get(url,store.getters.axiosCfg)
            }
            case 'post': {
// console.log(`post request url=${url}, formData=${JSON.stringify(formData)}`)
                formData.append("_method", "POST")
                return axios.post(url, formData,store.getters.axiosCfg)
            }
            case 'put': {
                formData.append("_method", "PUT")
                return axios.post(url, formData,store.getters.axiosCfg)
            }
            case 'patch': {
                formData.append("_method", "PATCH")
                return axios.post(url, formData,store.getters.axiosCfg)
            }
            case 'delete': {
                formData.append("_method", "DELETE")
                return axios.post(url, formData, store.getters.axiosCfg)
            }
        }
    },
    getSiteModules() {
        return axios.get('/api/v1/site_modules',store.getters.axiosCfg)
        // return this.apiClient.get('/api/v1/site_modules')
    },
    getSiteTree() {
        return axios.get('/api/v1/site_menu_points/tree',store.getters.axiosCfg)
        // return this.apiClient.get('/api/v1/site_menu_points')
    },
    prepareFormData(formData, model) {
// console.log(`data for send formData=${JSON.stringify(formData)} , model=${JSON.stringify(model)}}`)
        let fd = new FormData()
        if (model) {
            model.fields.forEach((field)=>{
// console.log(`analize field ${JSON.stringify(field)}`)
                let fname = field.name
                let ftype = field.type
                let uncheckedFields = ['text', 'string', 'image', 'file', 'document']
                if (fname in formData || uncheckedFields.indexOf(ftype)!==-1) {
                    let fval = formData[field.name]
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
        } else {
            for (let key in formData) {
                if (!!formData[key] || formData[key]===false) {
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

        return fd
    },
    saveMenuPoint(menuPoint) {
        // данные формы
        let formData = this.prepareFormData(menuPoint)
        // настройки запроса
        const formDataConfig = {...store.getters.axiosCfg, 'content-type': 'multipart/form-data' }

        if (menuPoint.id>0) {
            // редактирование
            formData.append("_method", "PUT")
            return axios.post('/api/v1/site_menu_points/'+menuPoint.id, formData, formDataConfig)
        } else {
            // создание нового раздела
            formData.append("_method", "POST")
            return axios.post('/api/v1/site_menu_points/', formData, formDataConfig)
        }
    },
    saveContent(content,menuPointId) {
        // заменим id родительского пункта меню
        let realContent = {...content, menu_point_id : menuPointId}
        // данные формы
        let formData = this.prepareFormData(realContent)
        // настройки запроса
        const formDataConfig = {...store.getters.axiosCfg, 'content-type': 'multipart/form-data' }

        if (content.id>0) {
            // редактирование
            formData.append("_method", "PUT")
            return axios.post('/api/v1/site_contents/'+content.id, formData, formDataConfig)
        } else {
            // создание нового раздела
            formData.append("_method", "POST")
            return axios.post('/api/v1/site_contents/', formData, formDataConfig)
        }
    },
    getMenuPointById(id) {
        return axios.get(`/api/v1/site_menu_points/${id}`,store.getters.axiosCfg)
    },
    getContentTable(menu_point_id, options) {
// console.log(`options=${JSON.stringify(options)}`)
        // {"page":1,"itemsPerPage":10
        //         ,"sortBy":["surl"],"sortDesc":[true],"groupBy":[],"groupDesc":[],"mustSort":false,"multiSort":false}
        let url = `/api/v1/site_contents?filter=menu_point_id eq ${menu_point_id}`
        if (options.page && options.itemsPerPage) {
            let offset = (options.page-1)*options.itemsPerPage
            url += `&offset=${offset}&limit=${options.itemsPerPage}`
        }
        if (options.sortBy) {
            let i = 0
            let sortField = options.sortBy[i]
            let sortDesc = options.sortDesc[i]
            url += `&order=${sortField},${sortDesc?'desc':'asc'}`
        }
// console.log(`url combined ${url} for options=${JSON.stringify(options)}`)

        return axios.get(url,store.getters.axiosCfg)
    },
    deleteContent(id) {
        return axios.delete(`/api/v1/site_contents/${id}`,store.getters.axiosCfg)
    },
    deleteMenuPoint(id) {
        return axios.delete(`/api/v1/site_menu_points/${id}`,store.getters.axiosCfg)
    },
    genUuid() {
        return this.genS4() + this.genS4() + '-' + this.genS4() + '-' + this.genS4() + '-' +
        this.genS4() + '-' + this.genS4() + this.genS4() + this.genS4();
    },
    genS4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    },

    // ABP Table
    getModel(table) {
        return axios.get(`/api/v1/${table}?odata=model`,store.getters.axiosCfg)
    },
    // подготавливаем url для API на основе опций, переданных из store.table
    prepareApiUrl(table, options, odata) {
        let url = `/api/v1/`;
        if (options.table_type) {
            if (options.table_type == 'report') url += 'report/'
        }
        url += `${table}?odata=${odata}`
        // если указаны ограничения
        if (options.limit || options.offset) {
            if (options.limit) url += `&limit=${options.limit}`
            if (options.offset) url += `&offset=${options.offset}`
        } else {
            // страничный вывод
            if (options.page && options.itemsPerPage) {
                let offset = (options.page-1)*options.itemsPerPage
                url += `&offset=${offset}&limit=${options.itemsPerPage}`
            }
        }
        // сортировка
        if (options.sortBy) {
            let i = 0
            let sortField = options.sortBy[i]
            let sortDesc = options.sortDesc[i]
            if (sortField) url += `&order=${sortField},${sortDesc?'desc':'asc'}`
        }
        if (options.search && options.search.length>0) {
            // блок поиска
            url += `&search=${options.search}`
        }
        if (options.id || options.keyModel || options.filters) {
            // добавить выбранные id-шники
            let filters = ''
            if (options.id) filters += `id in ${JSON.stringify(options.id)}`
            // связки по keyModel
            if (options.keyModel && options.keyModel.length>0) {
                options.keyModel.forEach((km, i) => {
                    // console.log(`km=${km}, i=${i}`)
                    if (filters!=='' || i>0) filters += ' and '
                    for (let field in km) {
                        filters += `${field} eq ${km[field]}`
                    }
                })
            }
            // фильтры
            if (options.filters) {
                for (let filter in options.filters) {
                    if (filters !== '') filters += ' and '
                    // проверим на пустоту
                    if (Array.isArray(options.filters[filter])) {
                        if (options.filters[filter].length>0) filters += `${filter} eq ${options.filters[filter]}`
                    } else {
                        if (options.filters[filter] != null) filters += `${filter} eq ${options.filters[filter]}`
                    }

                }
            }

            url += `&filter=${filters}`
        }
        // только указанные столбцы
        if (options.fields && options.fields.length>0) {
            // &fields=fieldName1,fieldName2,...,fieldNameN
            url += '&fields='+options.fields.join()
        }
        // фильтр по группам
        if (options.groups && options.groups.length>0) {
            url += '&tags='+options.groups.join()
        }
        // scoups
        if (options.scope) {
            url += `&scope=${options.scope}`
        }
        return url
    },

    // выдаем оценочное время загрузки данных на основании переданных опций
    async estimateRequest(table, options, odata='data') {
        // ответ, который отправим, если проверки не требуются
        let dontCheckResponse = {estimateTime:null, blockLength:null,is_error:false}
        // посчитаем кол-во записей, которые нужно вернуть в ответе
        let resCount = null
        if (options.limit) {
            resCount =options.limit
        } else {
            // страничный вывод
            if (options.itemsPerPage) {
                resCount =options.itemsPerPage
            }
        }
        // максимально возможное кол-во записей, которые не проверяем
        let maxUncontrolledLimit = 10
        // если кол-во запрашиваемых данных превышат лимит - будем анализировать ответ
        return new Promise((resolve, reject)=>{
            if (resCount && (resCount>maxUncontrolledLimit || resCount == -1)) {
                let url = this.prepareApiUrl(table, options, 'count')
                    axios.get(url,store.getters.axiosCfg).then((response)=>{
                        try {
                            // всего записей, которые будем возвращать
                            let total = response.data.count
                            // если кол-во записей >0
                            if (total>0) {
                                // кол-во, которое необходимо вернуть
                                if (resCount===null || resCount == -1) resCount = total
                                // максимальное время ожидания в секундах
                                let waitTime = 10
                                // время получения пробных данных
                                let probeTime = -1
                                // сформируем тестовый запрос (начнем с 2% данных), на основании ответа на который посчитаем время выдачи 
                                let probeLimit = Math.ceil(resCount/50)
                                // будем пытаться получить данные и настраивать порцию данных под канал
                                // while (probeTime>-1 || probeLimit>=1) {
                                    let probeOptions = {...options, ...{
                                        limit:probeLimit, offset: 0, page:null, itemsPerPage:null
                                    }}
                                    // формируем пробные url
                                    let probeUrl = this.prepareApiUrl(table, probeOptions,odata)
                                    // если будет превышено время ожидания
                                    const CancelToken = axios.CancelToken;
                                    const source = CancelToken.source();
                                    // обработка неответа в случае превышения таймаута
                                    const timeout = setTimeout(() => {
                                        // прерываем ожидание данных
                                        source.cancel();
                                    }, waitTime*1000)

                                    // получаем пробные данные
                                    axios.get(probeUrl,{...store.getters.axiosCfg, ...{cancelToken: source.token}}).then((response)=>{
                                    // axios.get(probeUrl,{...store.getters.axiosCfg}).then((response)=>{
                                        clearTimeout(timeout);

                                        try {
                                            // время получения пробных данных
                                            probeTime = parseFloat(response.data.time_request)
                                            // анализ загрузки
                                            // примерное время ожидания данных
                                            let estimateTime = Math.round(resCount * probeTime / probeLimit *100) / 100
                                            // рассчитаем блок загрузки - не должен превышать 10 сек
                                            //  probeLimit = probeTime
                                            //  x = 15
                                            let blockLength = Math.ceil(10*probeLimit/probeTime)
                                            resolve({estimateTime, blockLength,total})
                                        } catch (error) {
                                            if (axios.isCancel(error)) {
                                                // уменьшаем блок еще на 10%
                                                probeLimit = Math.ceil(probeLimit/10)
                                                console.log(`need crop block`)
                                            } else {
                                                reject(error)
                                            }
                                        }
                                    })
                                // }
                            } else {
                                resolve({...dontCheckResponse, ...{total:0}})
                            }
                        } catch (error) {
                            reject(response)
                        }
                    }).catch(error=>{
                        reject(error)
                    })
            } else {
                resolve(dontCheckResponse)
            }
        })
    },

// TODO
// СДЕЛАТЬ ФУНКЦИЮ БЛОЧНОЙ ВЫБОРКИ ДАННЫХ 
// ПО АНАЛОГИИ С SITEADMINSERVICES-GETTABLEDATA
// С ИНФОМАЦИОННЫМ ВЫВОДОМ О ПРОГНОЗИРОВАНИИ ВЫВОДА И ТД

    // получаем набор данных на основании подготовленного url
    async getTableData(table, options, odata='data') {
        // всего записей
        let total = null
        // пакет данных
        let limit = 10
        // текущее смещение
        let offset = 0
        // всего времени затрачено
        let totalTime = 0
        // данные
        let data = []
        // есть ошибка
        let is_error = false
        // ошибка
        let error = ''
        // максимально возможное кол-во записей, которые не проверяем
        let maxUncontrolledLimit = 10

        // пробуем получить оценочные сведения
        let estimateRequest = await(this.estimateRequest(table, options, odata))
        // если переданы оценочные данные
        if (estimateRequest.blockLength) {
            limit = estimateRequest.blockLength
        }
        if (estimateRequest.blockLength) {
            total = estimateRequest.total
        }
        // кол-во запрошенных записей
        let tableDataLimit = options.limit ? options.limit : options.itemsPerPage ? options.itemsPerPage : total
        // сдвиг с учетом переданного в опциях
        // console.log(`options.page=${options.page}, options.itemsPerPage=${options.itemsPerPage}, options.offset=${options.offset}, options.limit=${options.limit}`)
        if (options.page && options.itemsPerPage) {
            offset = options.itemsPerPage * options.page
            if (offset <0) offset =0
        } else if (options.offset && options.limit>0) {
            offset = options.offset
        }
        // если лимит в опциях передан меньше, чем в оценке - используем значение из опций
        if (tableDataLimit<limit && tableDataLimit!==-1) limit = tableDataLimit

        // для неограниченных списков или превышающих maxUncontrolledLimit
        if (total !== 0 || tableDataLimit==-1 || tableDataLimit>maxUncontrolledLimit) {
            // ответ сервера
            let response = null
            // загружаем данные в массиве циклом
            while(tableDataLimit===null || tableDataLimit==-1 || tableDataLimit > data.length) {
                // console.log(`offset=${offset}`)
                // опции для текущего пакета данных
                let pageOptions = {...options, ...{
                    limit:limit, offset: offset, page:null, itemsPerPage:null
                }}
                // готовим запрос исходя из смещения и пакета данных
                let pageUrl = this.prepareApiUrl(table, pageOptions, odata)
                // получаем данные
                response = await axios.get(pageUrl,store.getters.axiosCfg)
                try {
                    if (response.data.data.length>0) {
                        // обновим значение total
                        total = response.data.count
                        // если в лимитах указано -1 - установим total
                        if (tableDataLimit===null || tableDataLimit==-1) tableDataLimit = total
                        // время обработки всего
                        totalTime += parseFloat(response.data.time_request)
                        // данные складываем в массив
                        data = [...data, ...response.data.data]
                        // следующая страница
                        offset += limit
                    }
                } catch (error) {
                    // данные не получены
                    is_error = true
                }
                if (response.data.data !== undefined && response.data.data.length==0) break
            }
        }
        return {data, is_error, error, time:totalTime, count:total}
    },
    // проведение документа
    setPost(payload) {
        if (!!payload.id && !!payload.table) {
            // payload = {table: table, id: id, data:{'is_active':1, 'is_in':1, 'is_out':0} }
            // console.log(`payload for post is ${JSON.stringify(payload)}`)
            let fd = new FormData()
            for(let i in payload.values) {
                fd.append(i, payload.values[i])
            }
            // проведение - всегда изменение
            fd.append("_method", "PATCH")
            // параметры запроса
            const formDataConfig = {...store.getters.axiosCfg, 'content-type': 'multipart/form-data' }
            // возвращаем промис
            return axios.post(`/api/v1/${payload.table}/${payload.id}/post`, fd, formDataConfig)
        } else {
            return new Promise((reject)=>{
                console.warn(`ошибка параметров, ожидалось (table, id), передано (${payload.table}, ${payload.id})`)
                reject('ошибка параметров')
            })
        }
    },
    // сохранение записи
    saveTableRow(table, modType, model, data, copyOptions) {
        // console.log(table, modType)
        // console.log(JSON.stringify(model))
        // console.log(JSON.stringify(data))
        // данные формы
        let formData = this.prepareFormData(data, model)
        // console.log(JSON.stringify(data.id))
        // // настройки запроса
        const formDataConfig = {...store.getters.axiosCfg, 'content-type': 'multipart/form-data' }
        // добавим modType
        formData.append("_mod_type", modType)
        // выполняем запрос
        switch (modType) {
            case 'edit': {
                // редактирование
                formData.append("_method", "PUT")
                return axios.post(`/api/v1/${table}/${data.id}`, formData, formDataConfig)
            }
            case 'add': {
                // добавление
                formData.append("_method", "POST")
                return axios.post(`/api/v1/${table}`, formData, formDataConfig)
            }
            case 'copy': {
                // добавление
                formData.append("_method", "POST")
                // параметры копирования
                formData.append("_copy_options", copyOptions?JSON.stringify(copyOptions):null)
                return axios.post(`/api/v1/${table}`, formData, formDataConfig)
            }
        }
    },
    getTableRow(table, id) {
        return axios.get(`/api/v1/${table}/${id}?extensions=select_list_title`, store.getters.axiosCfg)
    },
    getTableFiles(table,id,type) {
        return axios.get(`/api/v1/files/${table}/${id}/${type}`, store.getters.axiosCfg)
    },
    getTableFileList(table) {
        return axios.get(`/api/v1/file_list/${table}`, store.getters.axiosCfg)
    },
    removeTableRow(table,id) {
        return axios.delete(`/api/v1/${table}/${id}`, store.getters.axiosCfg)
    },
}



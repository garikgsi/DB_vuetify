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
                                        fd.append(fname, file, file.name)
                                    }
                                } else {
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
    getTableData(table, options, odata='data') {
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

        return axios.get(url,store.getters.axiosCfg)
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



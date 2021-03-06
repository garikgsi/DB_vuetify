import axios from 'axios'
import store from './store/store.js'


export default {
    request(url,method, data=null, model=null) {
        let formData = null
        if (data) {
            formData = this.prepareFormData(data, model)
        } else {
            formData = new FormData()
        }
        switch (method) {
            case 'get': {
                return axios.get(url,store.getters.axiosCfg)
            }
            case 'post': {
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
        let fd = new FormData()
        if (model) {
            model.forEach((field)=>{
                let fname = field.name
                let ftype = field.type
                let uncheckedFields = ['text', 'string', 'image', 'file', 'document']
                if (fname in formData || uncheckedFields.indexOf(ftype)!==-1) {
                    let fval = formData[field.name]
                    switch (ftype) {
                        case 'image': case 'file': case 'document': {
                            if (!!fval && typeof(fval)=='object' && fval.length>0) {
                                for (let file of fval) {
                                    fd.set(fname, file, file.name)
                                }
                            } else {
                                fd.append(fname, null)
                            }
                        } break;
                        case 'boolean': {
                            if (fval===false) {
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
                        default: {
                            fd.append(fname, fval)
                        }
                    }
                }
            })
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
        return fd
    },
    saveMenuPoint(menuPoint) {
        // ???????????? ??????????
        let formData = this.prepareFormData(menuPoint)
        // ?????????????????? ??????????????
        const formDataConfig = {...store.getters.axiosCfg, 'content-type': 'multipart/form-data' }

        if (menuPoint.id>0) {
            // ????????????????????????????
            formData.append("_method", "PUT")
            return axios.post('/api/v1/site_menu_points/'+menuPoint.id, formData, formDataConfig)
        } else {
            // ???????????????? ???????????? ??????????????
            formData.append("_method", "POST")
            return axios.post('/api/v1/site_menu_points/', formData, formDataConfig)
        }
    },
    saveContent(content,menuPointId) {
        // ?????????????? id ?????????????????????????? ???????????? ????????
        let realContent = {...content, menu_point_id : menuPointId}
        // ???????????? ??????????
        let formData = this.prepareFormData(realContent)
        // ?????????????????? ??????????????
        const formDataConfig = {...store.getters.axiosCfg, 'content-type': 'multipart/form-data' }

        if (content.id>0) {
            // ????????????????????????????
            formData.append("_method", "PUT")
            return axios.post('/api/v1/site_contents/'+content.id, formData, formDataConfig)
        } else {
            // ???????????????? ???????????? ??????????????
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
        let url = `/api/v1/${table}?odata=${odata}`
        // ???????????????????? ??????????
        if (options.page && options.itemsPerPage) {
            let offset = (options.page-1)*options.itemsPerPage
            url += `&offset=${offset}&limit=${options.itemsPerPage}`
        }
        // ????????????????????
        if (options.sortBy) {
            let i = 0
            let sortField = options.sortBy[i]
            let sortDesc = options.sortDesc[i]
            if (sortField) url += `&order=${sortField},${sortDesc?'desc':'asc'}`
        }
        if (options.search && options.search.length>0) {
            // ???????? ????????????
            url += `&search=${options.search}`
        }
        if (options.id || options.keyModel || options.filters) {
            // ???????????????? ?????????????????? id-??????????
            let filters = ''
            if (options.id) filters += `id in ${JSON.stringify(options.id)}`
            // ???????????? ???? keyModel
            if (options.keyModel && options.keyModel.length>0) {
                options.keyModel.forEach((km, i) => {
                    // console.log(`km=${km}, i=${i}`)
                    if (filters!=='' || i>0) filters += ' and '
                    for (let field in km) {
                        filters += `${field} eq ${km[field]}`
                    }
                })
            }
            // ??????????????
            if (options.filters) {
                for (let filter in options.filters) {
                    if (filters !== '') filters += ' and '
                    filters += `${filter} eq ${options.filters[filter]}`
                }
            }

            url += `&filter=${filters}`
        }
        // ???????????? ?????????????????? ??????????????
        if (options.fields && options.fields.length>0) {
            // &fields=fieldName1,fieldName2,...,fieldNameN
            url += '&fields='+options.fields.join()
        }
        // ???????????? ???? ??????????????
        if (options.groups && options.groups.length>0) {
            url += '&tags='+options.groups.join()
        }

        return axios.get(url,store.getters.axiosCfg)
    },
    saveTableRow(table, modType, model, data) {
        // console.log(table, modType)
        // console.log(JSON.stringify(model))
        // console.log(JSON.stringify(data))
        // ???????????? ??????????
        let formData = this.prepareFormData(data, model)
        // console.log(JSON.stringify(data.id))
        // // ?????????????????? ??????????????
        const formDataConfig = {...store.getters.axiosCfg, 'content-type': 'multipart/form-data' }

        if (modType=='edit') {
            // ????????????????????????????
            formData.append("_method", "PUT")
            return axios.post(`/api/v1/${table}/${data.id}`, formData, formDataConfig)
        } else {
            // ????????????????????
            formData.append("_method", "POST")
            return axios.post(`/api/v1/${table}`, formData, formDataConfig)
        }
    },
    getTableRow(table, id) {
        return axios.get(`/api/v1/${table}/${id}`, store.getters.axiosCfg)
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



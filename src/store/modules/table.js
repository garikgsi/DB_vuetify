// import { filter } from 'vue/types/umd'
import Vue from 'vue'
import Services from '../../siteAdminServices.js'

export default {

    state: {
        // констатнты
        const: {
            // типы полей, которые фильтруем
            filterTypes : ['date', 'datetime', 'integer', 'select', 'boolean','radio'],
            // типы полей, по котрым можно сортировать таблицу
            sortableTypes: ['date', 'datetime', 'integer', 'boolean','string'],
            // имена полей которые игнорируем (служебные)
            serviceFields : ['id', 'uuid', 'created_by', 'created_at', 'updated_by', 'updated_at','deleted_by','is_protected','sync_1c_at'],
            // текстовые типы полей по которым осуществляется поиск
            searchTextTypes : ['string','integer','email'],
            // опции таблицы по умолчанию
            tableOptions: {
                page: 1,
                itemsPerPage: 10,
                sortBy: ['name'],
                sortDesc: false,
                multiSort: false,
            },
            // умолчальные опции для вывода таблиц
            defaultTableOptions: {
                page: 1,
                itemsPerPage: 10,
                multiSort: false
            }
        },
        // модель таблицы
        model:{},
        // расширения таблицы
        extensions:{},
        // данные формы
        formData:{},
        // данные для селекта
        selectData: {},
        // данные таблицы
        tableData:{},
        // количество данных в таблице
        tableDataCount:{},
        // файлы
        files: {},
        // список файлов
        fileList: {},
        // фильтры
        filters: {},
        // значения фильтров
        filterValues: {},
        // значения опций таблицы (страница, строк на страницу, сортировака и т.п.)
        tableOptions: {
            'sklad_receives': {sortBy: ['in_doc_date'], sortDesc: [true], multiSort: false},
            'sklad_moves': {sortBy: ['doc_date'], sortDesc: [true], multiSort: false}
        },
        // отображение столбцов в таблице по умолчанию
        showCols:{
            'nomenklatura': ['id', 'name', 'part_num','manufacturer_id','description','manufacturer','main_image','ostatok','avg_price','stock_balance'],
            'sklad_receives': ['in_doc_num','in_doc_date','summa','kontragent_id','sklad_id']
        },
        // отображение столбцов в мобильной версии
        showMobileCols: {
            'nomenklatura': ['${name} (${description})', 'Производитель: ${manufacturer}','Остаток: ${ostatok} ${ed_ism}'],
            'sotrudniks' : ['fio', 'firm_position'],
            'sklad_receives' : [' № ${doc_num} от ${doc_date}', 'от ${kontragent}', 'на сумму ${summa}']
        }
    },

    mutations: {
        SET_TABLE_MODEL(state, payload) {
            // paylod must be format:
            // {tableName: 'table', model:{some:model}, extensions:{ext1:true}}
            if (state.model[payload.table]) {
                state.model[payload.table] = payload.model
            } else {
                Vue.set(state.model, payload.table, payload.model)
            }
            // if (state.extensions[payload.table]) {
            //     state.extensions[payload.table] = payload.extensions
            // } else {
            //     Vue.set(state.extensions, payload.table, payload.extensions)
            // }
        },
        SET_TABLE_FILTERS(state, payload) {
            if (state.filters[payload.table]) {
                state.filters[payload.table] = payload.filters
            } else {
                Vue.set(state.filters, payload.table, payload.filters)
            }
        },
        SYNC_TABLE_OPTIONS(state, payload) {
            // определим текущие опции
            let curOptions = state.const.defaultTableOptions
            if (state.tableOptions[payload.table]) {
                curOptions = state.tableOptions[payload.table]
            } else {
                Vue.set(state.tableOptions, payload.table, state.const.defaultTableOptions)
            }
            // заменяем из полученных
            state.tableOptions[payload.table] = {...curOptions, ...payload.options}
        },
        CLEAR_TABLE_OPTIONS(state, table) {
            if (state.tableOptions[table]) {
                state.tableOptions[table] = state.const.defaultTableOptions
            } else {
                Vue.set(state.tableOptions, table, state.const.defaultTableOptions)
            }
        },
        SET_TABLE_FILTER_VALUES(state, payload) {
            if (state.filterValues[payload.table]) {
                state.filterValues[payload.table] = payload.data
            } else {
                Vue.set(state.filterValues, payload.table, payload.data)
            }
        },
        SET_SELECT_DATA(state, payload) {
            // paylod must be format:
            // {tableName: 'table', model:{some:model}, extensions:{ext1:true}}
            if (state.selectData[payload.table]) {
                state.selectData[payload.table] = payload.data
            } else {
                Vue.set(state.selectData, payload.table, payload.data)
            }
        },
        REMOVE_ROW_ID(state, payload) {
            // удаляем из данных таблицы
            if (state.tableData[payload.table]) {
                state.tableData[payload.table] = state.tableData[payload.table].filter((item)=>{
// TODO
// прикорячить проверку если id=массив
                    return item.id!==payload.id
                })
            }
            // удаляем из данных селекта
            if (state.selectData[payload.table]) {
                state.selectData[payload.table] = state.selectData[payload.table].filter((item)=>{
// TODO
// прикорячить проверку если id=массив
                    return item.id!==payload.id
                })
            }
            // уменьшим кол-во данных в таблице
// TODO
// уменьшать на кол-во записей в массиве id
            if (state.tableDataCount[payload.table])
                state.tableDataCount[payload.table] -= 1
        },
        SET_FORM_DATA(state, payload) {
            // paylod must be format:
            // {tableName: 'table', data:{some:data}}
// console.log(`commit data ${JSON.stringify(payload)}`)

            // полиморфные поля
            // if (state.model[payload.tableName]) {
            //     let model = state.model[payload.tableName]
            //     model.fields.forEach(field=>{
            //         if (field.type == 'morph') {
            //             let fieldValue = {}
            //             fieldValue[field.name+'_id'] = payload.data[field.name+'_id']
            //             fieldValue[field.name+'_type'] = payload.data[field.name+'_type']
            //             payload.data[field.name] = fieldValue
            //         }
            //     })
            // }

            if (state.formData[payload.tableName]) {
                if (state.formData[payload.tableName][payload.data.id]) {
                    state.formData[payload.tableName][payload.data.id] = payload.data
                } else {
                     Vue.set(state.formData[payload.tableName], payload.data.id, payload.data)
                }
            } else {
                Vue.set(state.formData, payload.tableName, {})
                Vue.set(state.formData[payload.tableName], payload.data.id, payload.data)
            }

            // изменим значение селекта
            if (payload.data.select_list_title) {
                if (state.selectData[payload.tableName]) {
                    let newItem = {'id':payload.data.id, 'select_list_title':payload.data.select_list_title}
                    let findId = false
                    let selectDataState = state.selectData[payload.tableName]
                    state.selectData[payload.tableName] = selectDataState.map(item=>{
                        if (item.id == payload.data.id) {
                            findId = true
                            // console.log(`change ${JSON.stringify(newItem)}`)
                            return newItem
                        } else {
                            return item
                        }
                    })
                    if (!findId) {
                        // console.log(`push ${JSON.stringify(newItem)}`)
                        let newData = state.selectData[payload.tableName]
                        newData.push(newItem)
                        state.selectData[payload.tableName] = newData
                    }
                } else {
                    // console.log(`no state.selectData[payload.table]`)
                }
            } else {
                // console.log(`no select_list_title`)
            }
        },
        SET_TABLE_DATA(state, payload) {
            // paylod must be format:
            // {tableName: 'table', data:{some:data}}
            if (state.tableData[payload.table]) {
                state.tableData[payload.table] = payload.data
            } else {
                Vue.set(state.tableData, payload.table, payload.data)
            }
        },
        UPDATE_TABLE_DATA(state, payload) {
            if (state.tableData[payload.table]) {
                state.tableData[payload.table] = state.tableData[payload.table].map(item=>{
                    if (payload.data.id === item.id) {
                        return payload.data
                    } else {
                        return item
                    }
                })
            }
        },
        SET_TABLE_DATA_COUNT(state, payload) {
            // paylod must be format:
            // {tableName: 'table', data:{some:data}}
            if (state.tableDataCount[payload.table]) {
                state.tableDataCount[payload.table] = payload.count
            } else {
                Vue.set(state.tableDataCount, payload.table, payload.count)
            }
        },
        SET_FILES(state, payload) {
            state.files[payload.type] = payload.files
        },
        SET_FILE_LIST(state,payload) {
            if (state.fileList[payload.table]) {
                state.fileList[payload.table] = payload.files
            } else {
                Vue.set(state.fileList, payload.table, payload.files)
            }
        },
        SET_TABLE_COLUMNS(state, payload) {
            if (state.showCols[payload.table]) {
                state.showCols[payload.table] = payload.data
            } else {
                Vue.set(state.showCols, payload.table, payload.data)
            }
        },

    },

    actions: {
        getTableModel({state, commit, dispatch},tableName) {
// console.log('action gettablemodel started')
            dispatch('setLoading', true)
            return new Promise((resolve, reject) => {
                if (state.model[tableName]) {
                    let res = {model:state.model[tableName]}
                    // if (state.extensions[tableName]) res.extensions = state.extensions[tableName]
                    dispatch('setLoading', false)
                    resolve(res)
                } else {
                    Services.getModel(tableName)
                    .then((response)=>{
    // console.log(`vuex-table-model-response ${JSON.stringify(response)}`)

                        if (response.data.model) {
                            let model = response.data.model
                            // загрузим дочерние таблицы
                            if (model.extensions.sub_tables) {
                                for (let table in model.extensions.sub_tables) {
                                    let sub_table = model.extensions.sub_tables[table]
// console.log('dispatch sub_table gettablemodel started')
                                    if (sub_table.table) dispatch('getTableModel',sub_table.table)
                                }
                            }

                            // let extensions = response.data.extensions
                            commit('SET_TABLE_MODEL',{table: tableName, model:model})
                        } else {
                            dispatch('setInformation', {color:'error',timeout:-1, text:response.data.error[0] || 'Не удалось получить модель '+tableName+' с сервера'})
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
                }

            })
        },
        // сохранить и провести
        saveAndPost({commit,dispatch}, payload) {
            return new Promise((resolve, reject) => {
                dispatch('saveTableRow', payload)
                    // Services.saveTableRow(payload.table, payload.modType, state.model[payload.table], payload.values)
                    .then((response)=> {
                        if (payload.postValues != undefined) {
                            // console.log(`post ${payload.postValues}`)
                            if (response) {
                                let newData = response
                                // подготовим пайлоад для проведения
                                let postPayload = {...payload}
                                delete postPayload.values
                                postPayload.values = postPayload.postValues
                                delete postPayload.postValues
                                postPayload.id = newData.id
                                // проводим
                                // console.log(`postPayload=${JSON.stringify(postPayload)}`)
                                dispatch('setPost',postPayload)
                                    .then((postResponse)=>{
                                        dispatch('setInformation', postPayload.message?postPayload.message:'Данные успешно сохранены')
                                        if (postResponse.data.data) {
                                            let formData = postResponse.data.data
                                            commit('SET_FORM_DATA', {tableName: payload.table, data:formData})
                                            commit('UPDATE_TABLE_DATA', {table:payload.table, data:formData})
                                            resolve(postResponse.data.data)
                                        } else {
                                            resolve(response)
                                        }
                                    })
                                    .catch((e)=>{
                                        reject(e)
                                    })
                                    .finally(()=>{
                                        dispatch('setLoading', false)
                                    })
                            } else {
                                dispatch('setInformation', {color:'error', text:'Данные для проведения документа не получены'})
                            }
                        } else {
                            resolve(response)
                        }
                        // resolve(response)
                    })
                    .catch((e)=>{
                        dispatch('appErrorException', e)
                        reject(e)
                    })
                    .finally(()=>{
                        dispatch('setLoading', false)
                    })
            })
        },

        // провести документ
        setPost({commit,dispatch}, payload) {
            // структура payload:
            // {table: table, id: id, values:{'is_active':1, 'is_in':1, 'is_out':0} }
            dispatch('setLoading', true)
            return new Promise((resolve, reject) => {
                Services.setPost(payload)
                    .then(response=>{
                        dispatch('setInformation', payload.message?payload.message:'Документ проведен')
                        if (response.data.data) {
                            let formData = response.data.data
                            commit('SET_FORM_DATA', {tableName: payload.table, data:formData})
                            commit('UPDATE_TABLE_DATA', {table:payload.table, data:formData})
                        }
                        resolve(response)
                    })
                    .catch(error=>{
                        dispatch('appErrorException', error)
                        reject(error)
                    })
                    .finally(()=>{
                        dispatch('setLoading', false)
                    })
            })
        },
        // сохранить строку таблицы
        saveTableRow({state, commit, dispatch}, payload) {
            return new Promise((resolve, reject) => {
// console.log(`values for save are ${JSON.stringify(payload.values)}, model is ${JSON.stringify(state.model[payload.table])}`)
            dispatch('getTableModel', payload.table)
                .then(()=>{
                    dispatch('setLoading', true)
                        Services.saveTableRow(payload.table, payload.modType, state.model[payload.table], payload.values)
                        .then((response)=> {
                            let formData = null
                            if (response) {
                                formData = response.data.data
                                commit('SET_FORM_DATA', {tableName: payload.table, data:formData})
                                commit('UPDATE_TABLE_DATA', {table:payload.table, data:formData})
                                dispatch('setInformation', 'Данные успешно сохранены')
                            }
                            resolve(formData)
                        })
                        .catch((e)=>{
                            dispatch('appErrorException', e)
                            reject(e)
                        })
                        .finally(()=>{
                            dispatch('setLoading', false)
                        })
                    })
                })
        },
        removeTableRow({commit, dispatch}, payload) {
            dispatch('setLoading', true)
            return new Promise((resolve, reject) => {
                Services.removeTableRow(payload.table, payload.id)
                .then((response)=>{
                    commit('REMOVE_ROW_ID',payload)
                    dispatch('setInformation', 'Запись удалена')
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

        getFormData({commit, dispatch}, payload) {
            // payload is {tableName: table, id:row_id}
            dispatch('setLoading', true)
            return Services.getTableRow(payload.tableName, payload.id)
                .then((response)=>{
                    if (response.data.data) {
                        let formData = response.data.data
                        commit('SET_FORM_DATA',{tableName: payload.tableName, data:formData})
                    } else {
                        dispatch('setInformation', {color:'error',timeout:-1, text:response.data.error[0] || 'Не удалось получить данные id='+payload.id+' из '+payload.tableName})
                    }
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
                        dispatch('setInformation', {color:'error',timeout:-1, text: 'Неизвестный ответ сервера'})
                    }
                })
                .finally(()=>{
                    dispatch('setLoading', false)
                })
        },
        setFormData({commit}, payload) {
            // payload is {tableName: table, id:row_id}
            commit('SET_FORM_DATA',{tableName: payload.tableName, data:payload.data})
        },
        setTableFilters({commit}, payload) {
            // payload is {table: table, filters:data}
            commit('SET_TABLE_FILTERS',{table: payload.table, filters:payload.data})
        },
        getTableFilters({state, commit, dispatch, getters},table) {
            return new Promise((resolve, reject) => {
                dispatch('getTableModel',table)
                    .then(()=>{
                        let hasText = false
                        let res = []
                        if (state.model[table]) {
                            let model = state.model[table].fields
                            res = model.filter(field=>{
                                if (getters.serviceFieldNames.indexOf(field.name)===-1) {
                                    if (!hasText && getters.searchFieldTypes.indexOf(field.type)!==-1) hasText = true
                                    return getters.filterFieldTypes.indexOf(field.type)!==-1 && !field.ignore_filters
                                }
                            })
                        }
                        if (state.model[table].extensions) {
                            if (state.model[table].extensions.has_groups) {
                                res.unshift({'name':'groups', 'type':'groups', 'table':table,'title':'Фильтр по группам'})
                            }
                        }
                        if (hasText) res.unshift({'name':'search', 'type':'string', 'title':'Поиск в тексте'})
                        commit('SET_TABLE_FILTERS',{table: table, filters:res})
                        resolve(res)
                    })
                    .catch((e)=>{
                        reject(e)
                    })
            })
        },
        syncTableOptions({commit},payload) {
            return new Promise((resolve) => {
                commit('SYNC_TABLE_OPTIONS',payload)
                    resolve()
            })
        },
        clearTableOptions({commit}, table) {
            return new Promise((resolve) => {
                commit('CLEAR_TABLE_OPTIONS', table)
                resolve()
            })
        },
        setTableColumns({commit}, payload) {
            commit('SET_TABLE_COLUMNS',{table: payload.table, data:payload.data})
        },
        setTableFilterValues({commit}, payload) {
            // payload is {table: table, filters:data}
            return new Promise((resolve) => {
                commit('SET_TABLE_FILTER_VALUES',{table: payload.table, data:payload.data})
                resolve()
            })
        },
        getSelectData({state, commit, dispatch},table) {
            return new Promise((resolve, reject) => {
                if (state.selectData[table]) {
                    let res = state.selectData[table]
                    // if (state.extensions[tableName]) res.extensions = state.extensions[tableName]
                    resolve(res)
                } else {
                    dispatch('setLoading', true)
                    let dataOptions = {odata:'list', limit:-1}
                    dispatch('getTableData',{table:table, options:dataOptions})
                        .then((response)=>{
                            if (response.data) {
                                let tableData = response.data.data
                                let pl = {'table': table, 'data':tableData}
                                commit('SET_SELECT_DATA',pl)
                                resolve(tableData)
                            } else {
                                resolve(response)
                            }
                        })
                        .catch(e=>{
                            reject(e)
                        })
                        .finally(()=>{
                            dispatch('setLoading', false)
                        })
                }
            })
        },
        getForeignSelectData({dispatch},payload) {
            if (payload.options && Object.keys(payload.options).length>0) {
                return new Promise((resolve, reject) => {
                    dispatch('setLoading', true)
                    let dataOptions = {odata:'list', limit:-1}
                    if (payload.options) {
                        dataOptions = {...payload.options, ...dataOptions}
                    }
                    dispatch('getTableData',{table:payload.table, options:dataOptions})
                        .then((response)=>{
                            if (response.data) {
                                let tableData = response.data.data
                                resolve(tableData)
                            } else {
                                resolve(response)
                            }
                        })
                        .catch(e=>{
                            reject(e)
                        })
                        .finally(()=>{
                            dispatch('setLoading', false)
                        })
                })
            } else {
                return dispatch('getSelectData',payload.table)
            }
        },
        getTableData({state, commit, dispatch},payload) {
            // payload is {tableName: table, options:{some:options}}
            dispatch('setLoading', true)
            let odata = 'data'
            // текущие опции таблицы
            let curOptions
            if (state.tableOptions[payload.table]) {
                curOptions = {...state.tableOptions[payload.table]}
            } else {
                curOptions = {...state.const.defaultTableOptions}
            }
            // если переданы опции
            if (payload.options) {
                if (payload.options.odata) {
                    odata = payload.options.odata
                    delete payload.options.odata
                }
                // если еще есть опции
                if (Object.keys(payload.options).length>0) {
                    curOptions = {...curOptions, ...payload.options}
                }
            }
            if (odata != 'list') {
                // обработаем фильтры
                if (state.filterValues[payload.table]) {
                    let filterValues = {...state.filterValues[payload.table]}
                    // если есть поисковая строка
                    if (payload.options && payload.options.search) {
                        curOptions.search = payload.options.search
                    } else {
                        if (filterValues.search) {
                            curOptions.search = filterValues.search
                            delete filterValues.search
                        }
                    }
                    // если переданы группы
                    let groups = []
                    if (filterValues.groups && filterValues.groups.length>0) {
                        groups = [...filterValues.groups]

                    }
                    if (payload.options && payload.options.groups && payload.options.length>0)  groups = [...groups, ...payload.groups]
                    if (groups.length>0) curOptions.groups = groups
                    // все, что осталось в стейте - это фильтры
                    let filters = {}
                    if (Object.keys(filterValues).length>0) {
                        filters = {...filterValues}
                    }
                    if (payload.options && payload.options.filters) {
                        filters = {...filters, ...payload.options.filters}
                    }
                    if (Object.keys(filters).length>0) {
                        curOptions.filters = filters
                    }
                }
            }
            // проверка keyModel
            if (payload.keyModel!==undefined && payload.keyModel.length>0) {
                curOptions.keyModel = payload.keyModel
            }

            if (state.model[payload.table]) {
                let model = state.model[payload.table]
                if (model.extensions.props.table_type != undefined) curOptions.table_type = model.extensions.props.table_type
            }

            return new Promise((resolve, reject) => {
                Services.getTableData(payload.table, curOptions, odata)
                .then((response)=>{
                    if (response.data) {
                        let tableData = response.data.data
                        let pl = {'table': payload.table, 'data':tableData}
                        switch (odata) {
                            case 'list': {
                                // commit('SET_SELECT_DATA',pl)
                            } break;
                            default: {
                                commit('SET_TABLE_DATA',pl)
                                if (response.data.count) commit('SET_TABLE_DATA_COUNT', {'table':payload.table, 'count':response.data.count})
                            }
                        }
                    } else {
                        dispatch('setInformation', {'color':'error','timeout':-1, 'text':response.data.error[0] || 'Не удалось получить данные из '+payload.tableName})
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
        getFiles({commit, dispatch},payload) {
            // payload is {tableName: table, id:row_id, type:'image'}
            dispatch('setLoading', true)
            return new Promise((resolve, reject) => {
                Services.getTableFiles(payload.tableName, payload.id, payload.type)
                .then((response)=>{
                    if (response.data.data) {
                        let files = response.data.data
                        commit('SET_FILES',{type:payload.type, files:files})
                        dispatch('setInformation', 'Список файлов для записи успешно загружен')
                    } else {
                        dispatch('setInformation', {color:'error',timeout:-1, text:response.data.error[0] || 'Не удалось получить список файлов'})
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
        saveFile({dispatch},payload) {
            dispatch('setLoading', true)
            return new Promise((resolve, reject) => {
                let url = `/api/v1/files/${payload.table}/${payload.id}`
// console.log(`url is ${url}`)
// console.log('file data is '+JSON.stringify(payload.values))
// console.log('payload is '+JSON.stringify(payload))
            Services.request(url,'post', payload.values, payload.model)
                .then((response)=> {
                    dispatch('setInformation', 'Данные успешно сохранены')
                    dispatch('setLoading', false)
                    resolve(response)
                })
                .catch((e)=>{
                    dispatch('appErrorException', e)
                    dispatch('setLoading', false)
                    reject(e)
                })
            })
        },
        editFile({dispatch},payload) {
            dispatch('setLoading', true)
            return new Promise((resolve, reject) => {
                let url = `/api/v1/files/${payload.table}/${payload.id}/${payload.file_id}`
                Services.request(url,'patch', payload.values, payload.model)
                .then((response)=> {
                    dispatch('setInformation', 'Данные успешно изменены')
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
                            case 413: {
                                dispatch('setInformation', {color:'error',timeout:-1, text:errData.error[0] || 'Слишком много данных'})
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
        deleteFile({dispatch},payload) {
            dispatch('setLoading', true)
            return new Promise((resolve, reject) => {
                let url = `/api/v1/files/${payload.table}/${payload.id}/${payload.file_id}`
                Services.request(url,'delete')
                .then((response)=> {
                    dispatch('setInformation', 'Файл успешно удален')
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
                            case 413: {
                                dispatch('setInformation', {color:'error',timeout:-1, text:errData.error[0] || 'Слишком много данных'})
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
        getFileList({commit, dispatch},table) {
            dispatch('setLoading', true)
            return new Promise((resolve, reject) => {
                Services.getTableFileList(table)
                .then((response)=>{
                    if (response.data.data) {
                        let files = response.data.data
                        commit('SET_FILE_LIST',{table:table, files:files})
                        dispatch('setInformation', 'Список файлов успешно загружен')
                    } else {
                        dispatch('setInformation', {color:'error',timeout:-1, text:'Не удалось получить список возможных файлов'})
                    }
                    resolve(response)
                })
                .catch((e)=>{
                    if (e.response) {
                        let code = e.response.status
                        switch (code) {
                            case 403: {
                                dispatch('setInformation', {color:'error', timeout:-1, text:'Ошибка прав доступа'})
                            } break;
                            default: {
                                dispatch('setInformation', {color:'error',timeout:-1, text:'Неизвестная ошибка сервера'})
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
        syncFiles({dispatch},payload) {
            dispatch('setLoading', true)
            // Route::post('/groups/{table}/{id}/{tag_name}','APIController@add_group')->middleware('auth:api'); // вставить новую группу tag_name и присвоить ее id tdble-id
            return new Promise((resolve, reject) => {
                let url = `/api/v1/file_list/${payload.table}/${payload.id}`
                Services.request(url, 'post', {data:payload.data})
                .then((response)=>{
                    if (response.data.data) {
                        dispatch('setInformation', 'Список файлов сохранен')
                    } else {
                        dispatch('setInformation', {color:'error',timeout:-1, text:response.data.error[0] || 'Не удалось сохранить список файлов'})
                    }
                    // обновим данные
                    dispatch('getFileList', payload.table)
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
        // выдаем файл печатной формы
        getPrintForm({dispatch}, payload) {
            return new Promise((resolve, reject) => {
                dispatch('setLoading', true)
                let url = `/api/v1/forms/${payload.table}/${payload.id}`
                Services.request(url,'get')
                    .then((response)=> {
                        if (response.data) {
                            resolve(response.data)
                        } else {
                            dispatch('setInformation', {color:'error',timeout:-1, text:'Файл PDF не передан сервером'})
                            reject(false)
                        }
                    })
                    .catch((e)=>{
                        dispatch('appErrorException', e)
                        reject(e)
                    })
                    .finally(()=>{
                        dispatch('setLoading', false)
                    })
            })
        },

    },

    getters: {
        filterFieldTypes(state) {
            return state.const.filterTypes
        },
        sortFieldTypes(state) {
            return state.const.sortableTypes
        },
        serviceFieldNames(state) {
            return state.const.serviceFields
        },
        searchFieldTypes(state) {
            return state.const.searchTextTypes
        },
        defaultTableOptions(state) {
            return state.const.defaultTableOptions
        },
        tableFiles(state) {
            return state.files
        },
        mobileTableCols(state) {
            return state.showMobileCols
        }


        // tableModel: (state) => (tableName) => {
        //     if (tableName in state.model) {
        //         return state.model[tableName]
        //     } else {
        //         return []
        //     }
        // },
        // tableExtensions: (state) => (tableName) => {
        //     if (tableName in state.extensions) {
        //         return state.extensions[tableName]
        //     } else {
        //         return []
        //     }
        // },
        // tableData: (state) => (tableName) => {
        //     if (tableName in state.tableData) {
        //         return state.tableData[tableName]
        //     } else {
        //         return []
        //     }
        // },
        // formData: (state) => (tableName) => {
        //     if (tableName in state.formData) {
        //         return state.formData[tableName]
        //     } else {
        //         return []
        //     }
        // },

    }
}

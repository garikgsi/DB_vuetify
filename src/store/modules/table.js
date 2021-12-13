// import { filter } from 'vue/types/umd'
import Vue from 'vue'

export default {

    state: {
        // констатнты
        const: {
            // количество записей в селект, которое грузим по умолчанию
            selectDataLimit: 10,
            // максимальное количество записей в таблицы для кэширования
            maxSelectDataCache: 100,
            // типы полей, которые фильтруем
            filterTypes : ['date', 'datetime', 'integer', 'select', 'boolean', 'radio'],
            // типы полей, по котрым можно сортировать таблицу
            sortableTypes: ['date', 'datetime', 'integer', 'boolean','string'],
            // имена полей которые игнорируем (служебные)
            serviceFields : ['id', 'uuid', 'created_by', 'created_at', 'updated_by', 'updated_at','deleted_by','is_protected','sync_1c_at'],
            // текстовые типы полей по которым осуществляется поиск
            searchTextTypes : ['string','integer','email'],
            // // опции таблицы по умолчанию
            // tableOptions: {
            //     page: 1,
            //     itemsPerPage: 10,
            //     sortBy: ['name'],
            //     sortDesc: false,
            //     multiSort: false,
            // },
            // умолчальные опции для вывода таблиц
            defaultTableOptions: {
                page: 1,
                itemsPerPage: 10,
                sortBy: ['name'],
                sortDesc: false,
                multiSort: false,
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
        // данные для scope в селект
        scopeSelectData: {},
        // данные кэша для селекта
        selectCacheData: {},
        // индикация загрузки данных в селект
        selectLoading: {},
        // кэшированные селекты таблицы
        cachedSelects: {},
        // кэшируется вся таблица в селект сразу
        cacheAllData:{},
        // всего записей в таблице (без фильтров)
        totalCount:{},
        // всего записей в scope
        scopeCount: {},
        // данные таблицы
        tableData:{},
        // количество данных в таблице
        tableDataCount:{},
        // количество данных в подчиненной таблице
        tableItemsDataCount:{},
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
            'sklad_moves': {sortBy: ['doc_date'], sortDesc: [true], multiSort: false},
            'kontragents': {sortBy: ['name'], sortDesc: [false], multiSort: false},
            'sklad_receive_items': {sortBy: ['id'], sortDesc: [false], limit: 100},
            'sklad_move_items': {sortBy: ['id'], sortDesc: [false], limit: 100},
            'recipe_items': {sortBy: ['id'], sortDesc: [false], limit: 100},
            'file_drivers': {sortBy: ['comment'], sortDesc: [false], limit: 10},
            'contracts': {sortBy: ['contract_date'], sortDesc: [true], multiSort: false},
            'orders': {sortBy: ['doc_date'], sortDesc: [true], multiSort: false},
        },
        // отображение столбцов в таблице по умолчанию
        showCols:{
            'nomenklatura': ['id', 'name', 'part_num','manufacturer_id','description','manufacturer','main_image','ostatok','avg_price','stock_balance'],
            'sklad_receives': ['in_doc_num','in_doc_date','summa','kontragent_id','sklad_id'],
            'kontragents': ['name', 'inn'],
            'orders':['doc_date','comment']
        },
        // отображение столбцов в мобильной версии
        showMobileCols: {
            'nomenklatura': ['${name} (${description})', 'Производитель: ${manufacturer}','Остаток: ${ostatok} ${ed_ism}'],
            'sotrudniks' : ['fio', 'firm_position'],
            'sklad_receives' : [' № ${doc_num} от ${doc_date}', 'от ${kontragent}', 'на сумму ${summa}'],
            'recipe_items' : [' № ${nomenklatura} x ${kolvo} ${ed_ism}'],
            'contracts' : [' № ${contract_num} от ${contract_date}', 'от ${kontragent}'],
            'orders' : [' № ${doc_num} от ${doc_date} (${comment})'],
        }
    },

    mutations: {
        SET_SCOPE_COUNT(state,{table, scope, count}) {
            if (state.scopeCount[table]) {
                if (state.scopeCount[table][scope]) {
                    state.scopeCount[table][scope] = count
                } else {
                    Vue.set(state.scopeCount[table], scope, count)
                }
            } else {
                Vue.set(state.scopeCount, table, {[scope]:count})
            }
        },
        SET_TOTAL_COUNT(state,{table, count}) {
            if (state.totalCount[table]) {
                state.totalCount[table] = count
            } else {
                Vue.set(state.totalCount, table, count)
            }
        },
        SET_CACHE_ALL_DATA(state,{table}) {
            if (state.cacheAllData[table]) {
                state.cacheAllData[table] = true
            } else {
                Vue.set(state.cacheAllData, table, true)
            }
        },
        UNSET_CACHE_ALL_DATA(state,{table}) {
            if (state.cacheAllData[table]) {
                state.cacheAllData[table] = false
            } else {
                Vue.set(state.cacheAllData, table, false)
            }
        },
        SET_CACHED_SELECT(state, {table,count}) {
            if (state.cachedSelects[table]) {
                state.cachedSelects[table] = count
            } else {
                Vue.set(state.cachedSelects, table, count)
            }
        },
        SET_SELECT_LOADING(state, {table, isLoading}) {
            if (state.selectLoading[table]) {
                state.selectLoading[table] = isLoading
            } else {
                Vue.set(state.selectLoading, table, isLoading)
            }
        },
        UNSET_CACHED_SELECT(state, table) {
            try {
                delete(state.cachedSelects[table])
            } catch (error) {
                // do nothing
            }
        },
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
        // зполняем данные селекта
        SET_SELECT_DATA(state, payload) {
            // paylod must be format:
            // {tableName: 'table', model:{some:model}, extensions:{ext1:true}}
            if (state.selectData[payload.table]) {
                state.selectData[payload.table] = payload.data
            } else {
                Vue.set(state.selectData, payload.table, payload.data)
            }
        },
        // очищаем данные селекта
        CLEAR_SELECT_DATA(state, payload) {
            try {
                state.selectData[payload.table] = []
            } catch (error) {
                Vue.set(state.selectData, payload.table, [])
            }
        },
        // добавляем данные к существующим в селекте
        ADD_SELECT_DATA(state, {table, data, scope}) {
            if (scope) {
                if (state.scopeSelectData[table]) {
                    if (state.scopeSelectData[table][scope]) {
                        state.scopeSelectData[table][scope] = [...state.scopeSelectData[table][scope], ...data]
                    } else {
                        Vue.set(state.scopeSelectData[table], scope, data)
                    }
                } else {
                    Vue.set(state.scopeSelectData, table, {[scope]:data})
                }
            } else {
                if (state.selectData[table]) {
                    state.selectData[table] = [...state.selectData[table], ...data]
                } else {
                    Vue.set(state.selectData, table, data)
                }
            }
        },
        // сохраняем данные кэша для больших селектов
        ADD_CACHE_SELECT_DATA(state, {table, data}) {
            if (state.selectCacheData[table]) {
                // state.selectCacheData[table] = [...state.selectCacheData[table], []]
            } else {
                Vue.set(state.selectCacheData, table, {})
            }
            // console.log(`cache for [${table}] = ${JSON.stringify(data)}`)
            if (data) {
                try {
                    data.forEach(row=>{
                        if (row.select_list_title) {
                            let cacheData = {id:row.id, select_list_title:row.select_list_title, deleted_at:row.deleted_at?true:false, main_image:row.main_image}
                            state.selectCacheData[table][row.id] = cacheData
                        }
                    })
                } catch (error) {
                    // console.log(`for table [${table}] data is invalid ${JSON.stringify(data)}`)
                }
            }
        },
        // удаляем из данных таблицы
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
                    let newItem = {'id':payload.data.id, 'select_list_title':payload.data.select_list_title, 'main_image':payload.data.main_image}
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
        // очищаем итемс-таблицу записи
        CLEAR_TABLE_ITEMS_DATA(state,{tableName, id, method}) {
            try {
                state.formData[tableName][id][method] = []
            } catch (error) {
                //  do nothing
            }
        },
        // добавляем пакет данных в итемс-таблицу записи
        ADD_TABLE_ITEMS_DATA(state, payload) {
            // console.log(`items add ${JSON.stringify(payload)}`)
            try {
                let dataItem = state.formData[payload.tableName][payload.id]
                try {
                    dataItem[payload.method] = [...dataItem[payload.method], ...payload.data]
                } catch (error) {
                    Vue.set(dataItem, payload.method, payload.data)
                }
            } catch (error) {
                try {
                    Vue.set(state.formData[payload.tableName], payload.id, {[payload.method]:payload.data})
                } catch (error) {
                    Vue.set(state.formData, payload.tableName, {[payload.id]:{[payload.method]:payload.data}})
                }
            }
        },
        SET_TABLE_ITEMS_DATA_COUNT(state, payload) {
            // tableItemsDataCount["sklad_receive"][9]["items"] = 2377
            try {
                state.tableItemsDataCount[payload.table][payload.id][payload.method] = payload.count
            } catch (error) {
                if (state.tableItemsDataCount[payload.table] === undefined) {
                    let data = {[payload.id]:{[payload.method]:payload.count}}
                    Vue.set(state.tableItemsDataCount, payload.table, data)
                } else {
                    if (state.tableItemsDataCount[payload.table][payload.id] === undefined) {
                        let data = {[payload.method]:payload.count}
                        Vue.set(state.tableItemsDataCount[payload.table], payload.id, data)
                    } else {
                        Vue.set(state.tableItemsDataCount[payload.table][payload.id],payload.method, payload.count)
                    }
                }
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
                // и в списке тоже исправим
                if (payload.data.select_list_title && state.selectData[payload.table]) {
                    state.selectData[payload.table] = state.selectData[payload.table].map(item=>{
                        if (payload.data.id === item.id) {
                            return {...item, ...{select_list_title:payload.data.select_list_title}}
                        } else {
                            return item
                        }
                    })
                }
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
        // очищаем данные таблицы
        CLEAR_TABLE_DATA(state, payload) {
            if (state.tableData[payload.table]) {
                // console.log(`data for table ${payload.table} cleared`)
                state.tableData[payload.table] = []
            } else {
                Vue.set(state.tableData, payload.table, [])
            }
        },
        // добавляем данные к существующим в таблице
        ADD_TABLE_DATA(state, payload) {
            // console.log(`add_table_data =${JSON.stringify(payload)}`)
            if (state.tableData[payload.table]) {
                state.tableData[payload.table] = [...state.tableData[payload.table], ...payload.data]
            } else {
                Vue.set(state.tableData, payload.table, payload.data)
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
        CLEAR_USER_INFO_DATA(state) {
            state.formData['user_info'] = null
        },
    },

    actions: {
        // очищаем информацию пользователя
        clearUserInfoData({commit}) {
            commit('CLEAR_USER_INFO_DATA')
        }, 

        // получаем модель таблицы
        async getTableModel({state, commit, dispatch},table) {
            return new Promise((resolve, reject)=>{
                if (table) {
                    // отдаем из стейта, если она там есть
                    if (state.model[table]) {
                        resolve(state.model[table])
                    } else {
                        // или получаем из API
                        dispatch('prepareApiUrl', {table, options:{}, odata:'model'}).then(url=>{
                            // console.log(`url=${url}`)
                            dispatch('request',{url, method:'get'}).then(({is_error, error, model, count})=>{
                            // console.log(`model=${JSON.stringify(model)}`)
                                if (is_error) {
                                    dispatch('pushError',error)
                                }
                                // установим модель
                                commit('SET_TABLE_MODEL',{table, model})
                                // установим кол-во записей в таблице без выборок
                                commit('SET_TOTAL_COUNT',{table,count:count-1})
                                // если есть подчиненные таблицы - подгрузим и их модели тоже
                                try {
                                    if (model.extensions.sub_tables) {
                                        for (let subTableName in model.extensions.sub_tables) {
                                            let sub_table = model.extensions.sub_tables[subTableName]
                                            if (sub_table.table) dispatch('getTableModel',sub_table.table)
                                        }
                                    }
                                } catch (error) {
                                    // no extensions
                                }
                                resolve(model)
                            })
                        })
                    }
                } else {
                    reject(`no table`)
                }
            })
        },

        // получаем данные по блокам, выполняя payload.callback функцию с каждой порцией данных
        async getPacketData({state, dispatch, commit}, dataPayload) {
            let payload = {...dataPayload}
            // режим отладки
            let debug = payload.table == 'fuck'
            let showResponse = false
            let showData = false
            if (debug) console.log(`get new packet (${JSON.stringify(payload)})`)
            // payload is {tableName: table, options:{some:options}, callback(response)}
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
                    // console.log(`filters=${JSON.stringify(filterValues)}`)
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
            } else {
                if (curOptions.extensions) {
                    curOptions.extensions = [...curOptions.extensions, ...['select_list_title']]
                } else {
                    curOptions.extensions = ['select_list_title']
                }
            }
            // проверка keyModel
            if (payload.keyModel!==undefined && payload.keyModel.length>0) {
                curOptions.keyModel = payload.keyModel
            }

            // есть ли модель в сторе
            try {
                let model = state.model[payload.table]
                if (model.extensions.props.table_type != undefined) curOptions.table_type = model.extensions.props.table_type
            } catch (error) {
                // no table_type
            }
            let hasModel = !!state.model[payload.table]

            // scope
            if (payload.options && payload.options.scope) {
                curOptions.scope = payload.options.scope
            }

            // проанализируем время загрузки и получим первую порцию данных
            // общее кол-во загружаемых данных
            let downloadLimit = null
            // текущее смещение
            let currentOffset = null
            // кол-во данных для анализа загрузки данных
            let estimateLimit = 3
            // кол-во данных для получения за 1 итерацию цикла
            let stepDataLimit = 10
            // время за которое должен приходить пакет данных (регулируем плавающее окно на основании time_request предыдущего пакета)
            let packetTime = 3
            // устанавливаем общее кол-во данных, если оно передано в опциях
            // console.log(`curOptions=${JSON.stringify(curOptions)}`)
            if (curOptions.limit && curOptions.limit >-1) {
                downloadLimit = curOptions.limit
            } else {
                if (curOptions.itemsPerPage && (curOptions.limit>-1 || !curOptions.limit)) {
                    downloadLimit = curOptions.itemsPerPage
                }
            }
            // устанавливаем начальное смещение, если оно передано в опциях
            if (curOptions.offset) {
                currentOffset = curOptions.offset
            } else {
                if (curOptions.page && curOptions.itemsPerPage) {
                    currentOffset = (curOptions.page-1) * curOptions.itemsPerPage
                }
            }
            // если смещение не определено запросом - установим дефолтное
            if (currentOffset === null) {
                currentOffset = 0
            }
            // лимит для расчета времени загрузки данных
            let estLimit = estimateLimit
            // если лимит определен и он меньше установок для лимита расчетного запроса - установим его
            if (downloadLimit !== null && downloadLimit < estLimit) {
                estLimit = downloadLimit
            }
            if (debug) console.log(`downloadLimit=${downloadLimit}, currentOffset=${currentOffset}`)            
            // данные
            let allData = []
            // кол-во полученных записей
            let getCount = 0
            // получаем пакетами данные в цикле
            do {
                // получаемые данные
                let stepOdata = odata
                // кол-во получаемых данных на шаге
                let stepLimit = stepDataLimit
                // выводить сообщение с подсчетом времени загрузки
                let needEstimate = false
                // если первая итерация 
                if (estLimit) {
                    stepLimit = estLimit
                    if (!hasModel) stepOdata = 'full'
                    // если кол-во загружаемых данных менее данных для расчета - не будем производить подсчет
                    if (estLimit > downloadLimit) {
                        needEstimate = true
                    }
                } else {
                    stepLimit = stepDataLimit
                }
                // проверим, кол-во оставшихся записей, чтобы не загружать лишнего
                if (downloadLimit) {
                    let recordsRemains = downloadLimit-getCount
                    if (recordsRemains<stepDataLimit) stepLimit = recordsRemains
                }
                if (debug) console.log(`currentOffset=${currentOffset}, stepLimit=${stepLimit}, stepOdata=${stepOdata}, needEstimate=${needEstimate}`)            
                // формируем объект опции для шага
                let pageOptions = {...curOptions, ...{limit:stepLimit, offset:currentOffset, page:null, itemsPerPage:null}}
                // формируем url для шага
                let pageUrl = await dispatch('prepareApiUrl', {table:payload.table, options:pageOptions, odata:stepOdata})
                if (debug) console.log(`pageUrl=${pageUrl} for pageOptions=${JSON.stringify(pageOptions)}`)                
                // получаем данные шага
                let response = await dispatch('request',{url:pageUrl, method:'get'})
                let {data, is_error, error, count, time_request, model} = response
                if (debug && showResponse) console.log(`response=${JSON.stringify(response)}`)                
                // если все прошло без ошибок
                if (!is_error) {
                    // если итоговый лимит не был установлени - установим его
                    if (downloadLimit === null) {
                        downloadLimit = count
                        // console.log(`DOWNLOAD LIMIT=${count}`)
                    }                    
                    // если это первая итерация
                    if (estLimit) {
                        // сохраним модель в стор
                        if (!hasModel) commit('SET_TABLE_MODEL',{table:payload.table, model})
                        // посчитаем время загрузки всего объема данных
                        if (needEstimate) {
                            // примерное время ожидания данных
                            let estimateTime = Math.round(downloadLimit * time_request / estLimit * 1000) / 1000
                            // выдаем сообщение
                            if (debug) {
                                if (model && estimateTime < 3) {
                                    console.log(`Время загрузки [${model.extensions.props.titles.table}] !без учета картинок! ожидается в течение ${estimateTime} сек`)
                                } else {
                                    console.log(`no model`)
                                }
                            }
                            if (model && estimateTime > 3) {
                                let humanTime = `${estimateTime} сек`
                                if (estimateTime>60) {
                                    humanTime = `${Math.round(estimateTime/60*100)/100} мин`
                                }

                                dispatch('setInformation', {color:'primary',timeout:estimateTime*1000,text:`Время загрузки [${model.extensions.props.titles.table}] !без учета картинок! ожидается в течение ${humanTime}`})
                            }
                        }
                        // больше анализировать не нужно
                        estLimit = null
                    }
                    // скорректируем длину пакета данных в зависимости от времени ответа сервера
                    // так чтобы время ответа была равна packetTime секундам
                    stepDataLimit = Math.ceil(stepLimit * packetTime / time_request)
                    // console.log(`stepDataLimit=${stepDataLimit}, stepLimit=${stepLimit}, packetTime=${packetTime}, time_request=${time_request}`)                    
                    // изменяем кол-во полученных данных
                    getCount += data.length
                    // устанавливаем смещение для следующего шага
                    currentOffset +=stepLimit
                    // добавляем данные в массив
                    allData = [...allData, ...data]
                    if (debug) {
                        if (showData) {
                            console.log(`allData = ${JSON.stringify(allData)}`)
                        } else {
                            console.log(`allData count = ${allData.length}, getCount=${getCount}`)
                        }
                    }
                    // выполняем callback-функцию, если она передана
                    if (payload.callback) {
                        if (debug && showData) {
                            console.log(`run callback with response.data ${JSON.stringify(response.data)}`)
                        }
                        payload.callback(response)
                    }
                } else {
                    dispatch('pushError', error)
                    // прерываем цикл
                    break
                }
                // обнулим ответ
                response = null
                // блокировка бесконечного цикла
                if (data.length==0 || currentOffset>=count) break
            } while (getCount < downloadLimit)

            return new Promise(resolve=>{
                resolve(allData)
            })
        },

        // подготавливаем url для получения табличных данных из API на основе опций, переданных из store.table
        async prepareApiUrl({getters},{table, options, odata}) {
            return new Promise((resolve)=>{
                
                let o = {...options}
                // console.log(`options in prepareUrl = ${JSON.stringify(o)}`)
                let url = `${getters.baseURL}`;
                if (o.table_type) {
                    if (o.table_type == 'report') url += 'report/'
                }
                // наличие фильтрации
                let hasFilters = false
                // базовый url
                url += `${table}?odata=${odata}`
                // сортировка
                if (o.sortBy) {
                    let i = 0
                    let sortField = o.sortBy[i]
                    let sortDesc = o.sortDesc[i]
                    if (sortField) url += `&order=${sortField},${sortDesc?'desc':'asc'}`
                }
                if (o.search && o.search.length>0) {
                    // блок поиска
                    url += `&search=${o.search}`
                    hasFilters = true
                }
                if (o.id || o.not_id || o.keyModel || o.filters) {
                    // добавить выбранные id-шники
                    let filters = ''
                    if (o.id) filters += `id in ${JSON.stringify(o.id)}`
                    if (o.not_id) filters += `id ni ${JSON.stringify(o.not_id)}`
                    // связки по keyModel
                    if (o.keyModel && o.keyModel.length>0) {
                        // console.log(`keyModel=${JSON.stringify(o.keyModel)}`)
                        o.keyModel.forEach((km, i) => {
                            // console.log(`km=${km}, i=${i}`)
                            if (filters!=='' || i>0) filters += ' and '
                            for (let field in km) {
                                if (typeof(km[field])=='object') {
                                    // console.log(`${field}(object)=${JSON.stringify(km[field])}`)
                                    let mi = 0
                                    for (let morphKey in km[field]) {
                                        if (mi>0) filters += ' and '
                                        filters += `${morphKey} eq ${km[field][morphKey]}`
                                        mi++
                                    }
                                } else {
                                    filters += `${field} eq ${km[field]}`
                                }
                            }
                        })
                        // console.log(`filters=${JSON.stringify(filters)}`)
                    }
                    // фильтры
                    if (o.filters) {
                        for (let filter in o.filters) {
                            if (filters !== '') filters += ' and '
                            // проверим на пустоту
                            if (Array.isArray(o.filters[filter])) {
                                if (o.filters[filter].length>0) filters += `${filter} eq ${o.filters[filter]}`
                            } else {
                                if (o.filters[filter] != null) filters += `${filter} eq ${o.filters[filter]}`
                            }

                        }
                    }
                    url += `&filter=${filters}`
                    hasFilters = true
                }
                
                // только указанные столбцы
                if (o.fields && o.fields.length>0) {
                    // &fields=fieldName1,fieldName2,...,fieldNameN
                    url += '&fields='+o.fields.join(',')
                }
                // фильтр по группам
                if (o.groups && o.groups.length>0) {
                    url += '&tags='+o.groups.join(',')
                    hasFilters = true
                }
                // scoups
                if (o.scope) {
                    url += `&scope=${o.scope}`
                    hasFilters = true
                }
                // если показываем удаленные записи
                if (o.trashed) {
                    url += `&trashed=${o.trashed}`
                }
                // extensions
                let exts = []
                if (o.extensions) {
                    if (Array.isArray(o.extensions)) {
                        exts = [...o.extensions]
                    } else {
                        exts.push(o.extensions)
                    }
                    if (exts.indexOf('select_list_title')===-1) {
                        exts.push('select_list_title')
                    }
                } else {
                    exts.push('select_list_title')
                }
                if (exts.length>0) url += `&extensions=${exts.join(',')}`
                // если есть поиск - вывод только 1-й страницы
                if (hasFilters) {

                //     o.page = 1
                //     // if (o.limit) {
                //     //     o.offset = 0
                //     // } else {
                //     //     o.offset = null
                //     // }
                }
                // страничный вывод
                if (o.page && o.itemsPerPage) {
                    let offset = (o.page-1)*o.itemsPerPage
                    url += `&offset=${offset}&limit=${o.itemsPerPage}`
                } else {
                    // если указаны ограничения
                    if (o.limit || options.offset) {
                        // console.log(`o.limit=${o.limit},o.offset=${o.offset}`)
                        
                        if (o.limit) url += `&limit=${o.limit}`
                        if (o.offset) url += `&offset=${o.offset}`
                    } 
                }

                // console.log(`table=${table}, options=${JSON.stringify(options)}, odata=${odata}, url=${url}`)
            resolve(url)
        })
        },

        // получить данные записи
        async getFormData({commit, dispatch, getters}, payload) {
            let debug = payload.tableName == 'fuck you'
            // получим модель таблицы
            let model = await dispatch('getTableModel', payload.tableName)
            // console.log(`payload.tableName=${payload.tableName}, model=${JSON.stringify(model)}`)
            // данные со всеми подчиненными таблицами
            let formData = {}
            // формируем url
            let url = `${getters.baseURL}${payload.tableName}/${payload.id}?extensions=select_list_title`;
            // console.log(`url=${url}`)
            return new Promise((resolve)=>{
                dispatch('request',{url, method:'get'}).then(({is_error, error, data})=>{
                    if (is_error) {
                        dispatch('pushError',error)
                    } else {
                        // добавляем полученные данные формы
                        commit('SET_FORM_DATA',{tableName: payload.tableName, data})
                        formData = {...data}
                        // подчиненная таблица items
                        let itemsTable = null
                        if (debug) console.log(`sub_tables=${JSON.stringify(model.extensions.sub_tables)}`)                                
                        // анализируем модель на предмет наличия в записи items
                        for (let subTableName in model.extensions.sub_tables) {
                            if (debug) console.log(`analize ${subTableName}`)                                
                            let st = model.extensions.sub_tables[subTableName]
                            if (st.method == 'items') {
                                itemsTable = {...st}
                                if (debug) console.log(`st.method (${st.method})===items`)                                
                                break;
                            } else {

                                if (debug) console.log(`st.method (${st.method})!=items`)                                
                            }
                        }
                        if (itemsTable) {
                            if (debug) console.log(`itemsTable = ${JSON.stringify(itemsTable)}`)                                
                            // если itemsTable нашлась - загрузим данные пакетами
                            // получим модель itemsTable
                            dispatch('getTableModel', itemsTable.table).then((stModel)=>{
                                if (debug) console.log(`stModel=${JSON.stringify(stModel)}`)                                
                                // найдем ключевое поле
                                try {
                                    let keyField = stModel.fields.find(field=>{
                                        return field.type=='key'
                                    }).name
                                    if (keyField) {
                                        if (debug) console.log(`keyField=${JSON.stringify(keyField)}`)                                
                                        // данные itemsTable
                                        let itemsTableData = []
                                        commit('CLEAR_TABLE_ITEMS_DATA',{tableName: payload.table, id:payload.id, method:itemsTable.method})
                                        // формируем опции запроса
                                        let itemsOptions = {table:itemsTable.table ,options:{filters:{[keyField]:payload.id}, limit:-1}}
                                        if (debug) console.log(`itemsOptions= ${JSON.stringify(itemsOptions)}`)                                                    
                                        // пакетное получение данных
                                        dispatch('getPacketData', {
                                            ...itemsOptions,
                                            callback: ({data, is_error, error, count}) => {
                                                if (is_error) {
                                                    dispatch('pushError', error) 
                                                } else {
                                                    // добавляем данные
                                                    itemsTableData = [...itemsTableData, ...data]
                                                    let payloadStData = {tableName: payload.tableName, id:payload.id, method:itemsTable.method, data}                                                    
                                                    if (debug) console.log(`payloadStData = ${JSON.stringify(payloadStData)}`)                                                    
                                                    commit('ADD_TABLE_ITEMS_DATA',payloadStData)
                                                    // обновляем кол-во записей в itemsTable
                                                    let itemsTableCountPayload = {table: payload.tableName, id:payload.id, method:itemsTable.method, count}
                                                    commit('SET_TABLE_ITEMS_DATA_COUNT', itemsTableCountPayload)
                                                }
                                            }
                                        })
                                    } else {
                                        // console.log(`NO KEY FIELD!!`)
                                    }
                                } catch (error) {
                                    // no key field!
                                    // console.log(`!!NO KEY FIELD!!`)
                                }
                            })
                        } else {
                            if (debug) console.log(`NO ITEMS TABLE!`)                            
                        }
                    }
                    commit('SET_FORM_DATA',{tableName: payload.tableName, data:formData})
                    resolve(formData)
                })
            })
        },
        
        // ищем в селекте по id - выдаем или из кэша или вгружаем данные с сервера
        searchInSelect({state, dispatch, commit},{table, id}) {
            return new Promise((resolve, reject)=>{
                if (state.selectCacheData[table] && state.selectCacheData[table][id]) {
                    // пытаемся выдать результат из кэша
                    let title = state.selectCacheData[table][id]
                    // console.log(`выдаю значение из кэша таблицы [${table}] для id=[${id}] = ${state.selectCacheData[table][id]}`)
                    resolve(title)
                } else {
                    // опции получения данных
                    let dataOptions = {table, options:{trashed: true, limit: -1, filters: {id}, search: null, odata:'list', page:null, itemsPerPage:null, fields:['id']}}
                    // console.log(`получаю данные из таблицы [${table}] для id= ${id}`)
                    dispatch('getPacketData', {
                        ...dataOptions,
                        callback: ({data, is_error, error}) => {
                            if (is_error) {
                                dispatch('pushError', error) 
                            } else {
                                // console.log(`data for [${table}] , [${id}] = ${JSON.stringify(data)}`)
                                commit('ADD_CACHE_SELECT_DATA',{table, data:data})
                                resolve(data[0])
                            }
                        }
                    })
                    .catch(e=>reject(e))
                }
            })
        },

        // сохранить в стор данные для селекта
        async cacheSelectData({dispatch, state, commit},{table, options, scope }) {
            // режим отладки
            let debug = table=='fuck'

            if (state.selectLoading[table]) {
                // console.log(`table ${table} already loading...`)
            } else {
                // подгрузим модель
                await dispatch('getTableModel', table)

                if (debug) console.log(`load data`)
                // индикация загрузки данных
                commit('SET_SELECT_LOADING',{table, isLoading:true})
                // опции получения данных
                let dataOptions = {table, options:{...{trashed:true, odata:'list', offset:0, limit:-1, fields:['id']}, ...options}}
                // получаем данные
                if (debug) console.log(`get packet data with options=${JSON.stringify(dataOptions)}`)
                await dispatch('getPacketData', {
                    ...dataOptions,
                    callback: ({data, is_error, error, count}) => {
                        if (is_error) {
                            dispatch('pushError', error) 
                        } else {
                                // если фильтры и поиск не указан и это scope - укажем общее кол-во данных для запроса
                                if (!dataOptions.options.filter && !dataOptions.options.filters && !dataOptions.options.id && !dataOptions.options.groups && scope) {
                                    commit('SET_SCOPE_COUNT',{table, scope, count})
                                }
                                // добавляем данные в стор
                                commit('ADD_SELECT_DATA',{table, data, scope})
                                if (debug) console.log(`data=${JSON.stringify(data)}`)
                        }
                    }
                }).finally(()=>{
                    // отмена индикации загрузки данных
                    commit('SET_SELECT_LOADING',{table, isLoading:false})
                    if (debug) console.log(`data transfer complete`)
                })
            }
            return true
        },

        // получить данные селекта (deprecated)
        async getSelectData({commit, dispatch, getters, state}, {table, search, id, page, itemsPerPage, options}) {
            // отладка
            let debug = table=='fuck'
            // смещение
            let offset = page ? (page-1)*itemsPerPage : 0
            if (debug) console.log(`offset=${offset}, page=${page}, itemsPerPage=${itemsPerPage}`)
            // лимит
            let limit = itemsPerPage ? itemsPerPage : getters.selectDataLimit
            // запрашиваемое кол-во данных в сторе
            let storeDataRequestLength = offset+limit
            // результирующий массив данных вне стора
            // т.е. поисковые запросы или id
            let resData = {data:[], count:0}
            // данные из стора соответствующие странице и строк на странице
            let pageData = []
            // маркер, что все данные получены из стейта
            let stateLoaded = false
            // опции, которые перекрывают базовые в зависимости от выборки данных
            let optionsMixin = {...options}
            // первая страница данных
            let isFirstPage = !search && (page==1 || offset==0)
            // заданы scope
            let scope = null
            // анализируем наличие scope в опциях запроса
            try {
                if (options.scope) {
                    scope = options.scope
                }
            } catch (error) {
                // scope is null
            }
            // если есть поиск - данные берем не из стейта
            if (search) {
                if (debug) console.log(`search=${search}`)
                optionsMixin = {...optionsMixin, ...{search}}
            } else {
                if (scope) {
                    // если в сторе есть такое кол-во данных - выдаем их сразу
                    try {
                        if (state.scopeSelectData[table][scope]) {
                            if (state.scopeSelectData[table][scope].length>=storeDataRequestLength) {
                                pageData = state.scopeSelectData[table][scope].slice(offset, storeDataRequestLength)
                                // if (debug) console.log(`resData from state =${JSON.stringify(resData)}`)
                                stateLoaded = true
                            } else {
                                optionsMixin.offset = state.selectData[table].length
                            }
                        }
                    } catch (error) {
                        stateLoaded = false
                    }
                } else {
                    // если в сторе есть такое кол-во данных - выдаем их сразу
                    try {
                        if (state.selectData[table]) {
                            if (state.selectData[table].length>=storeDataRequestLength) {
                                pageData = state.selectData[table].slice(offset, storeDataRequestLength)
                                // if (debug) console.log(`resData from state =${JSON.stringify(resData)}`)
                                stateLoaded = true
                            } else {
                                optionsMixin.offset = state.selectData[table].length
                            }
                        }
                    } catch (error) {
                        stateLoaded = false
                    }
                }
            }
            if (debug) console.log(`stateLoaded=${stateLoaded}`)
            // если данных в стейте нет
            if (!stateLoaded) {
                // подгрузим модель
                await dispatch('getTableModel', table)
                // if (!search && state.selectLoading[table]===true || state.selectLoading[table]===undefined) {
                //     commit('SET_SELECT_LOADING',{table, isLoading:true})
                // } else {
                //     commit('SET_SELECT_LOADING',{table, isLoading:false})
                // }
                if (!state.selectLoading[table] || !isFirstPage) {
                    if (debug) console.log(`load data`)
                    // индикация загрузки данных
                    commit('SET_SELECT_LOADING',{table, isLoading:true})
                    // опции получения данных
                    let dataOptions = {table, options:{...{trashed:true, search: null, odata:'list',offset, limit, page:null, itemsPerPage:null, fields:['id']}, ...optionsMixin}}
                    // получаем данные
                    if (debug) console.log(`get packet data with options=${JSON.stringify(dataOptions)}`)
                    await dispatch('getPacketData', {
                        ...dataOptions,
                        callback: ({data, is_error, error, count}) => {
                            if (is_error) {
                                dispatch('pushError', error) 
                            } else {
                                if (search) {
                                    if (data) resData.data = [...resData.data, ...data]
                                    if (count) resData.count = count
                                } else {
                                    // если фильтры и поиск не указан и это scope - укажем общее кол-во данных для запроса
                                    if (!dataOptions.options.filter && !dataOptions.options.filters && !dataOptions.options.id && !dataOptions.options.groups && scope) {
                                        commit('SET_SCOPE_COUNT',{table, scope, count})
                                    }
                                    // добавляем данные в стор
                                    commit('ADD_SELECT_DATA',{table, data, scope})
                        if (debug) console.log(`data=${JSON.stringify(data)}, resData=${JSON.stringify(resData)}`)
                                }
                            }
                        }
                    }).finally(()=>{
                        // отмена индикации загрузки данных
                        commit('SET_SELECT_LOADING',{table, isLoading:false})
                        if (debug) console.log(`data transfer complete`)
                    })
                } else {
                    // ожидание загрузки данных
                    setTimeout(async ()=>{
                        if (debug) console.log(`wait`)
                        dispatch('getSelectData', {table, search, id, page, itemsPerPage, options})
                    }, 1500)
                }
            }
            // добавляем id
            if (id) {
                try {
                    let loadId = parseInt(id)
                    // если записи нет в выдаваемых данных
                    if (!pageData.find(item=>{
                        return item.id===loadId
                    })) {
                        let sd = await dispatch('searchInSelect',{table,id:loadId})
                        // console.log(`selectData=${JSON.stringify(sd)}`)
                        if (sd) resData.data.unshift(sd)
                    }
                } catch (error) {
                    // не удалось получить id из реквеста
                }
            }
            // выдаем результат
            return  new Promise ( (resolve) =>{
                if (debug) console.log(`resolve resData =${JSON.stringify(resData)}`)
                resolve(resData)
            })
        },

// TODO
        // получить данные для связных селектов
        getForeignSelectData({dispatch},{table, options}) {
            return new Promise((resolve, reject)=>{
                dispatch('prepareApiUrl',{table, options, odata:options.odata})
                    .then(url=>{
                        dispatch('request',{url, method:'get'})
                            .then(({is_error, error, data})=>{
                                if (is_error) {
                                    dispatch('pushError', error)
                                    reject(error)
                                } else {
                                    resolve(data)
                                }
                            })
                            .catch(e=>{
                                reject(e)
                            })
                    })
            })
            
            
            // console.log(`options=${JSON.stringify(options)}`)
            // if (options && Object.keys(options).length>0) {
            //     return new Promise((resolve, reject) => {
            //         dispatch('setLoading', true)
            //         let dataOptions = {odata:'list', limit:-1}
            //         if (options) {
            //             dataOptions = {...options, ...dataOptions}
            //         }
            //         dispatch('getSelectParamsData',{table:table, options:dataOptions})
            //             .then((tableData)=>{
            //                 resolve(tableData)
            //             })
            //             .catch(e=>{
            //                 reject(e)
            //             })
            //             .finally(()=>{
            //                 dispatch('setLoading', false)
            //             })
            //     })
            // } else {
            //     return dispatch('getSelectData',table)
            // }
        },

        // получить данные таблицы
        async getTableData({commit, dispatch}, payload) {
            // подгрузим модель
            await dispatch('getTableModel', payload.table)
            commit('CLEAR_TABLE_DATA',{table: payload.table})
            let curOptions = await dispatch('getTableOptions', payload.table)
            // if (payload.options) curOptions = {...curOptions, ...payload.options}
            let tablePayload = {...payload, ...{options:{...curOptions, ...payload.options}}}
            // console.log(`options in getTableData = ${JSON.stringify(curOptions)}`)

            // console.log(`payload=${JSON.stringify(payload)}, tablePayload=${JSON.stringify(tablePayload)}`)
            // пакетное получение данных
            return new Promise((resolve)=>{
                resolve(dispatch('getPacketData', {
                    ...tablePayload,
                    callback: ({data, is_error, error, count}) => {
                        if (is_error) {
                            dispatch('pushError', error) 
                        } else {
                            commit('ADD_TABLE_DATA',{table: payload.table, data})
                            commit('SET_TABLE_DATA_COUNT', {table:payload.table, count})
                            commit('ADD_CACHE_SELECT_DATA',{table:payload.table, data})
                        }
                    }
                }))
            })
        },

        // добавить данные подчиненной таблицы
        addItemsData({dispatch, commit, state},{table, id, subTable}) {
            let dataExists
            try {
                let itemsDataLength = state.formData[table][id][subTable.method].length
                let itemsDataCount = state.tableItemsDataCount[table][id][subTable.method]
                if (itemsDataLength == itemsDataCount) dataExists = true
            } catch (error) {
                dataExists = false
            }
            // если данные есть - выдаем их
            return new Promise((resolve, reject) => {
                if (dataExists) {
                    resolve(state.formData[table][id][subTable.method])
                } else {
                    // загружаем данные формы вместе с итемсами
                    dispatch('getFormData',{tableName:table, id:id})
                        .then(()=>{
                            // проверим, загружены ли итемсы
                            try {
                                // загружены - выдаем
                                resolve(state.formData[table][id][subTable.method])
                            } catch (error) {
                                // загружаем
                                let parentId = id
                                let method = subTable.method
                                let itemsTable = subTable.table
                                dispatch('getTableModel',itemsTable).then(model=>{
                                    let keyField = model.fields.find(field=>{
                                        return field.type == 'key'
                                    })
                                    if (keyField) {
                                        let curOptions = {sortBy: ['id'], sortDesc: [false], multiSort: false, filters:{}, itemsPerPage:null, page:null, offset:0}
                                        // фильтр текущей записи (родительская таблица)
                                        curOptions.filters[keyField.name] = parentId
                                        
                                        commit('CLEAR_SELECT_DATA',{table})
                                        // пакетное получение данных
                                        dispatch('getPacketData', {
                                            table:itemsTable, 
                                            options:curOptions,
                                            callback: ({data, is_error, error, count}) => {
                                                if (is_error) {
                                                    dispatch('pushError', error) 
                                                } else {
                                                    let pl = {table: table, id:parentId, method:method, data}
                                                    commit('ADD_TABLE_ITEMS_DATA',pl)
                                                    let plcount = {table: table, id:parentId, method:method, count}
                                                    commit('SET_TABLE_ITEMS_DATA_COUNT', plcount)
                                                }
                                            }
                                        }).then(data=>{
                                            resolve(data)
                                        }).catch((e)=>{
                                            reject(e)
                                        })
                                    } else {
                                        // console.log(`cannot find key field in model`)
                                        dispatch('pushError',`не найдено ключевое поле в моделе подчиненной таблицы`)
                                        reject(`cannot find key field in model`)                        
                                    }
                                })
                                .catch((e)=>reject(e))
                            }
                    })
                }
            })
        },

        // сохранить строку таблицы
        async saveTableRow({commit, dispatch, getters}, {table, modType, values, copyOptions, msg, noMsg}) {
            return new Promise((resolve, reject) => {
            // console.log(`values for save are ${JSON.stringify(payload.values)}, model is ${JSON.stringify(state.model[payload.table])}`)
            dispatch('getTableModel', table)
                .then((model)=>{
                    let url = `${getters.baseURL}${table}`
                    let method = `post`
                    let defMsg = `Изменения сохранены`
                    let dataWithoutModel = {_mod_type: modType}
                    switch (modType) {
                        case 'edit': {
                            // редактирование
                            method = `put`
                            url += `/${values.id}`
                        } break
                        case 'add': {
                            // добавление
                            defMsg = `Запись добавлена`
                        } break
                        case 'copy': {
                            // копирование
                            // параметры копирования
                            dataWithoutModel = {...dataWithoutModel ,...{_copy_options:copyOptions?JSON.stringify(copyOptions):null}}
                            defMsg = `Запись скопирована`
                        }
                    }
                    dispatch('request',{url, method, data:values, dataWithoutModel, model})
                        .then((response)=>{
                            let {is_error, error, data} = response
                            if (is_error) {
                                dispatch('pushError', error)
                                reject(error)
                            } else {
                                if (!noMsg) dispatch('pushInfo',msg?msg:defMsg)
                                commit('SET_FORM_DATA', {tableName: table, data})
                                commit('UPDATE_TABLE_DATA', {table, data})
                                commit('ADD_CACHE_SELECT_DATA',{table, data})
                            }
                            resolve(data)
                        })
                        .catch(e=>{
                            reject(e)
                        })
                    })
                })
        },  

        // провести документ
        setPost({commit,dispatch,getters}, {table, id, values, msg, noMsg}) {
            // console.log(`post doc = ${JSON.stringify(payload)}`)
            return new Promise((resolve, reject) => {
                let url = `${getters.baseURL}${table}/${id}/post`
                dispatch('request',{url, method:'patch',data:values})
                    .then((response)=>{
                        let {is_error, error, data} = response
                        if (is_error) {
                            dispatch('pushError', error)
                            reject(error)
                        } else {
                            if (!noMsg) dispatch('pushInfo',msg?msg:`Документ проведен`)
                            commit('SET_FORM_DATA', {tableName: table, data})
                            commit('UPDATE_TABLE_DATA', {table, data})
                        }
                        resolve(data)
                    })
                    .catch(e=>{
                        reject(e)
                    })
                })
        },
        
        // сохранить и провести
        saveAndPost({dispatch}, {table, modType, values, copyOptions, postValues, msg, noMsg}) {
            return new Promise((resolve, reject) => {
                // сохраняем сначала
                dispatch('saveTableRow', {table, modType, values, copyOptions, noMsg:true})
                    .then(formData=>{
                        // если переданы данные для проведения
                        if (postValues != undefined) {
                            dispatch('setPost', {table, id:formData.id, values:postValues, noMsg:true})
                                .then(postData=>{
                                    if (!noMsg) dispatch('pushInfo',msg?msg:`Документ сохранен и проведен`)
                                    resolve(postData)
                                })
                                .catch(e=>{
                                    reject(e)
                                })
                        } else {
                            if (!noMsg) dispatch('pushInfo',msg?msg:`Изменения сохранены`)
                            resolve(formData)
                        }
                    })
                    .catch(e=>{
                        reject(e)
                    })
            })
        },

        // удалить строку таблицы
        removeTableRow({commit, dispatch, getters}, {table,id, msg, noMsg}) {
            return new Promise((resolve, reject) => {
                //         return axios.delete(`/api/v1/${table}/${id}`, store.getters.axiosCfg)
                let url = `${getters.baseURL}${table}/${id}`
                dispatch('request',{url, method:'delete'})
                    .then((response)=>{
                        let {is_error, error, data} = response
                        if (is_error) {
                            dispatch('pushError', error)
                        } else {
                            if (!noMsg) dispatch('pushInfo',msg?msg:`Запись удалена`)
                            commit('REMOVE_ROW_ID',{table, id})
                            commit('ADD_CACHE_SELECT_DATA',{table, data:[{id,select_list_title:null}]})
                        }
                        resolve(data)
                    })
                    .catch(e=>{
                        reject(e)
                    })
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

        // выдает опции таблицы в зависимости от установок
        async getTableOptions({state},table) {
            return new Promise (resolve=>{
                let curOptions
                if (state.tableOptions[table]) {
                    curOptions = {...state.tableOptions[table]}
                } else {
                    curOptions = {...state.const.defaultTableOptions}
                }
                //    console.log(`ret options = ${JSON.stringify(curOptions)}`) 
                resolve(curOptions)
            })
        },

        syncTableOptions({commit},payload) {
            // console.log(`new table options ${JSON.stringify(payload)}`)
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

        // выдаем файлы    //    
        getFiles({commit, dispatch, getters}, {tableName, id, type}) {
            // console.log(`tableName=${tableName}, type=${type}`)
            // return axios.get(`/api/v1/files/${table}/${id}/${type}`, store.getters.axiosCfg)
            return new Promise((resolve, reject)=>{
                let url = `${getters.baseURL}files/${tableName}/${id}/${type}`
                dispatch('request',{url, method:'get'})
                    .then(({is_error, error, data})=>{
                        if (is_error) {
                            dispatch('pushError', error)
                            reject(error)
                        } else {
                            commit('SET_FILES',{type, files:data})
                        }
                        resolve(data)
                    })
                    .catch(e=>{
                        reject(e)
                    })
            })
        },

        // добавляем файл
        saveFile({dispatch, getters}, {table, id, values, model}) {
            return new Promise((resolve, reject)=>{
                let url = `${getters.baseURL}files/${table}/${id}`
                dispatch('request',{url, method:'post', data:values, model})
                    .then(({is_error, error, data})=>{
                        if (is_error) {
                            dispatch('pushError', error)
                            reject(error)
                        } else {
                            dispatch('pushInfo',`Файл сохранен`)
                            resolve(data)
                        }
                        
                    })
                    .catch(e=>{
                        reject(e)
                    })
            })
        },

        // изменяем файл
        editFile({dispatch, getters},{table, id, file_id, values, model}) {
            return new Promise((resolve, reject)=>{
                let url = `${getters.baseURL}files/${table}/${id}/${file_id}`
                dispatch('request',{url, method:'patch', data:values, model})
                    .then(({is_error, error, data})=>{
                        if (is_error) {
                            dispatch('pushError', error)
                            reject(error)
                        } else {
                            dispatch('pushInfo',`Файл изменен`)
                            resolve(data)
                        }
                        
                    })
                    .catch(e=>{
                        reject(e)
                    })
            })
        },

        // удаляем файл
        deleteFile({dispatch, getters},{table, id, file_id}) {
            return new Promise((resolve, reject)=>{
                let url = `${getters.baseURL}files/${table}/${id}/${file_id}`
                dispatch('request',{url, method:'delete'})
                    .then(({is_error, error, data})=>{
                        if (is_error) {
                            dispatch('pushError', error)
                            reject(error)
                        } else {
                            dispatch('pushInfo',`Файл удален`)
                            resolve(data)
                        }
                        
                    })
                    .catch(e=>{
                        reject(e)
                    })
            })
        },

        // выдаем список файлов для записи
        getFileList({commit, dispatch, getters},table) {
            // return axios.get(`/api/v1/file_list/${table}`, store.getters.axiosCfg)
            return new Promise((resolve, reject)=>{
                let url = `${getters.baseURL}file_list/${table}`
                dispatch('request',{url, method:'get'})
                    .then(({is_error, error, data})=>{
                        if (is_error) {
                            dispatch('pushError', error)
                            reject(error)
                        } else {
                            commit('SET_FILE_LIST',{table, files:data})
                        }
                        resolve(data)
                    })
                    .catch(e=>{
                        reject(e)
                    })
            })
        },

        // синхронизация списка файлов с записью в таблице
        syncFiles({dispatch, getters},{table, id, data}) {
            return new Promise((resolve, reject)=>{
                let url = `${getters.baseURL}file_list/${table}/${id}`
                dispatch('request', {url, method:'post', data:{data}})
                    .then(({is_error, error})=>{
                        if (is_error) {
                            dispatch('pushError', error)
                            reject(error)
                        } else {
                            dispatch('getFileList', table)
                                .then(newData=>{
                                    resolve(newData)
                                })
                                .catch(e=>{
                                    reject(e)
                                })
                        }
                    })
                    .catch(e=>{
                        reject(e)
                    })
            })
        },
// TODO - тестить!
        // выдаем файл печатной формы
        getPrintForm({dispatch,getters}, {table, id}) {
            return new Promise((resolve, reject)=>{
                let url = `${getters.baseURL}forms/${table}/${id}`
                dispatch('request', {url, method:'get'})
                    .then(({is_error, error, data})=>{
                        if (is_error) {
                            dispatch('pushError', error)
                            reject(error)
                        } else {
                            resolve(data)
                        }
                    })
                    .catch(e=>{
                        reject(e)
                    })
            })
        }
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
        },
        selectDataLimit(state) {
            return state.const.selectDataLimit
        },
        maxSelectDataCache(state) {
            return state.const.maxSelectDataCache
        }
    }
    
}

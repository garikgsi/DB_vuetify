import Vue from 'vue'

export default {

    state: {
        const: {
            filters: {
                page: 1,
                itemsPerPage: 10,
                sortBy: ['name'],
                sortDesc: false,
                multiSort: false,
                search:null,
                filter:null,
                groups:null
            }
        },
        tableData: {},
        selectData: {},
        count: {},
        filters: {}
    },

    mutations: {
        SET_STOCK_SELECT_DATA(state, {sklad_id, data}) {
            if (state.selectData[sklad_id]) {
                state.selectData[sklad_id] = data
            } else {
                Vue.set(state.selectData, sklad_id, data)
            }
        },
        ADD_STOCK_SELECT_DATA(state, {sklad_id, data}) {

            if (state.selectData[sklad_id]) {
                state.selectData[sklad_id] = [...state.selectData[sklad_id], ...data]
            } else {
                Vue.set(state.selectData, sklad_id, data)
            }
        },        
        SET_STOCK_TABLE_DATA(state, payload) {
            if (state.tableData[payload.sklad_id]) {
                state.tableData[payload.sklad_id] = payload.data
            } else {
                Vue.set(state.tableData, payload.sklad_id, payload.data)
            }
        },
        ADD_STOCK_TABLE_DATA(state, {sklad_id, data}) {
            if (state.tableData[sklad_id]) {
                state.tableData[sklad_id] = [...state.tableData[sklad_id],...data]
            } else {
                Vue.set(state.tableData, sklad_id, data)
            }
        },
        SET_STOCK_COUNT(state,payload) {
            if (state.count[payload.sklad_id]) {
                state.count[payload.sklad_id] = payload.data
            } else {
                Vue.set(state.count, payload.sklad_id, payload.data)
            }
        },
        CLEAR_STOCK_TABLE_DATA(state,{sklad_id}) {
            try {
                state.tableData[sklad_id] = null
            } catch (error) {
                Vue.set(state.tableData, sklad_id, null)
            }
        },
        CLEAR_STOCK_SELECT_DATA(state,{sklad_id}) {
            try {
                state.selectData[sklad_id] = null
            } catch (error) {
                Vue.set(state.selectData, sklad_id, null)
            }
        },
        CLEAR_STOCK_COUNT(state,{sklad_id}) {
            try {
                state.count[sklad_id] = null
            } catch (error) {
                Vue.set(state.count, sklad_id, null)
            }
        },
        CLEAR_STOCK_FILTERS(state, {sklad_id}) {
            try {
                state.filters[sklad_id] = {...state.const.filters}
            } catch (error) {
                Vue.set(state.filters, sklad_id, {...state.const.filters})
            }
        },
        CHANGE_STOCK_FILTERS(state, {sklad_id, filters}) {
            try {
                state.filters[sklad_id] = {...state.filters[sklad_id], ...filters}
            } catch (error) {
                Vue.set(state.filters, sklad_id, {...filters})
            }
        }
    },

    actions: {
        // ???????????????? ??????????????
        clearStockFilters({commit}, {sklad_id}) {
            commit('CLEAR_STOCK_FILTERS',{sklad_id})
        },
        // ???????????? ?????????????? ?????? ????????????
        getStockFilters({state},{sklad_id}) {
            return new Promise (resolve=>{
                let filters = state.const.filters
                try {
                    filters = state.filters[sklad_id]
                } catch (error) {
                    // filters already set by default
                }
                resolve(filters)
            })
        },
        // ???????????????? ??????????????
        async changeStockFilters({commit, dispatch},{sklad_id, filters}) {
            commit('CHANGE_STOCK_FILTERS',{sklad_id, filters})
            let newFilters = await dispatch('getStockFilters',{sklad_id})
            return newFilters
        },
        // ???????????????? ???????????? ?????????????? ?????? ??????????????
        async getStockBalanceForSelect({getters, dispatch},{sklad_id, search, id}) {
            // ????????????????, ???????? ???? ??????
            
            
            // ?????????????????? ??????????????????
            let currentOptions = {...getters.defaultFilters, ...{scope:`stock_balance.${sklad_id}`}}
            // ?????????????? ?????????? ?? id
            currentOptions = {...currentOptions, ...{search}}
            // ???????????????????? ?????????? ?????????????? ?? API
            let requestOptions = {
                table: 'nomenklatura',
                options: currentOptions
            }
            console.log(`currentOptions=${JSON.stringify(currentOptions)}`)
            // ????????????
            let selectData = []
            // ???????????????? ?????????????????? ????????????
            await dispatch('getPacketData', {
                ...requestOptions,
                callback: ({data, is_error, error}) => {
                    if (is_error) {
                        dispatch('pushError', error) 
                    } else {
                        // ???????????????????? ???????????? ?????? ??????????????
                        let formData = data.map(row=>{
                            return {
                                id: row.id,
                                select_list_title: row.select_list_title,
                                disabled: row.deleted_at?true:false,
                                stock_balance: row.stock_balance
                            }
                        })
                        selectData = [...selectData, ...formData]
                    }
                }
            })
            // ???????? ?????????????? id
            if (id) {
                // ????????????????, ?????? ???? ?????? ?? ???????????? (?????????? ???? ?????? ?????? ????????????????)
                let idExists = false
                selectData.forEach(row=>{
                    if (id==row.id) idExists = true
                })
                // ???????? ???? ?????????????? ?? ???????????????????? ???????????? - ???????????????? ?????????????? ?????? ???? ????????????????
                if (!idExists) {
                    let idOptions = {...currentOptions, ...{id}}
                    let idRequestOptions = {
                        table: 'nomenklatura',
                        options: idOptions
                    }
                    // ???????????????? ????????????
                    await dispatch('getPacketData', {
                        ...idRequestOptions,
                        callback: ({data, is_error, error}) => {
                            if (is_error) {
                                dispatch('pushError', error) 
                            } else {
                                if (data.length>0) {
                                    // ???????????????????? ???????????? ?????? ??????????????
                                    let formData = data.map(row=>{
                                        return {
                                            id: row.id,
                                            select_list_title: row.select_list_title,
                                            disabled: row.deleted_at?true:false,
                                            stock_balance: row.stock_balance
                                        }
                                    })
                                    selectData = [...selectData, ...formData]
                                    idExists = true
                                }
                            }
                        }
                    })
                }
                // ???????? ?? ???????????????? ?????? - ?????????????? ?? ???????????????? ?????????????????? ?????????????? ???? ?????????????? ?????????????????????? ?? ?????????????????? disabled
                if (!idExists) {
                    let nomenklatura = await dispatch('searchInSelect',{table:'nomenklatura',id})
                    if (nomenklatura) {
                        let nomeklaturaData = {
                            id: nomenklatura.id,
                            select_list_title: nomenklatura.select_list_title,
                            disabled: true,
                            stock_balance: 0
                        }
                        selectData = [...selectData, ...nomeklaturaData]
                        idExists = true
                    }
                }
            }
            // ???????????????????? ????????????
            return new Promise((resolve)=>{
                resolve(selectData)
            })
        },
        // ???????????????? ???????????? ???????????????? ???? ?????? ??????????????
        async getStockBalanceForTable({dispatch, commit},{sklad_id}) {
            let options = await dispatch('getStockFilters',{sklad_id})
            console.log(`getStockBalanceForTable with sklad=${sklad_id} options=${JSON.stringify(options)}`)
            commit('CLEAR_STOCK_TABLE_DATA',{sklad_id})
            // commit('CLEAR_STOCK_SELECT_DATA',{sklad_id})
            commit('CLEAR_STOCK_COUNT',{sklad_id})
            let curOptions = await dispatch('getTableOptions', 'nomenklatura')
            // ?????????????? ?????????????? ?? ??????????
            let nullOptions = {filter:null, search:null, scope:`stock_balance.${sklad_id}`}
            // ???????????? ??????????
            curOptions = {...curOptions, ...nullOptions, ...options}
            // ???????????????????? ?????????? ?????????????? ?? API
            let requestOptions = {
                table: 'nomenklatura',
                options: curOptions
            }
            // console.log(`requestOptions = ${JSON.stringify(requestOptions)}`)
            // ???????????????? ?????????????????? ????????????
            return new Promise((resolve)=>{
                resolve(dispatch('getPacketData', {
                    ...requestOptions,
                    callback: ({data, is_error, error, count}) => {
                        if (is_error) {
                            dispatch('pushError', error) 
                        } else {
                            commit('ADD_STOCK_TABLE_DATA',{sklad_id, data})
                            commit('SET_STOCK_COUNT', {sklad_id, data:count})
                        }
                    }
                }))
            })
        },
        
        
        getSelectStockBalance({commit, dispatch},p) {
            // console.log(`p=${JSON.stringify(p)}`)
            // ?????????????????? ????????????
            let params = ''
            let sklad_id = 1
            let saveState = true
            if (p) {
                switch (typeof(p)) {
                    case 'number': case 'string': {
                        params = p
                        sklad_id = p
                    } break;
                    case 'object': {
                        let paramArr = []
                        if (Array.isArray(p)) {
                            paramArr = [...p]
                        } else {
                            for (let key in p) {
                                paramArr.push(p[key])
                            }
                        }
                        params = paramArr.join('.')
                        sklad_id = params[0]
                        saveState = false
                    }
                }

            }
            return new Promise((resolve, reject) => {
                if (sklad_id>1) {
                // dispatch('getSelectData',{table:'nomenklatura'})
                //     .then(()=>{
                        dispatch('getTableData',{table:'nomenklatura', options:{odata:'list', limit:-1, scope:`stock_balance.${params}`}})
                            .then((data)=>{
                                // console.log(`saveState=${saveState}, data stock_balance = ${JSON.stringify(data)}`)
                                    if (saveState) {
                                        let pl = {sklad_id, data}
                                        commit('SET_STOCK_SELECT_DATA',pl)
                                    }
                                resolve(data)
                            })
                            .catch(e=>{
                                reject(e)
                            })
                    // })
                    // .catch(e=>{
                    //     reject(e)
                    // })
                } else {
                    resolve([])
                }
            })
        },
        getTableStockBalance({commit, dispatch},p) {
            // ?????????????????? ????????????
            let params = ''
            let sklad_id = 1
            let saveState = true
            if (p) {
                switch (typeof(p)) {
                    case 'number': case 'string': {
                        params = p
                        sklad_id = p
                    } break;
                    case 'object': {
                        let paramArr = []
                        if (Array.isArray(p)) {
                            paramArr = [...p]
                        } else {
                            for (let key in p) {
                                paramArr.push(p[key])
                            }
                        }
                        params = paramArr.join('.')
                        sklad_id = params[0]
                        saveState = false
                    }
                }

            }
            return new Promise((resolve, reject) => {
                dispatch('getTableData',{table:'nomenklatura', options:{odata:'data', scope:`stock_balance.${params}`}})
                    .then((data)=>{
                            if (saveState) {
                                commit('SET_STOCK_TABLE_DATA',{'sklad_id': sklad_id, data})
                                commit('SET_STOCK_COUNT',{'sklad_id': sklad_id, data:data.length}) // ???????????????? ???????????????? ??????-???? ????????????
                            }
                        resolve(data)
                    })
                    .catch(e=>{
                        reject(e)
                    })
                    .finally(()=>{
                        dispatch('setLoading', false)
                    })
            })
        },
    },

    getters: {
        defaultFilters(state) {
            return state.const.filters
        },
    }
}

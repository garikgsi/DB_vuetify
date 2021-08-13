import Vue from 'vue'

export default {

    state: {
        tableData: {},
        selectData: {},
        count: {}
    },

    mutations: {
        SET_STOCK_SELECT_DATA(state, payload) {
            if (state.selectData[payload.sklad_id]) {
                state.selectData[payload.sklad_id] = payload.data
            } else {
                Vue.set(state.selectData, payload.sklad_id, payload.data)
            }
        },
        SET_STOCK_TABLE_DATA(state, payload) {
            if (state.tableData[payload.sklad_id]) {
                state.tableData[payload.sklad_id] = payload.data
            } else {
                Vue.set(state.tableData, payload.sklad_id, payload.data)
            }
        },
        SET_STOCK_COUNT(state,payload) {
            if (state.count[payload.sklad_id]) {
                state.count[payload.sklad_id] = payload.data
            } else {
                Vue.set(state.count, payload.sklad_id, payload.data)
            }
        }
    },

    actions: {
        getSelectStockBalance({commit, dispatch},p) {
            // console.log(`p=${JSON.stringify(p)}`)
            // параметры скоупа
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
                dispatch('getSelectData','nomenklatura')
                    .then(()=>{
                        dispatch('getTableData',{table:'nomenklatura', options:{odata:'list', limit:-1, scope:`stock_balance.${params}`}})
                            .then((response)=>{
                                if (response.data) {
                                    let tableData = response.data.data
                                    if (saveState) {
                                        let pl = {'sklad_id': sklad_id, 'data':tableData}
                                        commit('SET_STOCK_SELECT_DATA',pl)
                                    }
                                }
                                resolve(response.data.data)
                            })
                            .catch(e=>{
                                reject(e)
                            })
                            .finally(()=>{
                                dispatch('setLoading', false)
                            })
                    })
                    .catch(e=>{
                        reject(e)
                    })
                    .finally(()=>{
                        dispatch('setLoading', false)
                    })
            })
        },
        getTableStockBalance({commit, dispatch},p) {
            // параметры скоупа
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
                    .then((response)=>{
                        if (response.data) {
                            let tableData = response.data.data
                            if (saveState) {
                                commit('SET_STOCK_TABLE_DATA',{'sklad_id': sklad_id, 'data':tableData})
                                commit('SET_STOCK_COUNT',{'sklad_id': sklad_id, 'data':response.data.count})
                            }
                        }
                        resolve(response.data.data)
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

}

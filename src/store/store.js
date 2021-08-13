import Vue from 'vue'
import Vuex from 'vuex'

import Constants from '../siteAdminConst.js'
import Services from '../siteAdminServices.js'


// modules
import user from './modules/user.js'
import app from './modules/app.js'
import table from './modules/table.js'
import permissions from './modules/permissions.js'
import stock_balance from './modules/tables/stock_balance.js'
import serials from './modules/tables/serials.js'
import groups from './modules/groups.js'

Vue.use(Vuex)

export default new Vuex.Store({
    modules: {
        user,
        app,
        table,
        permissions,
        stock_balance,
        groups,
        serials
    },

    state: {
        // конфиг axios
        axiosCfg: {
            baseURL: 'https://api.moydodyr.ru',
            // baseURL: 'http://api.test',
            // timeout: 20000,
            withCredentials: false,
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                // Authorization: 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiOTk0MzM0Y2JiYTU5Yzc4OTQwM2E3Nzc1ZjExZWE3OTFmNTM3MzExNDc3ZWNhZWIyMDFlMDBjZjQzN2FiMDY0MWJjNGNmMzI3NDNiZmZmZmYiLCJpYXQiOjE2MDE2MjM0MzcsIm5iZiI6MTYwMTYyMzQzNywiZXhwIjoxNjMzMTU5NDM3LCJzdWIiOiIxIiwic2NvcGVzIjpbXX0.Bwb2KKh5IVKk5Pv_ROrg5-m090CyEE3Z5uJolgL3VCuKtiQP9tcgY9SfKmGTxjLaegaw_u90iqmDLXWoC3KNcE9fbh1oTpx0q9OkuYoEU0vAV7j5EcwlNg7kclQJX-mqmz3W1hZ9Hhw03jMbFh3ciTKnuV2uEJHh2n-q_hjQ3mTM4D3oThGdrJnZViQxpdSGS8zo1bR5r5T7AEI4IjtnZA6T4flcqD9fY2QAU5IsEeuoG_iVkvbJ9A9W41Ou3nxLBpCXeUskoIDJ-xJRI6bbfXa2Qide_y5ZCjTQuL0rKdctkqjh6ExOiYNmCcfEf5nhl5ze88bDYhCGpkEHtf2CXlbdhkJFTc-G1LnHSp3H68uhm7FLV_2F7FagQ0q7MpCpRWmTWZOS8G7OxkHXrixX3w35xOdet0gfY_hp_vwc8yKN6JhL2xztkpcK0L95FWAOa-A5FnOUaK2jAFXYPosGQbPvu36P71I575bxw0R0Hq4VlpT9bwqICqFjL7oj9R-7H2UmqplqCZr-17xh4SYwJ7wvBH3YiYh19YA5s7_9po1uvRQx5tkor-z2PTqsO1Tr5ja0to6Vu0TgP-Yz-HeQP-VvwDJcyf3oXqr6gIRcGqpmVC29zJKWbahXbttgYY___FIae7Q2TKjdd00GK3dQDB8NGrLuR2bUPSxPpUNoQX4'
            },
            'content-type': 'multipart/form-data'
        },


        curMenuPoint: {},
        content: Constants.defaultContent,
        activeTreeNodeId: 0,
        activeTab: Constants.defaultTab,
        siteTree: [],
        moduleItems: null,
        error: null,
        contentTableLoading: false,
        contentTableData:[],
        contentTableDataTotal:0,
        contentTableOptions: Constants.defaultTableOptions,
        contentLoadedFor: 0,

        // исходные модели таблиц
        models: {},


    },
    mutations: {
        SET_AXIOS_CFG(state, payload) {
            state.axiosCfg = payload
        },






        SET_CONTENT_TABLE_LOADING(state, payload) {
            state.contentTableLoading = payload
        },
        SET_ERROR(state, payload) {
            state.error = payload
        },
        SET_ACTIVE_TAB(state, payload) {
            state.activeTab = payload
        },
        SET_MODULE_ITEMS(state, payload) {
            state.moduleItems = payload
        },
        SET_SITE_TREE(state, payload) {
            state.siteTree = payload
        },
        SET_MENU_POINT(state, payload) {
            state.curMenuPoint = Object.assign({}, payload)
        },
        SET_TREE_NODE(state, payload) {
            state.activeTreeNodeId = payload
        },
        SET_CONTENT_TABLE(state, payload) {
            state.contentTable = payload
        },
        SET_CONTENT_TABLE_TOTAL(state, payload) {
            state.contentTableDataTotal = payload
        },
        SET_CONTENT_TABLE_OPTIONS(state, payload) {
            state.contentTableOptions = payload
        },
        SET_CONTENT(state, payload) {
            state.content = Object.assign({}, payload)
        },
        SET_CONTENT_LOADED_FOR(state,payload) {
            state.contentLoadedFor = payload
        },
        SET_CONTENT_MENU_POINT_ID(state, payload) {
            // state.content = Object.assign(state.content, {menu_point_id:payload})
            state.content.menu_point_id = payload
        },
        // ABP table
        SET_MODEL(state, payload) {
            state.models[payload.table].model = payload.model
        },
        SET_TABLE_OPTIONS(state, payload) {
            state.models[payload.table].tableOptions = payload.options
        },
        SET_TABLE_DATA_TOTAL(state, payload) {
            state.models[payload.table].total = payload.total
        },
        INIT_TABLE(state, table) {
            state.models[table] = {...Constants.tableInitOptions}
        }
    },
    actions: {


        setContentTableLoading({commit}, payload) {
            commit('SET_CONTENT_TABLE_LOADING',payload)
        },
        setError({commit},payload) {
            commit('SET_ERROR',payload)
        },
        setActiveTab({commit},curTab) {
            commit('SET_ACTIVE_TAB',curTab)
            // if (curTab==1) {
            //     dispatch('fetchContent',this.state.curMenuPoint.id)
            // }
        },
        setDefaultActiveTab({commit}) {
            commit('SET_ACTIVE_TAB',Constants.defaultTab)
        },
        setCurMenuPoint({commit}, payload) {
            commit('SET_MENU_POINT',payload)
        },
        fetchModuleItems({commit}) {
            Services.getSiteModules().then(response => {
                // console.log('module_items loading')
                commit('SET_MODULE_ITEMS', response.data.data)
            }).catch(e=>{
                commit('SET_ERROR',`Не могу загрузить список модулей. Возникла ошибка ${e.response.data.error}`)
            })
        },
        fetchSiteTree({commit}) {
            Services.getSiteTree().then(response => {
                // console.log(JSON.stringify(response))
                commit('SET_SITE_TREE', response.data.data)
            }).catch(e=>{
                commit('SET_ERROR',`Не могу загрузить дерево разделов сайта. Возникла ошибка ${e.response.data.error}`)
            })
        },
        getMenuPointById({commit, dispatch},id) {
            Services.getMenuPointById(id).then(response => {
                commit('SET_MENU_POINT', response.data.data)
            }).catch(e=>{
                commit('SET_ERROR',`Не могу найти раздел сайта с id=${id}. Возникла ошибка ${e.response.data.error}`)
                dispatch('setDefaultMenuPoint')
            })
        },
        setDefaultMenuPoint({commit}) {
            commit('SET_MENU_POINT',Constants.defaultMenuPoint)
        },
        setChildMenuPoint({commit},parentId) {
            let menuPointSettings = {
                parent_menu_point:parentId,
                // TODO:посчитать num_order по родительскому разделу
            }
            commit('SET_MENU_POINT',Object.assign(Constants.defaultMenuPoint,menuPointSettings))
        },
        saveMenuPoint({commit, dispatch}, curMenuPoint) {
            return new Promise((resolve,reject)=>{
                Services.saveMenuPoint(curMenuPoint).then(response => {
                        // post
                    if (curMenuPoint.id==0) {
                        commit('SET_MENU_POINT', response.data.data)
                        // TODO:добавить в дерево siteTree
                    } else {
                        // put
                        dispatch('getMenuPointById',curMenuPoint.id)
                    }
                    resolve(true)
                }).catch(e=>{
                    let err = `Не могу сохранить пункт меню. Возникла ошибка ${e.response.data.error}`
                    commit('SET_ERROR', err)
                    reject(new Error(err))
                })
            })
        },
        deleteMenuPoint({commit},id) {
            return new Promise((resolve,reject)=>{
                Services.deleteMenuPoint(id).then((response)=>{
                    resolve(response)
                }).catch(e=>{
                    let err = `Не могу удалить пункт меню с id=${id}. Возникла ошибка ${JSON.stringify(e.response.data.error)}`
                    commit('SET_ERROR', err)
                    reject(new Error(err))
                })
            })
        },
        setActiveTreeNode({commit},menuPointId) {
            commit('SET_TREE_NODE', menuPointId)
            // dispatch('setContentMenuPointId',menuPointId)
        },
        setContentTableOptions({commit},payload) {
            commit('SET_CONTENT_TABLE_OPTIONS', payload)
        },
        fetchContent({commit, getters},menu_point_id) {
            return new Promise((resolve,reject)=>{
                // if (state.contentLoadedFor===0) {
                    commit('SET_CONTENT_TABLE_LOADING',true)
                    Services.getContentTable(menu_point_id, getters.contentTableOptions).then(response => {
                        if (response.data) {
// console.log(`loaded ${JSON.stringify(response.data)}`)
                            if (getters.menuPointListable) {
                                commit('SET_CONTENT_TABLE', response.data.data)
                                commit('SET_CONTENT_LOADED_FOR',menu_point_id)
                                if (response.data.count) commit('SET_CONTENT_TABLE_TOTAL',response.data.count)
// console.log(`data is ${JSON.stringify(getters.contentTableData)}`)
                            } else {
                                if (!!response.data.data && response.data.data.length>0)
                                commit('SET_CONTENT', response.data.data[0])
                                commit('SET_CONTENT_LOADED_FOR',menu_point_id)
                                commit('SET_CONTENT_TABLE_TOTAL',0)
                            }
                            // commit('SET_CONTENT_MENU_POINT',menu_point_id)
                        } else {
                            commit('SET_ERROR',`Ответ от сервера не получен`)
                        }
                        resolve(true)
                    }).catch(e=>{
                        let err = `Не могу загрузить контент раздела. Возникла ошибка ${e.response.data.error}`
                        commit('SET_ERROR', err)
                        reject(new Error(err))
                    }).finally(()=> {
                        commit('SET_CONTENT_TABLE_LOADING',false)
                    })
                // } else {
                //     resolve(state.contentLoadedFor)
                // }
            })
        },
        setContent({commit}, newContent) {
            commit('SET_CONTENT', newContent)
        },
        setDefaultContent({commit}) {
            commit('SET_CONTENT',Constants.defaultContent)
            commit('SET_CONTENT_TABLE',[])
            commit('SET_CONTENT_LOADED_FOR',0)
        },
        setDefaultContentForm({commit}) {
            commit('SET_CONTENT',Constants.defaultContent)
        },
        setContentForm({commit,getters},id) {
            return new Promise((resolve)=>{
                let contentArray = getters.contentTableData
                let content = contentArray.find((contentItem)=>{
                    return contentItem.id === id
                })
                if (content) {
                    commit('SET_CONTENT', content)
                } else {
                    // подгрузить контент из БД, а если не найдется, то выдать ошибку
                    commit('SET_ERROR', `Никак не найду контент с id=${id}`)
                }
                resolve()
            })
        },
        setContentMenuPointId({commit},payload) {
            commit('SET_CONTENT_MENU_POINT_ID',payload)
        },
        saveContent({commit, dispatch, getters}, content) {
            // промис для обработки результата - закрытия модального окна
            return new Promise((resolve,reject)=>{
                Services.saveContent(content, getters.menuPointId).then(response => {
                        // post
                    if (content.id==0) {
                        commit('SET_CONTENT', response.data.data)
                        commit('SET_CONTENT_LOADED_FOR', content.menu_point_id)
                    } else {
                        // put
                        dispatch('fetchContent', content.menu_point_id)
                    }
                    resolve(true)
                }).catch(e=>{
                    let err = `Не могу сохранить контент. Возникла ошибка ${JSON.stringify(e.response.data.error)}`
                    commit('SET_ERROR', err)
                    reject(new Error(err))
                })
            })
        },
        deleteContent({commit},id) {
            return new Promise((resolve,reject)=>{
                Services.deleteContent(id).then((response)=>{
                    resolve(response)
                }).catch(e=>{
                    let err = `Не могу удалить страницу контента с id=${id}. Возникла ошибка ${JSON.stringify(e.response.data.error)}`
                    commit('SET_ERROR', err)
                    reject(new Error(err))
                })
            })
        },
        // ABP table
        initTable({commit,state},table) {
            return new Promise((resolve,reject) => {
                if (!state.models[table]) {
                    commit('INIT_TABLE', table)
                    Services.getModel(table).then(response => {
                        if (response.data.model) {
                            let model = JSON.parse(JSON.stringify(response.data.model))
                            commit('SET_MODEL', {table:table, model:model})
                            resolve(model)
                        } else {
                            let err = `Сервер не передал модель таблицы ${table}`
                            commit('SET_ERROR',err)
                            reject(new Error(err))
                        }
                    }).catch(e=>{
                        let err = `Не могу загрузить модель таблицы ${table}. Возникла ошибка ${e.response.data.error}`
                        commit('SET_ERROR', err)
                        reject(new Error(err))
                    })
                } else {
                    console.log('model is already fetched')
                }

            })
        },
        fetchTableData({commit, state}, table) {
            if (!state.models[table]) commit('INIT_TABLE', table)
            return new Promise((resolve,reject)=>{
                commit('SET_CONTENT_TABLE_LOADING',true)
                Services.getTableData(table, state.models[table].tableOptions).then(response => {
                    if (response.data) {
                            commit('SET_TABLE_DATA', {table:table, data:response.data.data})
                            if (response.data.count) commit('SET_TABLE_DATA_TOTAL',{table: table, total: response.data.count})
                    } else {
                        commit('SET_ERROR',`Ответ от сервера не получен`)
                    }
                    resolve(true)
                }).catch(e=>{
                    let err = `Не могу загрузить контент раздела. Возникла ошибка ${e.response.data.error}`
                    commit('SET_ERROR', err)
                    reject(new Error(err))
                }).finally(()=> {
                    commit('SET_CONTENT_TABLE_LOADING',false)
                })
            })
        },
        setTableOptions({commit},payload) {
            commit('SET_TABLE_OPTIONS', payload)
        },

    },
    getters: {
        isError(state) {
            if (state.error) return true; else return false
        },
        error(state) {
            return state.error
        },
        axiosCfg(state) {
            return state.axiosCfg
        },


        curMenuPoint(state) {
            return state.curMenuPoint
        },
        moduleItems(state) {
            return state.moduleItems
        },
        siteTree(state) {
            return state.siteTree
        },
        menuPointId(state) {
            return state.curMenuPoint.id
        },
        parentMenuPointId(state) {
            return state.curMenuPoint.parent_menu_point
        },
        icons() {
            return Constants.icons
        },
        colors() {
            return Constants.colors
        },
        activeTreeNodeId(state) {
            return state.activeTreeNodeId
        },
        treeNodeSelected(state) {
            return state.activeTreeNodeId>1
        },
        urlRules() {
            return Constants.urlRules
        },
        menuPointListable(state) {
            let listableModules = [3,4,5]
            return listableModules.indexOf(parseInt(state.curMenuPoint.module_id))!==-1
        },
        contentTableHeaders() {
            return Constants.contentTableHeaders
        },
        isContentTableLoading(state) {
            return state.contentTableLoading
        },
        tableLoadingText() {
            return Constants.tableLoadingText
        },
        contentTableData(state) {
            return state.contentTableData
        },
        contentTableOptions(state) {
            return state.contentTableOptions
        },
        tableNoDataText() {
            return Constants.tableNoDataText
        },
        tableItemsPerPageText() {
            return Constants.tableItemsPerPageText
        },
    }
});

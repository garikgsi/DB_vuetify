import Vue from 'vue'
import Router from 'vue-router'


import ABPHome from '@/components/Views/ABPHome.vue'
import ABPAppLogin from '@/components/Views/ABPAppLogin.vue'
import ABPUserProfile from '@/components/Views/ABPUserProfile.vue'
import ABPNotes from '@/components/Views/ABPNotes.vue'
// import SiteAdmin from './components/SiteAdmin.vue'
import UserAdmin from '@/components/Views/UserAdmin.vue'
// import Nomenklatura from './components/Views/Nomenklatura.vue'
// import NomenklaturaForm from './components/Forms/NomenklaturaForm.vue'
// import BaseForm from './components/Forms/BaseForm.vue'
// import DocumentForm from './components/Forms/DocumentForm'
// import ABPForm from './components/Forms/ABPForm.vue'
// import ProductionForm from './components/Forms/ProductionForm.vue'
import ABPFormEditor from '@/components/Views/ABPFormEditor'
import ABPReport from '@/components/Tables/ABPReport.vue'
import ABPTable from '@/components/Tables/ABPTable'

Vue.use(Router)

const router = new Router({
    mode: 'history',
    publicPath: '/',
    base: '/',
    routes:
        [
            {
                path: '',
                name: 'home',
                // component: ProductionForm,
                // props(route) {
                //     let res = {
                //         modType: 'add',
                //         table: 'productions'
                //     }
                //     return res
                // }
                component: ABPHome
            },
            {
                path: '/login',
                name: 'login',
                component: ABPAppLogin,
                meta: {noAuth: true}
            },
            {
                path: '/profile',
                name: 'profile',
                component: ABPUserProfile,
            },
            {
                path: '/notes',
                name: 'notes',
                component: ABPNotes,
            },
            // {
            //     path: '/site-admin',
            //     name: 'site-admin',
            //     component: SiteAdmin
            // },
            {
                path: '/user-admin',
                name: 'user-admin',
                component: UserAdmin
            },
            // {
            //     path: '/nomenklatura',
            //     name: 'nomenklatura',
            //     component: Nomenklatura
            // },
            // {
            //     path: '/nomenklatura-form/:id?',
            //     name: 'nomenklatura-form',
            //     component: NomenklaturaForm,
            //     props: true
            // },
            // редактор
            {
                path: '/form/:table/:modType?/:id?',
                name: 'form',
                component: ABPFormEditor,
                props(route) {
                    let res = {
                        table: route.params.table,
                        params: {
                            closable: false
                        }
                    }
                    res = {...res, ...route.params}
                    res.modType = route.params.modType ? route.params.modType : 'add'
                    // if (route.params.id) res.id = route.params.id
                    // if (route.params.keyModel) res.keyModel = route.params.keyModel
                    return res
                }
            },
            // обычная таблица
            {
                path: '/table/:table',
                name: 'table',
                component: ABPTable,
                props: true
            },
            // таблица отчета
            {
                path: '/report/:table',
                name: 'report',
                component: ABPReport,
                props: true
            }
        ]
    })

router.beforeEach((to, from, next) => {
    // // имена маршрутов, которые не сохранять в стор
    // let dontStoreRoutes = ['add','copy']
    // // сохраним в стор предыдущий роут
    // if (dontStoreRoutes.indexOf(from.name)===-1) {
    //     store.dispatch('setPrevRoute', from)
    // }

    // только для авторизованных действий
    const loggedIn = Vue.$storage.get('user')
    if (to.matched.some(record => record.meta.noAuth)) {
        next()
    } else {
        if (!loggedIn) {
            next('/login')
        } else {
            next()
        }
    }
})

// router.afterEach((to,from)=>{
// })

export default router

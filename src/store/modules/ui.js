        // все компоненты - логические элементы наполнения интерфейсов
        const components = [
            // административные функции
            {
                name: 'site-admin',
                title: 'Админка сайта',
                icon: 'mdi-webpack',
                route: '/site-admin',
            },
            {
                name: 'user-admin',
                title: 'Управление пользователями',
                icon: 'mdi-key',
                route: '/user-admin',
            },
            // справочники
            {
                name: 'catalog-sotrudniks',
                title: 'Сотрудники',
                icon: 'mdi-account-hard-hat',
                route: '/table/sotrudniks',
            },
            {
                name: 'catalog-shipping-companies',
                title: 'Транспортные компании',
                icon: 'mdi-truck',
                route: '/table/shipping_companies',
            },
            {
                name: 'catalog-nomenklatura',
                title: 'Номенклатура',
                icon: 'mdi-barcode-scan',
                route: '/table/nomenklatura',
            },
            {
                name: 'catalog-sklads',
                title: 'Склады',
                icon: 'mdi-warehouse',
                route: '/table/sklad_receives',
            },
            {
                name: 'catalog-kontragents',
                title: 'Контрагенты',
                icon: 'mdi-card-account-details-outline',
                route: '/table/kontragents',
            },
            {
                name: 'catalog-firms',
                title: 'Организации',
                icon: 'mdi-account-supervisor-circle',
                route: '/table/firms',
            },
            // действия
            {
                name: 'action-sklad-receive',
                title: 'Поступления на склад',
                icon: 'mdi-warehouse',
                route: '/table/sklad_receives',
            },
            {
                name: 'action-sklad-move',
                title: 'Перемещения по складам',
                icon: 'mdi-chevron-double-right',
                route: '/table/sklad_moves',
            },
            {
                name: 'action-production',
                title: 'Производство',
                icon: 'mdi-wrench',
                route: '/table/productions',
            },
            {
                name: 'action-acts',
                title: 'Реализации',
                icon: 'mdi-human-dolly',
                route: '/table/acts',
            },
            // отчеты
            {
                name: 'report-sklad-remains',
                title: 'Отчет по остаткам',
                icon: 'mdi-paper-roll',
                route: '/report/report_sklad_remains',
            },
            // декстопные вью
        ]
        // роли - набор компонентов в роле
        const managerRole = {
            sideBar: [
                'catalog-kontragents',
                'report-sklad-remains',
                'catalog-nomenklatura',
                'catalog-sotrudniks',
                'catalog-firms',
                'action-acts'
            ],
            desktop: [

            ],
            footer: [
                'catalog-kontragents',
                'report-sklad-remains',
                'catalog-nomenklatura'
            ]
        }
        const topRole = {
            sideBar: [
                'catalog-kontragents',
                'catalog-sotrudniks',
                'report-sklad-remains',
                'action-production'
            ],
            desktop: [

            ],
            footer: [
                'catalog-kontragents',
                'report-sklad-remains',
                'catalog-sotrudniks'
            ]
        }
        const keeperRole = {
            sideBar: [
                'catalog-nomenklatura',
                'action-sklad-receive',
                'action-sklad-move',
                'action-production',
                'report-sklad-remains',
            ],
            desktop: [

            ],
            footer: [
                'action-sklad-receive',
                'report-sklad-remains',
                'catalog-nomenklatura'
            ]
        }
        const adminRole = {
            sideBar: [
                ...managerRole.sideBar,
                ...topRole.sideBar,
                ...keeperRole.sideBar,
            ],
            desktop: [

            ],
            footer: [
                'catalog-sotrudniks',
                'catalog-kontragents',
                'catalog-shipping-companies',
            ]
        }
        const superAdminRole = {
            sideBar: [
                ...adminRole.sideBar,
                'user-admin',
                'site-admin'
            ],
            desktop: [

            ],
            footer: [
                'user-admin',
                'site-admin',
                'catalog-sotrudniks'
            ]
        }
        const guestRole = {
            sideBar: [],
            desktop: [],
            footer: []
        }
        const roles = [
            // гость
            {name: 'guest', title:'Гость', icon: 'mdi-account-question-outline',
                ...guestRole
            },
            // руководитель
            {name: 'top', title:'Руководитель', icon: 'mdi-account-tie',
                ...topRole
            },
            // менеджер
            {name: 'manager', title:'Менеджер', icon: 'mdi-account-tie-voice', 
                ...managerRole
            },
            // кладовщик
            {name: 'keeper', title:'Кладовщик', icon: 'mdi-home-account', 
                ...keeperRole
            },
            // администратор
            {name: 'admin', title:'Администратор', icon: 'mdi-shield-account-outline', 
                ...adminRole
            },
            // супер администратор
            {name: 'super admin', title:'Супер администратор', icon: 'mdi-shield-account', 
                ...superAdminRole
            },
        ]

        const defaultUI = {
            ...guestRole
        }


export default {

    state: {
        currentUI: null,
    },

    mutations: {
        CLEAR_USER_UI(state) {
            state.currentUI = null
        },
        SET_USER_UI(state, userRoles) {
            if (userRoles.length>0) {
                // console.log(`${JSON.stringify(adminRole)}`)
                // список всех блоков для наполнения компонентами
                let bars = ['sideBar', 'desktop', 'footer']
                // поищем интерфейс для роли
                let findUIs = roles.filter(r=>{
                    return userRoles.indexOf(r.name)!==-1
                })
                // результирующий интерфейс
                let resUI = {...defaultUI}
                // если интерфейс был найден
                if (findUIs) {
                    // определим набор компонентов для каждого блока
                    for (let bar of bars) {
                        // для каждого найденного интерфейса добавим набор компонент
                        for (let findUI of findUIs) {
                            // набор компонентов блока
                            let barComponents = findUI[bar]
                            // помещаем в результирующий интерфейс пустой набор блока
                            if (resUI[bar] === undefined) resUI[bar] = []
                            // добавляем в блок результирующего интерфейса компоненты
                            for (let componentName of barComponents) {
                                // найдем компонент в списке компонент
                                let findComponent = components.find(component=>{
                                    return component.name == componentName
                                })
                                // если нашли - добавим его
                                if (findComponent) {
                                    // если компонента нет в списке - добавим
                                    if (resUI[bar].findIndex(UIcomponent=>{
                                        return UIcomponent.name === findComponent.name
                                    }) === -1) {
                                        resUI[bar].push(findComponent)
                                    }
                                }
                            }
                        }
                    }
                } 
                state.currentUI = resUI
            } else {
                state.currentUI = null
            }
        }
    },

    actions: {
        setUserUI({commit},roles) {
            // console.log(JSON.stringify(roles))
            commit('SET_USER_UI', roles)
        },
        clearUserRoles({commit}) {
            commit('CLEAR_USER_UI')
        }
    },

    getters: {
        userUI(state) {
            return state.currentUI
        },
        setUI(state) {
            return state.currentUI ? true : false
        }
    }
}



let now = new Date()
let formatNow = `${now.getUTCFullYear()}-${now.getUTCMonth()}-${now.getUTCDay()} ${now.getUTCHours()}:${now.getUTCMinutes()}:${now.getUTCSeconds()}`

export default {
    defaultMenuPoint: {
        "id": 0,
        "title": "",
        "content": "",
        "content2": "",
        "parent_menu_point": 0,
        "num_order": 1,
        "meta_title": '',
        "meta_keywords": '',
        "meta_description": '',
        "surl": '',
        "module_id": 2,
        "is_popular": 0,
        "is_show_in_menu": 1
    },
    defaultContent: {
        "id": 0,
        "menu_point_id": 0,
        "content": "",
        "preview": "",
        "index_page_text": "",
        "start_from": formatNow,
        "meta_title": "",
        "meta_keywords": "",
        "meta_description": "",
        "surl":"",
        "img":null
    },
    defaultTableOptions: {
        "page":1,
        "itemsPerPage":10
    },
    icons: {
        html:       'mdi-language-html5',
        news:       'mdi-rss-box',
        catalog:    'mdi-shopping-outline',
        stories:    'mdi-newspaper-variant-outline',
        delete:     'mdi-delete',
        add:        'mdi-plus',
        edit:       'mdi-lead-pencil',
        close:      'mdi-close'
    },
    colors: {
        content_editor:     'deep-purple darken-2',
        confirmRemoveBtn:   'error',
        cancelRemoveBtn:    'success',
    },
    tableLoadingText: 'данные загружаются ...',
    tableNoDataText: 'нет данных',
    tableItemsPerPageText: 'Строк на странице',
    urlRules: [
        v => !!v || 'Необходимо заполнить URL страницы',
        v => /^(([а-яА-Яa-z]+)?[а-яА-Яa-z0-9_\-\s])+$/.test(v) || 'Только буквы, цифры и знаки подчеркивания и дефис'
    ],
    contentTableHeaders: [
        {text: 'id', value: 'id', sortable: true},
        {text: 'url', value: 'surl', sortable: true},
        {text: 'Дата начала показа', value: 'start_from', sortable: true},
    ],
    defaultTab: 0,

    // ABP Table
    tableInitOptions: {
        // tableOptions: this.defaultTableOptions,
        data: [],
        total: 0,
    }
}

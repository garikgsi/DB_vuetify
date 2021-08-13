<template>
    <div>
        <!-- {{dataLoaded}} -->
        <!-- {{table}} -->
        <!-- abp-select-input={{val}} -->
        <select-input
            v-if="data"
            v-model="val"
            v-bind="settings"
            :loading="setLoading"
            :disabled="disabled || setLoading"
            :items="data"
            :title="title"
            :multiple="multiple"
            :readonly="readonly"
            :required="required"
            :clearable="true"
            :hint="hint"
            :withChips="withChips"
            :dense="dense"
            @change="change($event)"
        >
            <template v-slot:append>
                <slot name="append"></slot>
            </template>
            <template v-slot:item="{data}">
                <template
                    v-if="data.item.id>1"
                >
                    <slot name="item" v-bind:data="data">
                        <v-list-item-action>
                            <abp-icon-button
                                v-if="editable"
                                icon="mdi-pencil"
                                tip="Редактировать выбранное"
                                :disabled="disabled"
                                @click="editItem(data.item.id)"
                            ></abp-icon-button>
                        </v-list-item-action>
                        <v-list-item-content>
                            <v-list-item-title v-text="data.item.select_list_title"></v-list-item-title>
                        </v-list-item-content>
                    </slot>
                </template>
                <template
                    v-else
                >
                    <v-list-item-content>
                        <v-list-item-title v-text="data.item.select_list_title"></v-list-item-title>
                    </v-list-item-content>
                    <v-list-item-action
                        v-if="showParamsButton"
                    >
                        <abp-icon-button
                            class="float-right"
                            icon="mdi-sort-bool-descending-variant"
                            tip="Подбор по параметрам"
                            :disabled="disabled"
                            @click="openParamsForm"
                        ></abp-icon-button>
                    </v-list-item-action>
                    <v-list-item-action
                        v-if="editable"
                    >
                        <abp-icon-button
                            class="float-right"
                            icon="mdi-playlist-plus"
                            tip="Добавить запись"
                            :disabled="disabled"
                            @click="addItem"
                        ></abp-icon-button>
                    </v-list-item-action>
                </template>
            </template>
            <!-- <template v-slot:append>
                <abp-icon-button
                    v-if="clearable"
                    :disabled="!isClearable"
                    icon="mdi-close"
                    tip="Очистить"
                    @click="changeInput(null)"
                ></abp-icon-button>
            </template> -->

        </select-input>
        <!-- добавление / редактирование выбранной записи -->
        <abp-dialog
            :title = "formTitle"
            v-model = "showForm"
            v-if="table"
            :width="formWidth"
        >
            <abp-form
                v-if="showForm"
                v-model="formSelector"
                :table="table"
                :id="inputId"
                :modType="modType"
                :miniForm="miniForm"
                :canSwitchMini="true"
                :singleFieldRow="miniForm"
                :disableDefaultSubmit="false"
                :inDialog="true"
                :showFilters="true"
                @closeForm="showForm=false"
                @submitSuccess="submitted($event)"
                @toggleMiniForm="toggleMiniForm"
            >
            </abp-form>
        </abp-dialog>
        <!-- подбор по параметрам -->
        <abp-dialog
            title = "Подбор по параметрам"
            v-model = "showFiltersForm"
            v-if="table && !customParamForm"
        >
            <abp-select-params-table
                v-if="showFiltersForm"
                v-model="tableSelector"
                :table="table"
                :tableParams="tableParams"
                @selected="selectFromTable"
            ></abp-select-params-table>
        </abp-dialog>
    </div>
</template>

<script>
    import { mapActions } from 'vuex'

    // import ABPDialog from '../Dialogs/ABPDialog.vue'
    // import SelectInput from './SelectInput'
    // import ABPTable from '../Tables/ABPTable'
    // import ABPIconButton from './ABPIconButton'


    export default {
        name: 'AbpSelectInput',
        components: {
            'abp-dialog' : () => import('../Dialogs/ABPDialog.vue'),
            'select-input' : () => import('./SelectInput.vue'),
            'abp-select-params-table' : () => import('../Tables/ABPSelectParamsTable'),
            'abp-icon-button' : () => import('./ABPIconButton'),
            'abp-form': () => import('../Forms/ABPForm.vue')
        },
        model: {
            prop: "inputValue",
            event: "input"
        },
        props: {
            inputValue: {
                required: true,
            },
            settings: {
                type: Object,
                required: false
            },
            // добавлять кнопки "добавить" и "редактировать"
            editable: {
                type: Boolean,
                required: false,
                default: true
            },
            table: {
                type: String,
                required: true
            },
            multiple: {
                type: Boolean,
                required: false,
                default: false
            },
            disabled: {
                type: Boolean,
                required: false,
                default: false
            },
            clearable: {
                type: Boolean,
                required: false,
                default: true
            },
            // выбирать единственную запись
            chooseEqual: {
                type: Boolean,
                required: false,
                default: true
            },
            // кол-во значений, при котором появляется кнопка подбора по параметрам
            showParams: {
                type: Number,
                required: false,
                default: 1
            },
            readonly: {
                type: Boolean,
                required: false,
                default: false
            },
            required: {
                type: Boolean,
                required: false,
                default: false
            },
            title: {
                type: String,
                required: false,
                default: ''
            },
            hint: {
                type: String,
                required: false,
                default: ''
            },
            // чипсы вместо наименования
            withChips: {
                type: Boolean,
                required: false,
                default: false
            },
            // без отступов - сжатый по высоте режим
            dense: {
                type: Boolean,
                required: false,
                default: false
            },
            // данные из внешнего источника
            dataArray: {
                type: Array,
                required: false,
                default() {
                    return null
                }
            },
            // использовать данные из внешнего источника
            useDataArray: {
                type: Boolean,
                required: false,
                default: false
            },
            // индикация загрузки
            loading: {
                type: Boolean,
                required: false,
                default: false
            },
            // использовать собственную форму отбора по параметрам
            customParamForm: {
                type: Boolean,
                required: false,
                default: false
            },
            // только указанные значения будут доступны для выбора
            validItems: {
                type: Array,
                required: false,
            },
            // исключить значения из списка - будут доступны только переданные в массиве
            exceptItems: {
                type: Array,
                required: false
            }
        },
        data() {
            return {
                isLoading: false,
                miniForm: true,
                showForm: false,
                modType: 'add',
                showFiltersForm: false,
                filters: {},
                formSelector: {},
                tableSelector: [],
                inputId: 1,
                loadingTable: null,
                stateLoaded: false
            }
        },
        created() {

            // console.log(typeof(this.table))

            // this.table();

            if (!this.useDataArray) {
                this.initInput(this.table)
            }
        },
        methods: {
            ...mapActions(['getSelectData']),
            initInput(table) {
                this.isLoading = true
                if (this.$store.state.table.selectData[table]) {
                    this.$emit('loaded')
                    this.loading = false
                    this.stateLoaded = true
                    this.isLoading = false
                } else {
                    this.getSelectData(table)
                        .then(()=>{
                            this.$emit('loaded')
                            this.isLoading = false
                            this.stateLoaded = true
                        })
                }
            },
            changeInput(newValue) {
                this.$emit('input',newValue)
            },
            change(newValue) {
                this.$emit('change',newValue)
            },
            addItem() {
                this.modType = 'add'
                this.showForm = true
            },
            selectFromTable() {
                if (this.tableSelector.length>0) {
                    this.setValue(this.tableSelector[0].id)
                } else {
                    // очищаем
                    this.changeInput(null)
                }
                if (!this.customParamForm) {
                    this.showFiltersForm = false
                }
            },
            setValue(id) {
                let newValue = this.inputValue
                if (this.multiple) {
                    if (newValue && Array.isArray(newValue)) {
                        newValue.push(id)
                    } else {
                        newValue = [id]
                    }
                } else {
                    newValue = id
                }
                if (newValue) this.changeInput(newValue)
            },
            editItem(id) {
                if (id>1) {
                    // добавить опцию на открытие формы по переданному id
                    this.inputId = id
                    this.modType = 'edit'
                    this.showForm = true
                }
            },
            submitted(data) {
                // выберем созданную запись
                if (data.id) {
                    this.setValue(data.id)
                }
                // закрываем форму, если миниформа
                if (this.miniForm) {
                    this.showForm = false
                } else {
                    this.modType = 'edit'
                }
            },
            toggleMiniForm() {
                this.miniForm = !this.miniForm
            },
            openParamsForm() {
                if (this.customParamForm) {
                    this.$emit('open-param-table')
                } else {
                    this.showFiltersForm = true
                }
            },
        },
        computed: {
            val: {
                get() {
                    return this.inputValue
                },
                set(newValue) {
                    this.$emit('input',newValue)
                }
            },
            rules() {
                if (this.required && !this.readonly) {
                    if (this.multiple) {
                        return [
                            v => (!!v && v.length>1 || (v.length==1 && v[0]>1)) || this.requireMsg
                        ]
                    } else {
                        return [
                            v => (!!v && v>1) || this.requireMsg
                        ]
                    }
                } else {
                    return [
                        true
                    ]
                }
            },
            tableParams() {
                let res = {}
                // только указанные значения будут доступны для выбора
                if (this.validItems) res.validItems = this.validItems
                // исключить значения из списка - будут доступны только переданные в массиве
                if (this.exceptItems) res.exceptItems = this.exceptItems
                return res
            },
            storeData() {
                if (this.$store.state.table.selectData[this.table] && this.stateLoaded) {
                    return this.$store.state.table.selectData[this.table]
                }
                return []
            },
            data() {
                let d = []
                if (this.useDataArray) {
                    if (this.dataArray) d = [...this.dataArray]
                } else {
                    d = [...this.storeData]
                }
                if (!this.multiple) {
                    if (d.findIndex(item=>{
                        item.id==1
                    })===-1) d.unshift({id:1, select_list_title:'Не выбрано'})
                }
                // только указанные значения будут доступны для выбора
                if (this.validItems) {
                    d = d.map(item=>{
                        if (this.ValidItems.indexOf(item.id)===-1) {
                            return item
                        } else {
                            return {...item, ...{readonly: true}}
                        }
                    })
                }
                // исключить значения из списка - будут доступны только переданные в массиве
                if (this.exceptItems) {
                    d = d.map(item=>{
                        if (this.exceptItems.indexOf(item.id)===-1) {
                            return item
                        } else {
                            return {...item, ...{disabled: true}}
                        }
                    })
                }
                // если запись единственная - выберем ее
                // if (this.chooseEqual && d.length==2) {
                //     if (d[1].id!==undefined) this.val = d[1].id
                // }

                return d
            },
            isClearable() {
                if (this.multiple) {
                    return !!this.inputValue && this.inputValue.length>0
                } else {
                    return !!this.inputValue && this.inputValue>1
                }
            },
            dataLoaded() {
                return this.data.length>0
            },
            formWidth() {
                if (this.miniForm) return 300; else return 'auto'
            },
            showParamsButton() {
                return this.showParams>0 && this.data.length>this.showParams
            },
            formTitle() {
                switch(this.modType) {
                    case 'add': {
                        return `добавление записи`
                    }
                    case 'copy': {
                        return `копирование записи`
                    }
                    case 'edit': {
                        return `редактирование записи`
                    }
                    default: {
                        return ``
                    }
                }
            },
            setLoading() {
                return this.loading || this.isLoading || false
            }
            // required() {
            //     return this.require || false
            // }
        },
        watch: {
            table(newTable) {
                this.initInput(newTable)
            }
        }
    }
</script>

<style lang="scss" scoped>

</style>

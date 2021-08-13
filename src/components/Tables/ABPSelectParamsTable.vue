<template>
    <div>
        <abp-table
            v-model="val"
            title="Подбор по параметрам"
            :table="table"
            :selectable="true"
            :editable="false"
            :multiSelect="false"
            :dense="true"
            :show-filters="true"
            :hide-footer="false"
            :hide-header="false"
            :use-data-array="useDataArray"
            :array-count="arrayCount"
            :data-array="dataArray"
            v-bind="tableParams"
            @input="selected"
            @getData="getData"
        >
            <template v-slot:append-top-actions>
                <abp-icon-button
                    icon="mdi-check"
                    tip="Выбрать"
                    @click="selected"
                ></abp-icon-button>
            </template>
        </abp-table>
    </div>
</template>

<script>
    export default {
        name: 'abp-select-params-table',
        components:{
            'abp-table': () => import('./ABPTable'),
            'abp-icon-button' : () => import('../Form/ABPIconButton'),
        },
        model: {
            prop: "inputValue",
            event: "input"
        },
        props: {
            inputValue: {
                required: true,
            },
            table: {
                type: String,
                required: true
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
            // кол-во данных из внешнего источника
            arrayCount: {
                type: Number,
                required: false,
                default: 10
            },
            // параметры таблицы
            tableParams: {
                type: Object,
                require: false
            }
        },
        computed: {
            val: {
                get() {
                    return this.inputValue
                },
                set(newVal) {
                    this.$emit('input', newVal)
                }
            }
        },
        methods: {
            selected() {
                this.$emit('selected')
            },
            getData() {
                this.$emit('getData')
            }
        }
    }
</script>

<style lang="scss" scoped>

</style>

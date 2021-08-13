<template>
    <div>
        <abp-table
            :table="table"
            :keyModel="keyModel"
        ></abp-table>
    </div>
</template>

<script>
    import ABPTableVue from './ABPTable.vue'
    export default {
        name: 'abp-form-sub-table',
        components: {
            'abp-table' : ABPTableVue
        },
        props: {
            // таблица
            table: {
                type: String,
                required: true
            },
            // связи таблицы в виде массива [{key1:value1}, {key2:value2}]
            keyModel: {
                type: Array,
                required: true,
            },
        }
    }
</script>

<style lang="scss" scoped>

</style>

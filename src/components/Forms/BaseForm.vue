<template>
    <div>
        <!-- form values = {{values}} -->
        <abp-form
            v-model="values"
            :table="table"
            :id="id"
            :modType="modType"
            :closable="false"
        ></abp-form>
    </div>
</template>

<script>
    import ABPForm from './ABPForm'
    export default {
        name: 'base-form',
        components: {
            'abp-form' : ABPForm
        },
        props: {
            table: {
                type : String,
                required: false
            },
            id: {
                type : Number,
                required: false, // if add
            },
            modType: {
                type : String,
                required: false,
                default: 'add' /* copy, edit */
            },
        },
        data() {
            return {
                values: {}
            }
        }
    }
</script>

<style lang="scss" scoped>

</style>

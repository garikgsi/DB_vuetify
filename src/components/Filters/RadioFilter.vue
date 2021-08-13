<template>
    <div>
        <select-input
            :inputValue="inputValue"
            :title="`Признак ${title}`"
            :multiple="true"
            :clearable="true"
            :withChips="true"
            :items="items"
            @input="changeInput($event)"
        ></select-input>
    </div>
</template>

<script>
    import SelectInput from '../Form/SelectInput'

    export default {
        name: 'radio-filter',
        components: {
            'select-input' : SelectInput
        },
        model: {
            prop: "inputValue",
            event: "input"
        },
        props: {
            inputValue: {
                required: true,
            },
            title: {
                type: String,
                required: false
            },
            items: {
                type: Array,
                required: true
            }
        },
        data() {
            return {
            }
        },
        methods: {
            changeInput(newValue) {
                this.$emit('input',newValue)
            },
        },

    }
</script>

<style lang="scss" scoped>

</style>

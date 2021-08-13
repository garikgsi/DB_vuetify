<template>
    <div>
        <date-input
            :inputValue="inputValue"
            :title="title"
            :clearable="true"
            @input="changeInput($event)"
        ></date-input>
    </div>
</template>

<script>
    import DateInputVue from '../Form/DateInput.vue'
    export default {
        name: 'date-filter',
        components: {
            'date-input' : DateInputVue
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
        },
        methods: {
            changeInput(newValue) {
                this.$emit('input',newValue)
                console.log(`date is ${this.inputValue}`)
            },
        },

    }
</script>

<style lang="scss" scoped>

</style>

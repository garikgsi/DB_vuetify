<template>
    <div>
        <v-text-field
            :value="inputValue"
            :label="settings.title"
            :rules="rules"
            :readonly="readonly"
            :hint="settings.hint"
            v-mask="ipMask"
            @input="changeInput($event)"
        ></v-text-field>
    </div>
</template>

<script>
    export default {
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
        },
        data() {
            return {
                ipMask: '###.###.###.###',
            }
        },
        mounted() {
            this.$emit('loaded')
        },
        methods: {
            changeInput(newValue) {
                this.$emit('input', newValue)
            }
        },
        computed: {
            rules() {
                if (this.required && !this.readonly) {
                    return [
                        v => !!v || `Заполните ${this.settings.title}`
                    ]
                } else {
                    return [
                        true
                    ]
                }
            },
            readonly() {
                return this.settings.readonly || false
            },
            required() {
                return this.settings.require || false
            }
        }
    }
</script>

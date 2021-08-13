<template>
    <div>
        <v-textarea
            :value="inputValue"
            :label="settings.title"
            :rules="rules"
            :readonly="readonly"
            :hint="settings.hint"
            clearable
            @input="changeInput($event)"
            @click:clear="clearInput"
        ></v-textarea>
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
            }
        },
        mounted() {
            this.$emit('loaded')
        },
        methods: {
            changeInput(newValue) {
                this.$emit('input', newValue)
            },
            clearInput() {
                this.changeInput('')
            },
        },
        computed: {
            rules() {
                if (!this.readonly && this.required) {
                    return [
                        v => !!v || `Заполните ${this.settings.title}`,
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

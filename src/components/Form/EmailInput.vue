<template>
    <div>
        <v-text-field
            :prepend-inner-icon="prependIcon"
            :value="inputValue"
            :label="settings.title"
            :rules="rules"
            :readonly="readonly"
            :hint="settings.hint"
            :prepend-icon="settings.icon"
            @click:prepend-inner="sendEmail"
            @input="changeInput($event)"
            @change="emailChange($event)"
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
                email: this.inputValue
            }
        },
        created() {
        },
        mounted() {
            this.$emit('loaded')
        },
        methods: {
            changeInput(newValue) {

                this.$emit('input', newValue)
            },
            emailChange(newValue) {
                this.email = newValue
            },
            sendEmail() {
                if (this.prependIcon) {
                    alert(`Отправляем на ${this.email}`)
                }
            }
        },
        computed: {
            rules() {
                if (!this.readonly && this.required) {
                    return [
                        v => !!v || `Заполните ${this.settings.title}`,
                        v => /.+@.+\..+/.test(v) || 'Введите правильный адрес электронной почты'
                    ]
                } else {
                    return [
                        true
                    ]
                }
            },
            isEmailValid() {
                let emailExpr = /.+@.+\../
                if (this.email && emailExpr.test(this.email)) {
                    return true
                } else {
                    return false
                }
            },
            readonly() {
                return this.settings.readonly || false
            },
            required() {
                return this.settings.require || false
            },
            prependIcon() {
                if (!!this.settings.showAction && this.isEmailValid) {
                    return 'mdi-email-send'
                } else {
                    return null
                }
            }
        }
    }
</script>

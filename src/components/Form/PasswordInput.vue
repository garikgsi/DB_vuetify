<template>
    <div>
        <v-text-field
            dense
            :type="showPwd ? 'text' : 'password'"
            :append-icon="showPwd ? 'mdi-eye' : 'mdi-eye-off'"
            :value="inputValue"
            :label="settings.title"
            :rules="rules"
            :readonly="readonly"
            :hint="settings.hint || `Не менее ${minChars} символов`"
            :prepend-icon="settings.icon"
            counter
            required
            autocomplete="off"
            @input="changeInput($event)"
            @click:append="showPwd = !showPwd"
        ></v-text-field>
        <v-text-field
            dense
            v-if="showRetype"
            :type="showPwdRetype ? 'text' : 'password'"
            :append-icon="showPwdRetype ? 'mdi-eye' : 'mdi-eye-off'"
            v-model="passwordRetype"
            :label="`Повторите ${this.settings.title.toLowerCase()}`"
            :rules="rulesRetype"
            :readonly="readonly"
            :hint="settings.hint || `Не менее ${minChars} символов`"
            counter
            autocomplete="off"
            @click:append="showPwdRetype = !showPwdRetype"
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
                showPwd : false,
                showPwdRetype : false,
                passwordRetype : '',
                password: ''
            }
        },
        mounted() {
            this.$emit('loaded')
        },
        methods: {
            changeInput(newValue) {
                this.password = newValue
                this.$emit('input', newValue)
            }
        },
        computed: {
            rules() {
                if (this.required && !this.readonly) {
                    return [
                        v => !!v || `Заполните ${this.settings.title}`,
                        v => v.length>=this.minChars || `Длина пароля не может быть меньше ${this.minChars} символов`,
                    ]
                } else {
                    return [
                        true
                    ]
                }
            },
            rulesRetype() {
                if (this.required && !this.readonly) {
                    return [
                        v => v===this.password || 'Пароль и подтверждение не совпадают'
                    ]
                } else {
                    return [
                        true
                    ]
                }
            },
            minChars() {
                return this.settings.min || 8
            },
            showRetype() {
                return this.settings.withRetype || false
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

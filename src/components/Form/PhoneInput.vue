<template>
    <div>
        <v-text-field
            :prepend-inner-icon="prependIcon"
            :value="phone"
            :label="settings.title"
            :rules="rules"
            :readonly="readonly"
            :disabled="disabled"
            :hint="settings.hint"
            v-mask="phoneMask"
            @input="changeInput($event)"
        >
            <template v-slot:prepend-inner>
                <v-btn
                    v-if="prependIcon"
                    icon
                    @click="makePhoneCall"
                >
                    <v-icon>
                        {{prependIcon}}
                    </v-icon>
                </v-btn>
                <span :class="[prependIcon ? 'phone-prefix-with-icon' : 'phone-prefix-without-icon']">+7</span>
            </template>
            <template v-slot:append>
                <abp-icon-button
                    icon="mdi-close"
                    tip="Очистить"
                    :disable-tab="true"
                    @click="changeInput(null)"
                ></abp-icon-button>
            </template>
        </v-text-field>
    </div>
</template>

<script>
    import ABPIconButtonVue from './ABPIconButton.vue'
    export default {
        name: 'phone-input',
        components: {
            'abp-icon-button' : ABPIconButtonVue
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
            clearable: {
                type: Boolean,
                required: false,
                default: true
            },
            readonly: {
                type: Boolean,
                required: false,
                default: false
            },
            require: {
                type: Boolean,
                required: false,
                default: false
            },
            disabled: {
                type: Boolean,
                required: false,
                default: false
            },
        },
        data() {
            return {
                phoneMask: '(###)###-##-##',
                // phone: this.inputValue
            }
        },
        mounted() {
            this.$emit('loaded')
        },
        methods: {
            changeInput(newValue) {
                // this.phone = newValue
                this.$emit('input', newValue)
            },
            makePhoneCall() {
                if (this.prependIcon && this.isPhoneValid) {
                    alert(`звоним на +7${this.phone}`)
                }
            }
        },
        computed: {
            phone: {
                get() {
                    return this.inputValue
                },
                set(newValue) {
                    this.$emit('input',newValue)
                }
                // return this.inputValue
            },
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
            isPhoneValid() {
                let phoneExpr = /^\(\s?\d{3}\s?\)\s?\d{3}\s?-\s?\d{2}\s?-\s?\d{2}$/
                if (this.phone && phoneExpr.test(this.phone)) {
                    return true
                } else {
                    return false
                }
            },
            required() {
                return this.settings.required || this.require || false
            },
            // readonly() {
            //     return this.settings.readonly || this.readonly || false
            // },
            prependIcon() {
                if (!!this.settings.showAction && this.isPhoneValid) {
                    return 'mdi-cellphone-android'
                } else {
                    return null
                }
            }
        }
    }
</script>

<style lang="scss">
    .phone-prefix-with-icon {
        padding-top: 0.47em;
    }
    .phone-prefix-without-icon {
        padding-top: 0.47em;
    }
</style>

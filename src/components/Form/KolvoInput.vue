<template>
    <div>
        <v-text-field
            :value="val"
            :label="title"
            :rules="rules"
            :readonly="readonly"
            :hint="hint"
            persistent-hint
            :type="inputType"
            step="0.001"
            :prepend-icon="icon"
            :clearable="false"
            :dense="dense"
            :disabled="disabled"
            @change="change($event)"
            @blur="focusOut"
            @focus="focusIn"
            @input="changeInput($event)"
        >
            <template v-slot:append>
                <slot name="append"></slot>
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
        name:"kolvo-input",
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
            title: {
                type: String,
                required: false,
                default: null
            },
            hint: {
                type: String,
                required: false,
                default: null
            },
            icon: {
                type: String,
                required: false,
                default: null
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
            clearable: {
                type: Boolean,
                required: false,
                default: true
            },
            disabled: {
                type: Boolean,
                required: false,
                default: false
            },
            // без отступов - сжатый по высоте режим
            dense: {
                type: Boolean,
                required: false,
                default: false
            },
        },
        data() {
            return {
                focused: false
            }
        },
        mounted() {
            this.$emit('loaded')
        },
        methods: {
            changeInput(newValue) {
                let formattedVal = parseFloat(newValue)
                if (isNaN(formattedVal)) formattedVal=0
                this.$emit('input',formattedVal)
            },
            change(newValue) {
                this.$emit('change',newValue)
            },
            focusIn() {
                this.focused = true
            },
            focusOut() {
                this.focused = false
            }
        },
        computed: {
            val: {
                get() {
                    if (this.focused) {
                        return this.inputValue
                    } else {
                        let formatter = new Intl.NumberFormat("ru", {
                            style: "decimal",
                            minimumFractionDigits: 3
                        })
                        return formatter.format(this.inputValue)
                    }
                },
                set() {
                    // console.log(`try to set new value ${parseFloat(newValue)}`)
                    // this.$emit('input', parseFloat(newValue))
                }
            },
            inputType() {
                if (this.focused) {
                    return 'number'
                } else {
                    return 'text'
                }
            },
            rules() {
                // if (this.focused) {
                    let baseRules = [
                        v => !!v || `Заполните ${this.title?this.title:' данное поле'}`
                    ]
                    let myRules = [
                        v => (!!v && /^\d+[\\.,]{0,1}\d{0,3}$/.test(parseFloat(v)) || !v) || 'Число, разделенные точкой или запятой (не более 3 разрядов)',
                        v => parseFloat((v+'').replace(/,/,'.'))>0 || `Значение должно быть больше 0`
                    ]
                    if (this.require && !this.readonly) {
                        return [...baseRules, ...myRules]
                    } else {
                        return myRules
                    }
                // } else {
                //     return [true]
                // }
            },
            isClearable() {
                return this.clearable!==false && !this.readonly
            }
        }
    }
</script>

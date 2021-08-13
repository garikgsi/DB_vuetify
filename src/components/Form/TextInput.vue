<template>
    <div>
        <v-text-field
            :value="inputValue"
            :label="title"
            :rules="rules"
            :readonly="readonly"
            :hint="hint"
            :type="inputType"
            :prepend-icon="icon"
            :dense="dense"
            @input="changeInput($event)"
            @change="change($event)"
        >
            <template v-slot:append>
                <abp-icon-button
                    :disabled="!isClearable"
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
        name: 'text-input',
        components:{
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
            type: {
                type: String,
                required: false,
                default: 'text'
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
            // без отступов - сжатый по высоте режим
            dense: {
                type: Boolean,
                required: false,
                default: false
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
            change(newValue) {
                this.$emit('change',newValue)
            }
        },
        computed: {
            rules() {
                let baseRules = [
                    v => !!v || `Заполните ${this.title?this.title:' данное поле'}`
                ]
                let myRules = []
                switch (this.type) {
                    case 'kolvo': {
                        myRules.push(
                            v => (!!v && /^\d+[\\.,]{0,1}\d{0,3}$/.test(v) || !v) || 'Число, разделенные точкой или запятой (не более 3 разрядов)'
                        )
                    } break;
                    case 'money': {
                        myRules.push(
                            v => (!!v && /^\d+[\\.,]{0,1}\d{0,2}$/.test(v) || !v) || 'Число, разделенные точкой или запятой (не более 2 разрядов)'
                        )
                    } break;
                    case 'integer': {
                        myRules.push(
                            v => (!!v && /^\d+$/.test(v) || !v) || 'Можно вводить только цифры'
                        )
                    } break;
                }
                if (this.require && !this.readonly) {
                    return [...baseRules, ...myRules]
                } else {
                    switch (this.type) {
                        case 'text': {
                            return [true]
                        }
                        default: {
                            if (myRules.length>0) {
                                return myRules
                            } else {
                                return [true]
                            }
                        }

                    }
                }
            },
            inputType() {
                switch (this.type) {
                    case 'money': case 'kolvo': case 'int': {
                        return 'number'
                    }
                    default: {
                        return 'text'
                    }
                }
            },
            isClearable() {
                return this.clearable!==false && !this.readonly && !!this.inputValue
            }
        }
    }
</script>

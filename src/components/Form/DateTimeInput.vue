<template>
    <div>
        <v-menu
            v-model="showCal"
            :close-on-content-click="false"
            transition="scale-transition"
            offset-y
            max-width="580px"
            min-width="580px"
            >
            <template v-slot:activator="{ on }">
                <v-text-field
                    :value="formatDateTime"
                    :label="title"
                    :hint="hint"
                    :prepend-icon="icon"
                    :readonly="readonly"
                    :rules="rules"
                    v-on="on"
                    autocomplete="off"
                >
                    <template v-slot:append>
                        <abp-icon-button
                            v-if="clearable"
                            :disabled="!isClearable"
                            icon="mdi-close"
                            tip="Очистить"
                            @click="clearInput"
                        ></abp-icon-button>
                    </template>
                </v-text-field>
            </template>
            <v-card v-if="!readonly" class="pickers">
                <v-card class="d-flex" flat tile>
                    <v-card>
                        <v-date-picker
                            :value="dateVal"
                            locale="ru"
                            :show-current="today"
                            @input="changeDate($event)"
                        ></v-date-picker>
                    </v-card>
                    <v-card>
                        <v-time-picker
                            :value="timeVal"
                            format="24hr"
                            @input="changeTime($event)"
                            width=289
                        ></v-time-picker>
                    </v-card>
                </v-card>
                <v-card-actions>
                    <v-btn text color="primary" @click="setNow">Сейчас</v-btn>
                    <v-btn text color="primary" @click="showCal = false">ОК</v-btn>
                </v-card-actions>
            </v-card>
        </v-menu>
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
                showCal: false,
            }
        },
        mounted() {
            this.$emit('loaded')
        },
        methods: {
            changeDate(newVal) {
                let setDate = this.$moment(`${newVal} ${this.timeVal}`)
                this.$emit('input', setDate.format('YYYY-MM-DD HH:mm'))
            },
            changeTime(newVal) {
                let setDate = this.$moment(`${this.dateVal} ${newVal}`)
                this.$emit('input', setDate.format('YYYY-MM-DD HH:mm'))
            },
            clearInput() {
                this.$emit('input', null)
            },
            setNow() {
                this.$emit('input', this.$moment().format('YYYY-MM-DD HH:mm'))
                this.showCal = false
            }

        },
        computed: {
            rules() {
                if (!this.readonly && this.required) {
                    return [
                        v => !!v || `Заполните ${this.settings.title}`
                    ]
                } else {
                    return [true]
                }

            },
            today() {
                return this.$moment().format('YYYY-MM-DD')
            },
            formatDateTime() {
                return `${this.dateVal} ${this.timeVal}`
            },
            timeVal() {
                let getDate = this.$moment(this.inputValue)
                const timeFormat = 'HH:mm'
                if (getDate.isValid()) {
                    return getDate.format(timeFormat)
                } else {
                    let now = this.$moment()
                    return now.format(timeFormat)
                }
            },
            dateVal() {
                let getDate = this.$moment(this.inputValue)
                const dateFormat = 'YYYY-MM-DD'
                if (getDate.isValid()) {
                    return getDate.format(dateFormat)
                } else {
                    let now = this.$moment()
                    return now.format(dateFormat)
                }
            },
            required() {
                return this.require || false
            },
            isClearable() {
                return this.clearable!==false && !this.readonly && !!this.inputValue
            }
        }
    }
</script>

<style lang="scss">
    div.pickers {
        .d-flex {
            &>.v-card {
                box-shadow: 0 0 0 !important;

                .v-picker--date {
                    border-radius: 0 !important;
                    box-shadow: 0 0 0 !important;
                    border: none !important;

                    div.v-picker__title.primary {
                        padding-bottom: 15px !important;
                    }
                }
                .v-picker--time {
                    border-radius: 0 !important;
                    box-shadow: 0 0 0 !important;
                    border: none !important;

                    div.v-picker__title.primary {
                        padding: 8px 16px !important;
                    }
                }

            }
        }

    }
</style>

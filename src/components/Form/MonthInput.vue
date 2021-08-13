<template>
    <div>
        <v-menu
        v-model="showCal"
        :close-on-content-click="true"
        transition="scale-transition"
        offset-y
        max-width="290px"
        min-width="290px"
        >
        <template v-slot:activator="{ on }">
            <v-text-field
                :value="formatMonth"
                :rules="rules"
                clearable
                @click:clear="clearInput"
                :label="settings.title"
                :hint="settings.hint"
                :prepend-icon="settings.icon"
                :readonly="readonly"
                v-on="on"
            ></v-text-field>
        </template>
        <v-date-picker
            v-if="!readonly"
            :value="inputValue"
            locale="ru"
            :show-current="today"
            type="month"
            @input="changeInput($event)"
        >
            <v-btn text color="primary" @click="setToday">Текущий</v-btn>
            <v-spacer></v-spacer>
            <v-btn text color="primary" @click="showCal = false">ОК</v-btn>
        </v-date-picker>
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
            changeInput(newValue) {
                this.showCal = false
                this.$emit('input', newValue)
            },
            clearInput() {
                this.changeInput(null)
            },
            setToday() {
                return this.changeInput(this.$moment().format('YYYY-MM-DD'))
            }

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
            formatMonth() {
                if (this.inputValue)
                    return this.$moment(this.inputValue).format('MMMM YYYY')
                else
                    return ''
            },
            today() {
                return this.$moment().format('YYYY-MM-DD')
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

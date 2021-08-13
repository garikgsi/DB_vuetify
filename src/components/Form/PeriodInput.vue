<template>
    <div>
        <v-menu
        v-model="showCal"
        :close-on-content-click="false"
        transition="scale-transition"
        offset-y
        max-width="290px"
        min-width="290px"
        >
        <template v-slot:activator="{ on }">
            <v-text-field
                :value="formatPeriod"
                clearable
                @click:clear="clearInput"
                :label="settings.title"
                :hint="settings.hint"
                :prepend-icon="settings.icon"
                :readonly="readonly"
                :rules="rules"
                v-on="on"
                autocomplete="off"
            ></v-text-field>
        </template>
        <v-date-picker
            v-if="!settings.readonly"
            :no-title=true
            :value="inputValue"
            :readonly="readonly"
            locale="ru"
            @input="changeInput($event)"
            range
        >
            <v-select
                v-model="periodSelect"
                :items="periodItems"
                item-value="id"
                item-text="text"
                label="Выбор периода"
                dense
                clearable
                autocomplete="off"
                @click:clear="clearPeriodSelect"
                @change="selectPeriod"
            ></v-select>
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
                type : Array,
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
                periodSelect: null,
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
                this.changeInput([])
            },
            selectPeriod() {
                if (this.periodSelect) this.changeInput(this.periodSelect)
            },
            clearPeriodSelect() {
                this.changeInput([])
        },
        computed: {
            format() {
                return 'YYYY-MM-DD'
            },
            rules() {
                if (!this.readonly && this.required) {
                    return [
                        v => !!v || `Заполните ${this.settings.title}`
                    ]
                } else {
                    return [true]
                }

            },
            formatPeriod() {
                if (this.inputValue.length==2) {
                    return this.$moment(this.inputValue[0]).format('DD.MM.YYYY')+' ~ '+this.$moment(this.inputValue[1]).format('DD.MM.YYYY')
                } else {
                    return ''
                }
            },
            periodItems() {
                let year = this.$moment().format('YYYY')
                let quarter = this.$moment().quarter()
                let data = []
                // текущий год
                data.push(
                    {text:`${year} год`, id:[this.$moment().startOf('year').format(this.format),this.$moment().endOf('year').format(this.format)]}
                )
                // кварталы
                for(let i=1;i<5;i++) {
                    let startQuarter
                    let endQuarter
                    let textQuarter
                    if (i==quarter) {
                        startQuarter = this.$moment().startOf('quarter')
                        endQuarter = this.$moment().endOf('quarter')
                        textQuarter = 'текущий квартал'
                    } else {
                        let thisQuarter = this.$moment().quarter(i)
                        startQuarter = thisQuarter.startOf('quarter')
                        endQuarter = startQuarter.endOf('quarter')
                        textQuarter = `${i}-й квартал ${year} г.`
                    }
                    data.push({text:textQuarter, id:[startQuarter.format(this.format),endQuarter.format(this.format)]})
                    // полгода
                    if (i==2) {
                        data.push({text:`6 мес ${year} г.`, id:[this.$moment().startOf('year').format(this.format),endQuarter.format(this.format)]})
                    }
                    // 9 мес
                    if (i==3) {
                        data.push({text:`9 мес ${year} г.`, id:[this.$moment().startOf('year').format(this.format),endQuarter.format(this.format)]})
                    }
                }
                // месяцы
                let startMonth = this.$moment().startOf('month')
                let endMonth = this.$moment().endOf('month')
                // let endPrevMonth = this.$moment().startOf('month').substract(1,'milliseconds')
                // let startPrevMonth = endPrevMonth.startOf('month')
                // let startNextMonth = endMonth.add(1,'ms')
                // let endNextMonth = startNextMonth.endOf('month')
                // data.push({text:'прошлый месяц',id:[startPrevMonth.format(this.format),endPrevMonth.format(this.format)]})
                data.push({text:'текущий месяц',id:[startMonth.format(this.format),endMonth.format(this.format)]})
                // data.push({text:'следующий месяц',id:[startNextMonth,endNextMonth]})

                // недели
                data.push({text:'текущая неделя',id:[this.$moment().startOf('week').format(this.format),this.$moment().endOf('week').format(this.format)]})

                return data
            },
            readonly() {
                return this.settings.readonly || false
            },
            required() {
                return this.settings.require || false
            }
        }
    }
    }
</script>

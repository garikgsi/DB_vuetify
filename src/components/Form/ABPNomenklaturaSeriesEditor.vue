<template>
    <div>
        <v-card>
            <v-card-text>
                <v-combobox
                    :value="values"
                    :items="values"
                    label="Серийные номера"
                    item-text="number"
                    item-value="i"
                    multiple
                    :clearable="false"
                    hide-selected
                    :counter="kolvo"
                    :error-messages="errorsMsg"
                    :error="isError"
                    :disabled="comboboxDisabled"
                    hint="Можно добавить новый серийный номер просто набрав его и нажав Enter"
                    persistent-hint
                    @change="changeSerials($event)"
                >
                    <template v-slot:selection="{ item }">
                        <v-menu
                            v-model="showEditForm[item.id]"
                            :close-on-content-click="false"
                            :close-on-click="false"
                            :nudge-width="200"
                            offset-y
                        >
                            <template v-slot:activator="{ on, attrs }">
                                <v-chip
                                    v-bind="attrs"
                                    v-on="on"
                                    :close="true"
                                    @click="editSn(item)"
                                    @click:close="runConfirmDeleteSn(item)"
                                >
                                    {{item.number}}
                                </v-chip>
                            </template>
                            <!-- форма редактирования серийника -->
                            <sn-form
                                :inputValue="item"
                                :kolvo="kolvo"
                                @submit="saveSn($event)"
                                @close="closeForm"
                            ></sn-form>
                        </v-menu>
                    </template>
                </v-combobox>
            </v-card-text>
        </v-card>

            <!-- диалог подтверждения удаления -->
            <abp-confirm
                v-model="showConfirmForm"
                title="Удаляем SN?"
                text="Удаление серийного номера без возможности восстановления"
                @confirmPress="deleteSn"
            ></abp-confirm>
    </div>
</template>

<script>
    import {mapActions} from 'vuex'

    import ConfirmVue from '../Dialogs/Confirm.vue'
    import SNFormVue from '../Forms/SNForm.vue'

    export default {
        name: 'abp-nomenklatura-series-editor',
        components: {
            'abp-confirm' : ConfirmVue,
            'sn-form': SNFormVue
        },
        props: {
            // массив серийников
            value: {
                type: Array,
                required: false,
                default() {
                    return []
                }
            },
            // таблица
            table: {
                type: String,
                required: true
            },
            // id
            id: {
                type: [Number , String],
                required: true
            },
            // максимальное кол-во серийников
            kolvo: {
                type: [Number , String],
                required: true,
                default: 1
            },
        },
        created() {
            if (!this.isLoaded) this.init()
        },
        data() {
            return {
                // данные
                items: [],
                // новая запись в таблице
                emptyNum : {
                    number: '',
                    end_guarantee: null,
                    id: null
                },
                // ошибка в комбобоксе
                errorsMsg: null,
                // ошибка
                isError: false,
                // форма не содержит ошибок
                formValid: false,
                // данные загружены
                isLoaded: false,
                // combobox неактивен
                isLoading: false,
                // показывать диалог подтверждения удаления серийника
                showConfirmForm: false,
                // текущий серийник
                currentItem: null,
                // показать форму редактирования
                showEditForm: {},
            }
        },
        computed: {
            // список серийников из бд
            // items() {
            //     return this.isLoaded ? this.$store.state.serials.numbers[this.table][this.id].map((item,i)=>{
            //             return {...{i:i}, ...item}
            //         }) : []
            // },
            // значения списка
            // values: {
            //     get() {
            //         return this.items
            //         // return this.value
            //     },
            //     set(newValue) {
            //     }
            // },
            boxItems() {
                if (this.isLoaded) {
                    return this.items.map((item,i)=>{
                        return {...item, ...{i:i}}
                    })
                }
                return []
            },
            values: {
                get() {
                    return this.boxItems
                },
                set() {
                    
                }
            },
            // комбобок доступен для редактирования
            comboboxDisabled() {
                return this.isLoading || !this.isLoaded
            }
        },
        methods: {
            ...mapActions(['getSerials','setSerials']),
            // получим серийные номера для записи таблицы
            init() {
                this.getSerials({table:this.table, id:this.id})
                    .then(response=>{
                        this.items = [...response]
                    })
                    .catch(()=>{
                        this.setError('Список серийных номеров загрузить не удалось')
                        this.items = []
                    })
                    .finally(()=>{
                        this.isLoaded = true
                    })
            },
            // редактирование серийника
            editSn(item) {
                this.currentItem = {...item}
                this.closeForm()
                this.showEditForm[item.id] = true
            },
            // сохраняем серийники
            saveSn(newItem) {
                let newValues = [...this.values]
                // если заменить сроки гарантии
                if (newItem.replace_guarantee) {
                    newValues = newValues.map(sn=>{
                        return {...sn, ...{end_guarantee:newItem.end_guarantee}}
                    })
                }
                // сохраняем
                this.changeSerials(newValues)
                this.closeForm()
            },
            // закрываем форму редактирования
            closeForm() {
                // обнуляем текущий серийник
                this.currentItem = null
                this.showEditForm = {...{}}
            },
            // запуск диалога подтверждения удаления
            runConfirmDeleteSn(item) {
                this.currentItem = {...item}
                this.showConfirmForm = true
            },
            // удаление серийника
            deleteSn() {
                // удаляем из значений все такие серийники
                let newValue = this.values.filter(sn=>{
                    return sn.number!=this.currentItem.number
                })
                // изменяем значение
                this.changeSerials(newValue)
                // обнуляем текущий серийник
                this.currentItem = null
                // закрывваем форму
                this.showConfirmForm = false
            },
            // установить ошибку
            setError(err) {
                this.errorsMsg = err
                this.isError = true
            },
            // очистить ошибку
            clearError() {
                this.errorsMsg = null
                this.isError = false
            },
            // изменение серийников - внесение в БД
            changeSerials(newValue) {
// console.log(`newValue=${JSON.stringify(newValue)}`)
                    this.isLoading = true
                    let res = []
                    if (newValue.length>this.kolvo) {
                        this.setError(`Вы не можете вводить больше ${this.kolvo} серийных номеров`)
                        this.items = [...this.values]
                        this.isLoading = false
                        // this.$emit('input', res)
                    } else {
                        for (let i=0; i<newValue.length; i++) {
                            let iType = typeof(newValue[i])
                            switch (iType) {
                                case 'string': {
                                    let num = newValue[i]
                                    let findResult = res.findIndex(v=>{
                                        return v.number == num
                                    })
                                    if (findResult === -1) {
                                        res.push({...this.emptyNum, ...{number: num}})
                                    } else {
                                        this.setError(`Серийный № ${num} уже добавлен`)
                                    }
                                } break;
                                case 'object': {
                                    let num = newValue[i].number
                                    if (res.findIndex(v=>{
                                        return num == v.number
                                    }) === -1) {
                                        res.push({...newValue[i]})
                                    } else {
                                        this.setError(`Серийный № ${num} уже добавлен`)
                                    }
                                }
                            }
                        }
                        // сохраняем
                        this.setSerials({table:this.table, id:this.id, data:{data:res}})
                            .then(response=>{
                                this.items = [...response]
                            })
                            .finally(()=>{
                                this.clearError()
                                this.isLoading = false
                            })
                    }
            }
        }
    }
</script>

<style lang="scss" scoped>

</style>

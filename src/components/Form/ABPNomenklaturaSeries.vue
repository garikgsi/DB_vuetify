<template>
    <div>
        <v-card>
            <v-card-text>
                <v-autocomplete
                    v-model="values"
                    :items="items"
                    label="Серийные номера"
                    no-data-text="Нет серийных номеров для выбора"
                    item-text="number"
                    item-value="id"
                    multiple
                    chips
                    :deletable-chips="true"
                    clearable
                    hide-selected
                    :counter="kolvo"
                    :disabled="!isLoaded"
                    :loading="!isLoaded"
                    hint="Выберите серийный номер из списка"
                    persistent-hint
                    @change="changeSerials($event)"
                >
                </v-autocomplete>
                <v-divider></v-divider>
            </v-card-text>
            <v-card-actions>
                <v-btn
                    :disabled="saveBtnDisabled"
                    color="primary"
                    @click="saveSerials"
                >OK</v-btn>
            </v-card-actions>
        </v-card>
    </div>
</template>

<script>
    import {mapActions} from 'vuex'

    export default {
        name: 'abp-nomenklatura-series',
        components: {
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
                // ошибка в комбобоксе
                errorsMsg: null,
                // данные загружены
                isDataLoaded: false,
                // список загружен
                isListLoaded: false,
                // список
                items: [],
                // значения
                values: []
            }
        },
        computed: {
            saveBtnDisabled() {
                return !this.isLoaded || this.values.length>this.kolvo
            },
            isLoaded() {
                return this.isDataLoaded && this.isListLoaded
            }
        },
        methods: {
            ...mapActions(['getSerialList','getSerials','setSerials']),
            init() {
                // получим допустимые серийные номера
                this.getSerialList({table:this.table, id:this.id})
                    .then(response=>{
                        if (response) {
                            this.items = response.map((item)=>{
                                return {id:item.id, number:item.number}
                            })
                            // получим список уже внесенных серийников
                            this.getSerials({table:this.table, id:this.id})
                                .then(response=>{
                                    this.values = response.map((item)=>{
                                        // вернем только id серийного №
                                        return item.id
                                    })
                                })
                                .catch(e=>{
                                    this.errorsMsg = 'Список выбранных серийных номеров загрузить не удалось'
                                    this.values = []
                                    console.log(JSON.stringify(e))
                                })
                                .finally(()=>{
                                    this.isListLoaded = true
                                })
                        }
                    })
                    .catch(e=>{
                        this.errorsMsg = 'Список серийных номеров загрузить не удалось'
                        this.items = []
                        console.log(JSON.stringify(e))
                    })
                    .finally(()=>{
                        this.isDataLoaded = true
                    })
            },
            changeSerials(newValue) {
                let res = []
                if (newValue.length>this.kolvo) {
                    this.errorsMsg = `Вы не можете выбрать больше ${this.kolvo} серийных номеров`
                    res = [...this.values]
                } else {
                    res = [...newValue]
                }
                this.$emit('input', res)
            },
            // изменение серийников - внесение в БД
            saveSerials() {
                // сохраняем
                this.setSerials({table:this.table, id:this.id, data:{data:this.values}})
                    .then(()=>{
                        this.isDataLoaded = false
                        this.isListLoaded = false
                        // this.$emit('input', res)
                    })
                    .finally(()=>{
                        this.errorsMsg = null
                        this.$emit('close')
                    })
            }
        }
    }
</script>

<style lang="scss" scoped>

</style>

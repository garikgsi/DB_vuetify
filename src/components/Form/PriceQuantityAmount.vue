<template>
    <div>
        <v-row dense no-gutters>
            <v-col cols="4">
                <v-text-field
                value="price"
                type="number"
                label="Цена"
                :readonly="readonly"
                hint="Введите цену единицы товара"
                @input="changePrice($event)"
                ></v-text-field>
            </v-col>
            <v-col cols="4">
                <v-text-field
                value="quantity"
                type="number"
                label="Кол-во"
                :readonly="readonly"
                prefix="*"
                hint="Введите количество товара"
                @input="changeQuantity($event)"
                ></v-text-field>
            </v-col>
            <v-col cols="4">
                <v-text-field
                value="amount"
                type="number"
                label="Сумма"
                :readonly="readonly"
                prefix="="
                @input="changeAmount($event)"
                ></v-text-field>
            </v-col>
        </v-row>
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
                type : Object,
                required: true
            },
            settings: {
                type: Object,
                required: false
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
            changePrice(newVal) {
                let s = this.kolvo * newVal
                this.$emit('input', this.constructData(newVal,this.quantity,s))
            },
            changeQuantity(newVal) {
                let s = this.price * newVal
                this.$emit('input', this.constructData(this.price,newVal,s))
            },
            changeAmount(newVal){
                let p = newVal / this.quantity
                this.$emit('input', this.constructData(p,this.quantity,newVal))
            },
            constructData(p,q,a) {
                this.inputValue = {'price':p,'quantity':q,'amount':a}
                return {'price':p,'quantity':q,'amount':a}
            }
        },
        computed: {
            rules() {
                if (!this.readonly && this.required) {
                    return [
                        v => !!v || `Заполните ${this.settings.label}`,
                    ]
                } else {
                    return [
                        true
                    ]
                }
            },
            price() {
                return this.inputValue.price
            },
            quantity() {
                return this.inputValue.quantity
            },
            amount() {
                return this.inputValue.amount
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

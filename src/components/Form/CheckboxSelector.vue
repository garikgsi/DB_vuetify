<template>
    <div>
        <span>{{settings.label}}</span>
        <v-container fluid row>
            <v-checkbox
                v-for="(item, i) in settings.items"
                :key="`radio_${i}`"
                :input-value="inputValue"
                :label="item.text"
                :value="item.id"
                :color="item.color || defColor"
                :rules="rules"
                @change="changeInput($event)"
            ></v-checkbox>
        </v-container>
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
                defColor: 'blue',
            }
        },
        mounted() {
            this.$emit('loaded')
        },
        methods: {
            changeInput(newValue) {
                this.$emit('input',newValue)
            },
        },
        computed: {
            rules() {
                if (this.required && !this.readonly) {
                    if (this.isMulti) {
                        return [
                            v => v.length>0 || this.requireMsg
                        ]
                    } else {
                        return [
                            v => !!v || this.requireMsg
                        ]
                    }
                } else {
                    return [
                        true
                    ]
                }
            },
            isMulti() {
                return this.settings.multiple || false
            },
            requireMsg() {
                if (!this.isMulti) {
                    return 'Необходимо выбрать одно из значений'
                } else {
                    return 'Необходимо выбрать одно или несколько значений'
                }
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

<style lang="scss" scoped>

</style>

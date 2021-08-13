<template>
    <div>
        <v-radio-group
            :value="inputValue"
            row
            :label="title"
            :mandatory="true"
            :disabled="readonly"
            :multiple="false"
            @change="changeInput($event)"
            :rules="rules"
        >
            <template
                v-if="items"
            >
                <v-radio
                    v-for="(item, i) in items"
                    :key="`radio_${i}`"
                    :label="item.text"
                    :value="item.id"
                    :color="item.color || defColor"
                ></v-radio>
            </template>
        </v-radio-group>
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
            items: {
                required: true
            },
            // settings: {
            //     type: Object,
            //     required: false
            // },
            title: {
                type: String,
                required: false
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
            }
        },
        data() {
            return {
                defColor: 'blue'
            }
        },
        mounted() {
            this.$emit('loaded')
        },
        methods: {
            changeInput(newValue) {
                // console.log(`radio-input changed to ${newValue}`)
                this.$emit('input',newValue)
            },
        },
        computed: {
            rules() {
                if (this.required && !this.readonly) {
                    return [
                        v => !!v || 'Необходимо выбрать одно из значений'
                    ]
                } else {
                    return [
                        true
                    ]
                }
            },
            required() {
                return this.require || false
            }
        }
    }
</script>


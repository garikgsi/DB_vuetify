<template>
    <span @click="clickOpenDialog">
        <slot></slot>
        <v-dialog
            v-model="openDialog"
            :disabled="disabled"
            max-width="300"
        >
            <v-card>
                <v-card-title>{{title}}</v-card-title>
                <v-card-text>{{text}}</v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                        v-for="(button,i) in buttons"
                        :key="`btn_${i}`"
                        :color="button.color"
                        @click="btnClick(button.action)"
                    >{{button.title}}</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </span>
</template>

<script>
    export default {
        name: 'abp-confirm',
        props: {
            value: {
                type: Boolean,
                required: false,
                default: false
            },
            disabled: {
                type : Boolean,
                default: false
            },
            title: {
                type : String,
                default: 'Подтвердите действие'
            },
            text: {
                type : String,
                default: ''
            },
            buttons: {
                type : Array,
                default: function() {
                    return [
                        {title:'Да', action: 'confirmPress', color: 'error'},
                        {title:'Нет', action: 'close', color: 'success'},
                    ]
                }
            }
        },
        computed: {
            openDialog: {
                get() {
                    return this.value
                },
                set(newValue) {
                    this.$emit('input',newValue)
                }
            }
        },
        methods: {
            btnClick(action) {
                if (action!=='close') {
                    this.$emit(action)
                }
                this.openDialog = false
            },
            clickOpenDialog() {
                if (!this.disabled) this.openDialog = true
            }
        }
    }
</script>

<style lang="scss" scoped>

</style>

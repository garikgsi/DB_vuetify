<template>
        <v-dialog
            v-model="openDialog"
            :disabled="disabled"
            max-width="300"
        >
            <template v-slot:activator="{ on, attrs }">
                <slot name="activator" v-bind="{ on, attrs }"></slot>
            </template>

            <v-card>
                <v-card-title>{{title}}</v-card-title>
                <v-card-text>{{text}}</v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                        v-for="(button,i) in buttons"
                        :key="`btn_${i}`"
                        :color="button.color"
                        @click.stop="btnClick(button.action)"
                    >{{button.title}}</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
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
            },
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
            // clickOpenDialog() {
            //     if (!this.disabled) this.openDialog = true
            // }
        }
    }
</script>

<style lang="scss" scoped>

</style>

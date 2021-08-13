<template>
    <confirm
        v-model="showConfirmForm"
        :title="title"
        :text="text"
        :disabled="disabled"
        @confirmPress="click"
    >
        <slot>
            <abp-icon-button
                v-if="icon"
                :icon="icon"
                :tip="tip"
                :clickStop="true"
                :disabled="disabled"
                @click="showConfirmForm = !showConfirmForm"
            ></abp-icon-button>
            <v-btn
                v-else
                @click="showConfirmForm = !showConfirmForm"
                :disabled="disabled"
                v-bind="btnProps"
            >
                {{btnText}}
            </v-btn>
        </slot>
    </confirm>
</template>

<script>
import ConfirmVue from '../Dialogs/Confirm.vue'
import ABPIconButtonVue from './ABPIconButton.vue'
    export default {
        name: 'abp-delete-button',
        components: {
            'abp-icon-button' : ABPIconButtonVue,
            'confirm': ConfirmVue
        },
        props: {
            // Заголовок формы
            title: {
                type : String,
                required: false,
                default: ''
            },
            // Текст формы
            text: {
                type : String,
                required: false,
                default: ''
            },
            // текст кнопки, если icon == null
            btnText: {
                type: String,
                required: false
            },
            // свойства кнопки, если это не стандартный icon-button
            btnProps: {
                type: Object,
                required: false
            },
            // подсказка
            tip: {
                type : String,
                required: false,
                default: 'удалить'
            },
            // иконка
            icon: {
                type : String,
                required: false,
                default: 'mdi-delete'
            },
            disabled: {
                type: Boolean,
                required: false,
                default: false
            },
            color: {
                type : String,
                required: false,
                default: null
            },
            // игнорировать таб при переходе
            disableTab: {
                type: Boolean,
                required: false,
                default: false
            },

        },
        data() {
            return {
                showConfirmForm: false
            }
        },
        methods: {
            click(event) {
                if (event && this.clickStop) {
                    event.stopPropagation()
                }
                this.$emit('click')
            }
        },
        computed: {
            tabIndex() {
                return this.disableTab ? -1 : null
            }
        }
    }
</script>

<style lang="scss" scoped>

</style>

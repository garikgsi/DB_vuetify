<template>
        <v-btn
            icon
            @click="click"
            :disabled="disabled"
            :tabindex="tabIndex"
            :to="to"
        >
            <abp-icon
                :icon="icon"
                :tip="tip"
                :color="color"
            ></abp-icon>
        </v-btn>
</template>

<script>
    import ABPIcon from './ABPIcon'
    export default {
        name: 'abp-icon-button',
        components: {
            'abp-icon' : ABPIcon
        },
        props: {
            // значок
            icon: {
                type : String,
                required: true,
            },
            // подсказка
            tip: {
                type : String,
                required: false,
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
            // Остановить дальнейшую обработку событий stopPropagation
            clickStop: {
                type:Boolean,
                required: false,
                default: true
            },
            // игнорировать таб при переходе
            disableTab: {
                type: Boolean,
                required: false,
                default: false
            },
            // ссылка перехода
            to: {
                type: [String , Object],
                required: false,
            }

        },
        data() {
            return {
                show: false
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

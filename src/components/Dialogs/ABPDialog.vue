<template>
    <div>
        <v-dialog
            :value="inputValue"
            persistent
            :retain-focus=false
            :width="width"
            :disabled="disabled"
            @input="changeInput($event)"
        >
            <v-card>
                <v-toolbar
                    dark
                >
                    <v-toolbar-title v-if="title">{{title}}</v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-btn
                        icon
                        @click="changeInput(false)"
                    >
                        <v-icon>{{icons.close}}</v-icon>
                    </v-btn>
                </v-toolbar>
                <v-card-text
                    :class="{'no-padding': dense}"
                >
                    <slot></slot>
                </v-card-text>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
    import { mapGetters } from 'vuex'
    export default {
        name: 'abp-dialog',
        model: {
            prop: "inputValue",
            event: "input"
        },
        props: {
            inputValue: {
                type: Boolean,
                required: true,
            },
            title: {
                type: String,
                required: false
            },
            width: {
                type: [String , Number],
                required: false,
                default: 'auto'
            },
            disabled: {
                type: Boolean,
                required: false,
                default: false
            },
            fullscreen: {
                type: Boolean,
                required: false,
                default: false
            },
            dense:{
                type: Boolean,
                required: false,
                default: true
            }
        },
        data() {
            return {

            }
        },
        methods: {
            changeInput(newValue) {
                this.$emit('input',newValue)
            }
        },
        computed: {
            ...mapGetters(['icons']),
        },
    }
</script>

<style lang="scss" scoped>
    .no-padding {
        padding: 0 !important;
    }
</style>

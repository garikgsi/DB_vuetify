<template>
    <div class="submitMsg">
        <v-alert
            class="abp-alert"
            v-model="showMsg"
            :color="msgColor"
            border="left"
            elevation="2"
            colored-border
            dismissible
            dense
            :icon="icon"
            @input="changeInput($event)"
        >
            <p v-if="title" :style="{color: msgColor}" class="msgTitle">{{title}}</p>
            <slot></slot>
        </v-alert>
        <v-progress-linear
            v-if="showProgress"
            :value="loading"
            :buffer-value="100"
            :color="msgColor"
        ></v-progress-linear>
    </div>
</template>

<script>
    export default {
        name: 'abp-message',
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
            color: {
                type: String,
                required: false,
                default: 'success'
            },
            icon: {
                type: String,
                required: false,
                default: null
            },
            timeout: {
                type: Number,
                required: false,
                default: 5000
            },
        },
        created() {
            this.showMsg = false
            this.loading = 0
        },
        data() {
            return {
                loading: 0
            }
        },
        methods: {
            changeInput(newVal) {
                this.$emit('input',newVal)
            },
        },
        computed: {
            showMsg: {
                get() {
                    return this.inputValue
                },
                set(newVal) {
                    this.$emit('input',newVal)
                }
            },
            msgColor() {
                switch (this.color) {
                    case 'success': {
                        return '#009688'
                    }
                    case 'error': {
                        return '#EF5350'
                    }
                    case 'warning': {
                        return '#FF6D00'
                    }
                    case 'primary': {
                        return '#0091EA'
                    }
                    default: {
                        return this.color
                    }
                }
            },
            showProgress() {
                if (this.timeout && this.timeout>0) return true; else return false
            },
        },
        watch: {
            showMsg: function (val) {
                if (val) {
                    if(this.showProgress) {
                        // получим 1/100 задержки
                        let ed = parseInt(this.timeout/100)

                        // повторить с интервалом 1/100 задержки
                        let timerId = setInterval(() => {
                            this.loading+=1
                            if (this.loading==100) {
                                clearInterval(timerId)
                                this.showMsg = false
                            }
                        }, ed)
                    }
                } else {
                    this.loading = 0
                }
            }
        }
    }
</script>

<style lang="scss" scoped>
    ::v-deep .abp-alert {
        margin-bottom: 4px !important;
    }

    ::v-deep .submitMsg {

        position: fixed;
        top: 10px;
        left: 10px;


        .msgTitle {
            text-align: center;
            font-weight: bold;
        }
    }
</style>

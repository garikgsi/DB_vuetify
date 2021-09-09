<template>
    <div>
        <abp-callout>
            <v-row
                align="center"
                no-gutters
            >
                <v-col 
                    class="grow"
                    cols="12"
                    md="6"
                >
                    <slot></slot>
                </v-col>
                <v-spacer
                    :color="color"
                ></v-spacer>
                <v-col 
                    class="shrink text-right my-4 my-md-1"
                    cols="12"
                    md="6"
                >
                <v-btn
                    text
                    :color="color"
                    @click="goBack"
                    :replace="true"
                >
                    Надоело ждать
                </v-btn>
                </v-col>
            </v-row>
        </abp-callout>
    </div>
</template>

<script>
    import ABPCallout from './ABPCallout.vue'
    import { mapGetters } from 'vuex'

    export default {
        components: {
            'abp-callout' : ABPCallout,
        },
        props: {
            loading: {
                type: Boolean,
                require: false,
                default: false
            },
            color: {
                type: String,
                require: false,
                default: 'primary'
            },
        },
        computed: {
            ...mapGetters(['prevRoute']),
        },
        methods: {
            goBack() {
                this.$router.go(-1)
            }
        }
    }
</script>

<style lang="scss" scoped>

</style>

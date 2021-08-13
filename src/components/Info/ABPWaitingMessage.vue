<template>
    <div>
        <abp-callout>
            <v-row
                align="center"
                no-gutters
            >
                <v-col class="grow">
                    <slot></slot>
                </v-col>
                <v-spacer
                    :color="color"
                ></v-spacer>
                <v-col class="shrink">
                <v-btn
                    text
                    :color="color"
                    :to="prevRoute"
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
    }
</script>

<style lang="scss" scoped>

</style>
